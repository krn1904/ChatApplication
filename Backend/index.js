const express = require('express');
const  http  = require("http");
const { WebSocket } = require("ws");
const { handleMessage } = require('./Websocket/ws');

// Code changed to websocket
const app = express();

const host = process.env.HOST || "192.168.1.9";
const port = process.env.PORT || 8001;
const server = http.createServer(app);
const wss = new WebSocket.Server({port : 8002});

app.use(express.json()); // json body parser

wss.on("connection",(ws) => initConnection(ws))

function initConnection (ws) {
  // NEW CODE
  let clients = wss.clients
  ws.on('message', async (data) => {
    try {
      let req = JSON.parse(data);
      await handleMessage(req, clients, ws)

    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  })
}

server.listen(port, () => {
  console.log(`Server running at http://${host}:${port}`);
  console.log("HI")
});
