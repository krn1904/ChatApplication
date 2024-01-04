import "./Styles/App.css";
import Main from "./Components/Main/Main";
import { useState } from "react";
import { io } from "socket.io-client";
import useWebSocket from 'react-use-websocket'
const config = require('./config.js');
   
// Socket Connection
const socket = io(config.BaseURL + config.port, { transports: ["websocket"] });
// console.log(config.BaseURL);
// console.log(config.port);
// console.log("port ",process.env.port);


function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  
  // Use WebSocket
  const { sendMessage: sendNewMessage } = useWebSocket("ws://192.168.1.11:8000", { onOpen: (e)=> {
    console.log(`Client connected`,e)
  },})
    const joinRoom = () => {
      if (username !== "" && room !== "") {
        socket.emit("join_room", room);
        setShowChat(true);
      }
    };
  
    return (
      <div className="App">
        {!showChat ? (
          <div className="ChatContainer">
            <h3>Welcome to the Chat App</h3>
            <div className="InputContainer">
              <input
                type="text"
                placeholder="Enter your username"
                onChange={(event) => setUsername(event.target.value)}
              />
              <input
                type="text"
                placeholder="Enter Room ID"
                onChange={(event) => setRoom(event.target.value)}
              />
              <button onClick={joinRoom}>Join Room</button>
            </div>
          </div>
        ) : (
          <Main socket={socket} username={username} room_id={room} />
        )}
      </div>
  );
}

export default App;

