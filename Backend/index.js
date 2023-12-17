const express = require('express');
const { createServer } = require("http");
const mongoose = require('mongoose');
const { Server } = require("socket.io"); 
const cors = require('cors') // Import the cors middleware
const { CreateUser, AllUsers } = require('./UserController/Users');
const config = require('./config.js');

const app = express();
const httpServer = createServer(app);
// const io = new Server(httpServer)
const io = new Server(httpServer, {
  transports: ['websocket'],
});
const port = 3002;


app.use(cors()); // Use the cors middleware
app.use(express.json());


// //handle conncection
io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // Handle custom events and messages here

  socket.on('join_room', (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on('send_message', (data)=>{
    socket.to(data.room).emit('recieve_message',data)
    console.log("in send_msg",data)
  })

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });


});

//connect to the database
async function startServer() {
  await connect();
  
  httpServer.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
  });
}

//API 
app.post('/createUser',CreateUser)
app.get('/AllUsers',AllUsers)


async function connect() {
  try {
    console.log(config)
    await mongoose.connect(config.MongoDb_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

startServer();