const { WebSocket } = require('ws');
const Message = require('../models/Message');

const api = new Map();
const roomMessages = new Map();

const handleMessage = async (data, clients, sender, rooms) => {
    try {
        switch (data.method) {
            case 'join-room':
                // Add user to room
                if (!rooms.has(data.room)) {
                    rooms.set(data.room, new Set());
                }
                const room = rooms.get(data.room);
                
                // Store user info with the WebSocket client
                sender.username = data.username || data.author;
                sender.roomId = data.room;
                room.add({
                    username: sender.username,
                    id: sender.id,
                    ws: sender
                });

                // Send message history
                const messageHistory = await Message.find({ room: data.room })
                    .sort({ createdAt: 1 })
                    .limit(100);
                
                sender.send(JSON.stringify({
                    method: 'message-history',
                    messages: messageHistory
                }));

                // Broadcast updated user list to all clients in the room
                const roomUsers = Array.from(room).map(user => ({
                    username: user.username,
                    id: user.id
                }));
                
                clients.forEach(client => {
                    if (client.roomId === data.room && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            method: 'room-users',
                            users: roomUsers
                        }));
                    }
                });
                break;

            case 'send-message':
                // Save message to database
                const newMessage = new Message({
                    author: data.author,
                    message: data.message,
                    room: data.room,
                    timestamp: data.timestamp
                });
                await newMessage.save();

                // Broadcast to all clients in the same room
                clients.forEach(client => {
                    if (client !== sender && client.roomId === data.room && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            method: 'new-message',
                            author: data.author,
                            message: data.message,
                            room: data.room,
                            timestamp: data.timestamp
                        }));
                    }
                });
                break;

            default:
                console.log('Unknown message type:', data.method);
        }
    } catch (error) {
        console.error('Error handling message:', error);
        sender.send(JSON.stringify({
            method: 'error',
            message: 'Failed to process message'
        }));
    }
};

const handleDisconnect = (ws, clients, rooms) => {
    if (ws.roomId && rooms.has(ws.roomId)) {
        const room = rooms.get(ws.roomId);
        
        // Find and remove the user object that contains this WebSocket
        for (const user of room) {
            if (user.ws === ws) {
                room.delete(user);
                break;
            }
        }

        // Broadcast updated user list to remaining clients in the room
        const roomUsers = Array.from(room).map(user => ({
            username: user.username,
            id: user.id
        }));
        
        clients.forEach(client => {
            if (client.roomId === ws.roomId && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    method: 'room-users',
                    users: roomUsers
                }));
            }
        });

        // Clean up empty rooms
        if (room.size === 0) {
            rooms.delete(ws.roomId);
        }
    }
};

// When message has been send set the message to the respective room.
api.set("send-message", async (req, clients, ws) => {
    const { message, author: senderId, room: recieverId } = req;

    try {
        // Store message in MongoDB
        const newMessage = new Message({
            senderId: parseInt(senderId),
            recieverId: parseInt(recieverId),
            message: message
        });
        await newMessage.save();

        // Check if the room exists, if not, create a new room
        if (!roomMessages.has(recieverId)) {
            roomMessages.set(recieverId, []);
        }

        // Save the message to the in-memory room messages
        if (message) {
            roomMessages.get(recieverId).push({ senderId, message });
            sendMessageToRoom(senderId, message, clients, ws);
            console.log(`Message sent by ${senderId} to ${recieverId}: ${message}`);
        }
    } catch (error) {
        console.error('Error saving message:', error);
    }
})

api.set("joinRoom", async (req, clients, websocketConnection) => {
    let roomId = req.room;
    let userId = req.user;

    const websocketConnectionObj = { websocketConnection }

    // If room is not available then set a new one
    if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
    }

    // Add the user to the room
     rooms.get(roomId).add({userId, websocketConnectionObj });
    
    // only purpose to disdplay all the
    //   rooms.forEach((users, roomId) => {
    //     console.log(`Room ${roomId}: ${Array.from(users).join(', ')}`);
    //   });
})

api.set("get-chats", async (req) => {
    try {
        const userId = req.params.withUser;
        // Fetch all messages where the user is either sender or receiver
        const messages = await Message.find({
            $or: [
                { senderId: userId },
                { recieverId: userId }
            ]
        }).sort({ createdAt: -1 });
        return messages;
    } catch (error) {
        console.error('Error fetching chats:', error);
        return [];
    }
})

api.set("get-messages", async (req) => {
    try {
        const { room: recieverId, user: senderId } = req;
        // Fetch messages between these two users
        const messages = await Message.find({
            $or: [
                { senderId: senderId, recieverId: recieverId },
                { senderId: recieverId, recieverId: senderId }
            ]
        }).sort({ createdAt: 1 });
        return messages;
    } catch (error) {
        console.error('Error fetching messages:', error);
        return [];
    }
});

function sendMessageToRoom(userId, message, clients, ws) {
    clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            const MsgObj = {
                method: 'send-message',
                author: userId,
                message: message,
                timestamp: new Date().toISOString(),
            };
            client.send(JSON.stringify(MsgObj));
        }
    });
}

module.exports = {
    handleMessage,
    handleDisconnect,
    api,
};