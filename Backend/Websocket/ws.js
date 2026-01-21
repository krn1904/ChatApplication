const { WebSocket } = require('ws');
const Message = require('../Tables/Message.js');
const User = require('../Tables/User.js');

const api = new Map(); // Maps method names to handler functions
const rooms = new Map(); // Maps roomId -> Set of {userId, websocketConnection}

 const handleMessage = async (req, clients, ws) => {

    if (api.has(req.method)){

        let requectMethod = api.get(req.method);

        let res = await requectMethod(req, clients, ws)

        return res
    }

}

// When message has been send set the message to the respective room.
api.set("send-message", async (req, clients, ws) => {
    try {
        const content = req.message;
        const author = req.author;
        const roomId = req.room;

        if (!content || !author || !roomId) {
            console.error('Missing required fields: message, author, or room');
            return;
        }

        // Get authorId from username
        const user = await User.findOne({ username: author });
        if (!user) {
            console.error(`User not found: ${author}`);
            return;
        }

        // Save message to database
        const newMessage = new Message({
            author: author,
            authorId: user.userId,
            content: content,
            roomId: roomId
        });

        const savedMessage = await newMessage.save();
        console.log(`✅ Message saved to DB by ${author} in room ${roomId}`);

        // Broadcast message to room
        sendMessageToRoom(author, content, clients, ws, savedMessage);

        return savedMessage;
    } catch (error) {
        console.error('Error saving message:', error);
    }
})

api.set("join-room", async (req, clients, websocketConnection) => {
    try {
        const roomId = req.room;
        const userId = req.username || req.user;

        // If room doesn't exist, create a new one
        if (!rooms.has(roomId)) {
            rooms.set(roomId, new Set());
        }

        const roomUsers = rooms.get(roomId);

        // Remove any existing connection for this user (handles refresh/reconnect)

        // Remove old connection if user exists (on refresh, old WebSocket closes but new one connects before cleanup)
        // Without this, user would have stale connection that can't receive/send messages
        roomUsers.forEach(user => {
            if (user.userId === userId) {
                roomUsers.delete(user);
            }
        });

        // Add the user with their new websocket connection
        roomUsers.add({ userId, websocketConnection });

        console.log(`✅ User ${userId} joined room ${roomId}`);

        // Fetch message history from database (last 50 messages)
        const messageHistory = await Message.find({ roomId: roomId })
            .sort({ timestamp: -1 })
            .limit(50)
            .lean();

        // Reverse to get chronological order (oldest first)
        messageHistory.reverse();

        // Send message history to the user who just joined
        if (websocketConnection.readyState === WebSocket.OPEN) {
            websocketConnection.send(JSON.stringify({
                method: 'message-history',
                roomId: roomId,
                messages: messageHistory.map(msg => ({
                    messageId: msg.messageId,
                    author: msg.author,
                    message: msg.content,
                    timestamp: msg.timestamp,
                    formattedTime: new Date(msg.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    })
                })),
                count: messageHistory.length
            }));

            console.log(`📤 Sent ${messageHistory.length} messages to ${userId} in room ${roomId}`);
        }

        // Broadcast updated users list to all users in the room
        broadcastRoomUsers(roomId);
    } catch (error) {
        console.error('Error in join-room:', error);
    }
})

api.set("get-chats", async (req) => {
    let chats = req.params.withUser;
})

api.set("get-messages", async (req) => {
    try {
        const roomId = req.room;
        const limit = req.limit || 50;
        const skip = req.skip || 0;

        // Fetch messages from database with pagination
        const messages = await Message.find({ roomId: roomId })
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Reverse to get chronological order
        messages.reverse();

        console.log(`📥 Fetched ${messages.length} messages for room ${roomId}`);

        return messages.map(msg => ({
            messageId: msg.messageId,
            author: msg.author,
            message: msg.content,
            timestamp: msg.timestamp,
            formattedTime: new Date(msg.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        }));
    } catch (error) {
        console.error('Error fetching messages:', error);
        return [];
    }
});

api.set("leave-room", async (req, clients, websocketConnection) => {
    let roomId = req.room;
    let userId = req.username;

    if (rooms.has(roomId)) {
        const roomUsers = rooms.get(roomId);
        // Remove user from room
        roomUsers.forEach(user => {
            if (user.userId === userId) {
                roomUsers.delete(user);
            }
        });
        console.log(`User ${userId} left room ${roomId}`);
        
        // Broadcast updated users list to remaining users in the room
        broadcastRoomUsers(roomId);
    }
});

// Function to send a message to all users in a room
function sendMessageToRoom(userId, message, clients, ws, savedMessage = null) {

    clients.forEach(function each(client) {
          if (client.readyState === WebSocket.OPEN) {
            const MsgObj = {
                method: 'new-message',
                author: userId,
                message: message,
                messageId: savedMessage?.messageId || null,
                timestamp: savedMessage?.timestamp || new Date(),
                formattedTime: (savedMessage?.timestamp || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              };
            client.send(JSON.stringify(MsgObj));
          }
        })
    
}

/**
 * Broadcasts updated user list to all users in a room
 * Called when: user joins, user leaves, or connection closes
 * 
 * @param {string} roomId - The room ID to broadcast to
 */
function broadcastRoomUsers(roomId) {
    if (!rooms.has(roomId)) return;

    const roomUsers = rooms.get(roomId);
    const usersList = Array.from(roomUsers).map(user => user.userId);

    console.log(`📢 Broadcasting ${usersList.length} users in room ${roomId}`);

    // Send to all clients in the room
    roomUsers.forEach(user => {
        if (user.websocketConnection && user.websocketConnection.readyState === WebSocket.OPEN) {
            user.websocketConnection.send(JSON.stringify({
                method: 'room-users-update',
                roomId: roomId,
                users: usersList
            }));
        }
    });
}

module.exports = {
    handleMessage,
    api, // if you need to use 'api' in another file
    rooms, // Export rooms Map for REST API access
};