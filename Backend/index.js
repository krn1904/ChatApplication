const express = require('express');
const  http  = require("http");
const { WebSocket } = require("ws");
const { handleMessage } = require('./Websocket/ws');
const cors = require('cors');
const KeepAlive = require('./keepAlive');

// Code changed to websocket
const app = express();

const port = process.env.PORT || 8001
const server = http.createServer(app);
const wss = new WebSocket.Server({server});

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // json body parser

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    connections: wss.clients.size
  });
});

// Root endpoint for basic checks
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Chat Backend Server is running',
    websocket: 'Available'
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
    clients = []
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
