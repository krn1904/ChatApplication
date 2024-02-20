const express = require('express');
const  http  = require("http");
const { WebSocket } = require("ws");
const { handleMessage } = require('./Websocket/ws');

// Code changed to websocket
const app = express();

const host = process.env.HOST || "192.168.1.3";
const port = process.env.PORT || 8001;
const server = http.createServer(app);
const wss = new WebSocket.Server({port : 8002});
let clients = [];

app.use(express.json()); // json body parser

wss.on("connection",(ws) => initConnection(ws))

function initConnection (ws) {
  // NEW CODE
  clients.push(ws);
  // console.log("clients", clients)
  ws.on('message', async (data) => {
    try {
      let req = JSON.parse(data);
      // console.log("req",JSON.parse(data))
      // console.log("ws",ws)
      console.log("outside ws",ws)
      let res = await handleMessage(req, ws)
      console.log("res",res)
    // res.forEach(element => {
      // res[0].element.websocketConnection.send("data")
    // });
        // ws.send(res)
        // res.send("Hey")

      // console.log(res)
      // console.log("clients",clients)
      // res.forEach((client) => {
      //   console.log("inside clients", client)
      //   let websocket = client.websocketConnection
      //   console.log(websocket)
      //   // websocket.send()
      // });
      

    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  })
}

server.listen(port, () => {
  console.log(`Server running at http://${host}:${port}`);
  console.log("HI")
});
