const { WebSocket } = require('ws');
const jwt = require('jsonwebtoken');
const config = require('../config');
const Message = require('../Tables/Message.js');
const User = require('../Tables/User.js');

// WebSocket method handlers
const api = new Map();

// Active rooms: roomId -> Set of {userId, websocketConnection}
const rooms = new Map();

// Maximum users allowed per room
const MAX_USERS_PER_ROOM = 100;

/**
 * Verifies and decodes a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded user data or null if invalid
 */
function verifySocketToken(token) {
    if (!token) return null;
    
    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        return {
            userId: decoded.userId,
            username: decoded.username,
            email: decoded.email
        };
    } catch (error) {
        return null;
    }
}

/**
 * Sends authentication error to client
 * @param {WebSocket} websocketConnection - Client WebSocket connection
 * @param {string} message - Error message to send
 */
function sendAuthError(websocketConnection, message) {
    if (websocketConnection.readyState === WebSocket.OPEN) {
        websocketConnection.send(JSON.stringify({
            method: 'auth-error',
            message: message || 'Authentication failed. Please login again.'
        }));
    }
}

/**
 * Routes incoming WebSocket messages to appropriate handlers
 * @param {Object} req - Message request object
 * @param {Set} clients - Set of connected WebSocket clients
 * @param {WebSocket} ws - WebSocket connection
 * @returns {Promise<any>} Handler result
 */
const handleMessage = async (req, clients, ws) => {
    if (api.has(req.method)) {
        const requestMethod = api.get(req.method);
        return await requestMethod(req, clients, ws);
    }
}

/**
 * Handler: send-message
 * Authenticates user, saves message to database, and broadcasts to room
 * @requires JWT token for authentication
 */
api.set("send-message", async (req, clients, ws) => {
    try {
        const content = req.message;
        const roomId = req.room;
        const token = req.token;
        const authUser = verifySocketToken(token) || ws.user;

        if (!authUser) {
            sendAuthError(ws, 'Authentication required to send messages.');
            return;
        }

        if (!content || !roomId) {
            console.error('[WebSocket] Missing required fields: message or room');
            return;
        }

        const user = await User.findOne({ username: authUser.username });
        if (!user) {
            console.error(`[WebSocket] User not found: ${authUser.username}`);
            return;
        }

        // Save message to database
        const newMessage = new Message({
            author: authUser.username,
            authorId: user.userId,
            content: content,
            roomId: roomId
        });

        const savedMessage = await newMessage.save();

        // Broadcast message to room
        sendMessageToRoom(roomId, authUser.username, content, savedMessage);

        return savedMessage;
    } catch (error) {
        console.error('Error saving message:', error);
    }
})

/**
 * Handler: join-room
 * Authenticates user, adds to room, sends message history, and broadcasts presence
 * @requires JWT token for authentication
 */
api.set("join-room", async (req, clients, websocketConnection) => {
    try {
        const roomId = req.room;
        const token = req.token;
        const authUser = verifySocketToken(token);

        if (!authUser) {
            sendAuthError(websocketConnection, 'Authentication required to join rooms.');
            return;
        }

        const userId = authUser.username;
        websocketConnection.user = authUser;

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

        // Enforce max users per room
        if (roomUsers.size >= MAX_USERS_PER_ROOM) {
            console.warn(`⚠️ Room ${roomId} is full (${MAX_USERS_PER_ROOM} users). Rejecting ${userId}`);
            if (websocketConnection.readyState === WebSocket.OPEN) {
                websocketConnection.send(JSON.stringify({
                    method: 'room-full',
                    roomId: roomId,
                    maxUsers: MAX_USERS_PER_ROOM,
                    message: `Room ${roomId} is full. Max users: ${MAX_USERS_PER_ROOM}.`
                }));
            }
            return;
        }

        // Add the user with their new websocket connection
        roomUsers.add({ userId, websocketConnection });

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
                    formattedTime: new Date(msg.timestamp).toLocaleTimeString('en-AU', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        timeZone: 'Australia/Melbourne' 
                    })
                })),
                count: messageHistory.length
            }));
        }

        // Broadcast updated users list to all users in the room
        broadcastRoomUsers(roomId);

        // Broadcast presence update
        broadcastPresence(roomId, userId, 'online');
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

        return messages.map(msg => ({
            messageId: msg.messageId,
            author: msg.author,
            message: msg.content,
            timestamp: msg.timestamp,
            formattedTime: new Date(msg.timestamp).toLocaleTimeString('en-AU', { 
                hour: '2-digit', 
                minute: '2-digit',
                timeZone: 'Australia/Melbourne' 
            })
        }));
    } catch (error) {
        console.error('Error fetching messages:', error);
        return [];
    }
});

api.set("leave-room", async (req, clients, websocketConnection) => {
    let roomId = req.room;
    const token = req.token;
    const authUser = verifySocketToken(token) || websocketConnection.user;
    let userId = authUser?.username || req.username;

    if (rooms.has(roomId)) {
        const roomUsers = rooms.get(roomId);
        // Remove user from room
        roomUsers.forEach(user => {
            if (user.userId === userId) {
                roomUsers.delete(user);
            }
        });
        
        // Broadcast updated users list to remaining users in the room
        broadcastRoomUsers(roomId);

        // Broadcast presence update
        broadcastPresence(roomId, userId, 'offline');
    }
});

/**
 * Handler: typing
 * Broadcasts typing indicator to room members
 * @requires JWT token for authentication
 */
api.set("typing", async (req, clients, websocketConnection) => {
    const roomId = req.room;
    const token = req.token;
    const authUser = verifySocketToken(token) || websocketConnection.user;
    
    if (!authUser || !roomId) return;
    broadcastTyping(roomId, authUser.username, true);
});

/**
 * Handler: stop-typing
 * Removes typing indicator for user
 * @requires JWT token for authentication
 */
api.set("stop-typing", async (req, clients, websocketConnection) => {
    const roomId = req.room;
    const token = req.token;
    const authUser = verifySocketToken(token) || websocketConnection.user;
    
    if (!authUser || !roomId) return;
    broadcastTyping(roomId, authUser.username, false);
});

/**
 * Broadcasts a new message to all users in a room
 * @param {string} roomId - Room ID to broadcast to
 * @param {string} userId - Author username
 * @param {string} message - Message content
 * @param {Object} savedMessage - Saved message object from database
 */
function sendMessageToRoom(roomId, userId, message, savedMessage = null) {
    if (!rooms.has(roomId)) return;

    const roomUsers = rooms.get(roomId);
    const messagePayload = {
        method: 'new-message',
        author: userId,
        message: message,
        messageId: savedMessage?.messageId || null,
        timestamp: savedMessage?.timestamp || new Date(),
        formattedTime: (savedMessage?.timestamp || new Date()).toLocaleTimeString('en-AU', { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'Australia/Melbourne' 
        })
    };

    roomUsers.forEach(user => {
        const client = user.websocketConnection;
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(messagePayload));
        }
    });
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

/**
 * Broadcasts user presence status (online/offline) to room
 * @param {string} roomId - Room ID to broadcast to
 * @param {string} userId - Username
 * @param {string} status - 'online' or 'offline'
 */
function broadcastPresence(roomId, userId, status) {
    if (!rooms.has(roomId)) return;

    const roomUsers = rooms.get(roomId);
    roomUsers.forEach(user => {
        if (user.websocketConnection && user.websocketConnection.readyState === WebSocket.OPEN) {
            user.websocketConnection.send(JSON.stringify({
                method: 'user-presence',
                roomId: roomId,
                user: userId,
                status
            }));
        }
    });
}

/**
 * Broadcasts typing indicator to room (excluding sender)
 * @param {string} roomId - Room ID to broadcast to
 * @param {string} userId - Username of person typing
 * @param {boolean} isTyping - Typing state
 */
function broadcastTyping(roomId, userId, isTyping) {
    if (!rooms.has(roomId)) return;

    const roomUsers = rooms.get(roomId);
    roomUsers.forEach(user => {
        if (user.userId === userId) return;
        if (user.websocketConnection && user.websocketConnection.readyState === WebSocket.OPEN) {
            user.websocketConnection.send(JSON.stringify({
                method: 'typing',
                roomId: roomId,
                user: userId,
                isTyping
            }));
        }
    });
}

module.exports = {
    handleMessage,
    api, // if you need to use 'api' in another file
    rooms, // Export rooms Map for REST API access
    broadcastPresence
};