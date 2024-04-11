const express = require('express');
const  http  = require("http");
const { WebSocket } = require("ws");
const { handleMessage } = require('./Websocket/ws');

// Code changed to websocket
const app = express();

const host = process.env.HOST || "13.228.225.19";
const port = 8001
const server = http.createServer(app);
const wss = new WebSocket.Server({ port: 8002 });

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
  console.log(`Server running at http://${host}:${port}`);
  // console.log(`Server running at http://${server.address().address}:${server.address().port}`);
  console.log("HI")
});
