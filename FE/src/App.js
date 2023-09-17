import "./Styles/App.css";
import Main from "./Components/Main/Main";
import { io } from "socket.io-client";
import { useState } from "react";
const Config = require('./config.json');

const socket = io.connect(Config.BaseURL + Config.port, { transports: ["websocket"] });

function App() {
    const [username, setUsername] = useState("");
    const [room, setRoom] = useState("");
    const [showChat, setShowChat] = useState(false);
  
    const joinRoom = () => {
      if (room !== "" && username !== "") {
        socket.emit("join_room", room);
      }
      setShowChat(true);
    };
  
    return (
      <>
      {!showChat ?
        <div className="join_room">
          <div className="login-form">
            <div className="input-container">
              <label>username:</label>
              <input
                type="text"
                placeholder="krn"
                onChange={(event) => setUsername(event.target.value)}
              />
            </div>
            <div className="input-container">
              <label>RoomId:</label>
              <input
                type="text"
                placeholder="Enter Room id"
                onChange={(event) => setRoom(event.target.value)}
              />
            </div>
  
            <button onClick={joinRoom}>Join Room</button>
          </div>
        </div>
        : <Main room={room} username={username} socket={socket} />
      }
      </>
    );
}

export default App;
