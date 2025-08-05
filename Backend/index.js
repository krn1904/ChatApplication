const express = require('express');
const  http  = require("http");
const { WebSocket } = require("ws");
const { handleMessage } = require('./Websocket/ws');
const cors = require('cors');

// Code changed to websocket
const app = express();

const port = process.env.PORT || 8001
const server = http.createServer(app);
const wss = new WebSocket.Server({server});

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // json body parser

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

server.listen(port, () => {
  console.log(`Server running at port ${port}`);
});
