const express = require('express');
const http = require("http");
const { WebSocket } = require("ws");
const cors = require('cors');
const { handleMessage, handleDisconnect } = require('./Websocket/ws');
const userRoutes = require('./routes/userRoutes');
const connectDB = require('./config/db.config');
const messageRoutes = require('./routes/messageRoutes');
require('dotenv').config();
const config = require('./config');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());

// Store WebSocket server and rooms map in app for route access
const rooms = new Map();
app.set('rooms', rooms);

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

const port = config.SERVER_PORT || 8001;
const server = http.createServer(app);

// WebSocket server configuration
const wss = new WebSocket.Server({
    server,
    clientTracking: true,
    pingTimeout: 30000,
    pingInterval: 10000
});

// Store WebSocket server in app
app.set('wss', wss);

// Store clients with additional metadata
const clients = new Map();

const heartbeat = (ws) => {
    ws.isAlive = true;
};

// const broadcastMessage = (message, roomId, sender) => {
//     clients.forEach((client) => {
//         if (client.roomId === roomId && client !== sender && client.readyState === WebSocket.OPEN) {
//             client.send(JSON.stringify(message));
//         }
//     });
// };

const initConnection = (ws) => {
    ws.isAlive = true;
    ws.id = Date.now();
    clients.set(ws.id, ws);

    ws.on('pong', () => heartbeat(ws));

    ws.on('message', async (data) => {
        try {
            const req = JSON.parse(data);
            
            // Store room and author information with the client
            if (req.room) {
                ws.roomId = req.room;
            }
            if (req.author) {
                ws.author = req.author;
            }
            
            await handleMessage(req, Array.from(clients.values()), ws, rooms);
        } catch (error) {
            console.error('Error handling WebSocket message:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Failed to process message'
            }));
        }
    });

    ws.on('close', () => {
        console.log(`Client ${ws.id} disconnected`);
        handleDisconnect(ws, Array.from(clients.values()), rooms);
        clients.delete(ws.id);
    });

    ws.on('error', (error) => {
        console.error(`WebSocket error for client ${ws.id}:`, error);
        handleDisconnect(ws, Array.from(clients.values()), rooms);
        clients.delete(ws.id);
    });
};

// Set up periodic ping
const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
            clients.delete(ws.id);
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
    });
}, 30000);

wss.on('close', () => {
    clearInterval(interval);
});

wss.on("connection", initConnection);

server.on('error', (error) => {
    console.error('Server error:', error);
});

server.listen(port, () => {
    console.log(`Server running at port ${port}`);
});
