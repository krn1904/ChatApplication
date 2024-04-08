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
// let clients = [];

app.use(express.json()); // json body parser

wss.on("connection",(ws) => initConnection(ws))

function initConnection (ws) {
  // NEW CODE
  // clients.push(ws);
  let clients = wss.clients
  ws.on('message', async (data) => {
    // wss.clients.forEach(function each(client) {
    //   console.log("client", client)
    //   if (client !== ws && client.readyState === WebSocket.OPEN) {
    //     client.send("data");
    //   }
    // })
    try {
      let req = JSON.parse(data);

      // console.log("outside ws",ws)
      let res = await handleMessage(req, clients, ws)
      // console.log("res",res)
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
