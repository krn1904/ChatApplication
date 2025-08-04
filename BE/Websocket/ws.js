const { WebSocket } = require('ws');
const Message = require('../models/Message');

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

module.exports = {
    handleMessage,
    handleDisconnect,
};