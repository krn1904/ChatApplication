import "./Styles/App.css";
import Main from "./Components/Main/Main";
import { useState } from "react";
import { io } from "socket.io-client";
const Config = require('./config.json');
   
// Socket Connection
const socket = io(Config.BaseURL + Config.port, { transports: ["websocket"] });

function App() {
    const [username, setUsername] = useState("");
    const [room, setRoom] = useState("");
    const [showChat, setShowChat] = useState(false);

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
            <h3>Join A Chat</h3>
            <input
              type="text"
              placeholder="John..."
              onChange={(event) => {
                setUsername(event.target.value);
              }}
            />
            <input
              type="text"
              placeholder="Room ID..."
              onChange={(event) => {
                setRoom(event.target.value);
              }}
            />
            <button onClick={joinRoom}>Join A Room</button>
          </div>
        ) : (
          <Main socket={socket} username={username} room_id={room} />
        )}
      </div>
  );
}

export default App;
