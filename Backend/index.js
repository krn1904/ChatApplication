const express = require('express');
const  http  = require("http");
const { WebSocket } = require("ws");
const { handleMessage } = require('./Websocket/ws');

// Code changed to websocket
const app = express();

const port = 8001
const server = http.createServer(app);
const wss = new WebSocket.Server({server});

// console.log("wss",wss);
app.use(express.json()); // json body parser

wss.on("connection",(ws) => initConnection(ws))

let clients = [];
function initConnection (ws) {
  // NEW CODE
  clients = wss.clients
  ws.on('message', async (data) => {
    try {
      let req = JSON.parse(data);
      // console.log("req",req)
      // console.log("ws",ws)
      await handleMessage(req, clients, ws)
      // ws.close()

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
  console.log("HI")
});
