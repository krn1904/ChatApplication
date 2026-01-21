const express = require('express');
const  http  = require("http");
const { WebSocket } = require("ws");
const { handleMessage } = require('./Websocket/ws');
const cors = require('cors');
const KeepAlive = require('./keepAlive');
const config = require('./config');
const { connectDB, getConnectionStatus } = require('./database/connection');
const { CreateUser, LoginUser } = require('./UserController/Users');
const { authMiddleware } = require('./middleware/auth');
const userRoutes = require('./routes/userRoutes');

// Code changed to websocket
const app = express();

const port = config.PORT;
const server = http.createServer(app);
const wss = new WebSocket.Server({server});

// Initialize MongoDB connection
(async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error('⚠️  Failed to connect to MongoDB');
    console.log('⚠️  Server will continue without database features');
    console.log('⚠️  Users and messages will be stored in memory only\n');
  }
})();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
})); // Enable CORS for all routes
app.use(express.json()); // json body parser

// Mount user routes
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = getConnectionStatus();
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ 
    status: 'OK',
    server: 'running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    connections: wss.clients.size,
    database: {
      connected: dbStatus.isConnected,
      readyState: dbStatus.readyState,
      host: dbStatus.host || 'not connected',
      name: dbStatus.name || 'not connected'
    }
  });
});

// Root endpoint for basic checks
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Chat Backend Server is running',
    websocket: 'Available'
  });
});

// Authentication routes (public)
app.post('/api/auth/register', CreateUser);
app.post('/api/auth/login', LoginUser);

// Example: Get current user profile (protected)
app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({
    message: 'Authenticated user',
    user: req.user
  });
});

wss.on("connection",(ws) => initConnection(ws))

let clients = [];
const initConnection = (ws) => {
  // NEW CODE
  clients = wss.clients
  ws.on('message', async (data) => {
    try {
      let req = JSON.parse(data);
      await handleMessage(req, clients, ws)
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  })

  ws.on('close', () => { 
    console.log("connection closed");
    
    // Remove user from all rooms when connection closes
    const { rooms } = require('./Websocket/ws');
    rooms.forEach((roomUsers, roomId) => {
      roomUsers.forEach(user => {
        if (user.websocketConnection === ws) {
          roomUsers.delete(user);
          console.log(`🚪 User ${user.userId} removed from room ${roomId} on disconnect`);
          
          // Broadcast updated users list after removal
          const usersList = Array.from(roomUsers).map(u => u.userId);
          roomUsers.forEach(u => {
            if (u.websocketConnection.readyState === 1) { // OPEN
              u.websocketConnection.send(JSON.stringify({
                method: 'room-users-update',
                roomId: roomId,
                users: usersList
              }));
            }
          });
        }
      });
    });
    
    // Clients are automatically managed by wss.clients
    clients = wss.clients;
});
}

// Initialize keep-alive if URL is provided
if (process.env.RENDER_EXTERNAL_URL) {
  const keepAlive = new KeepAlive(process.env.RENDER_EXTERNAL_URL);
  keepAlive.start();
}

server.listen(port, () => {
  console.log(`Server running at port ${port}`);
});
