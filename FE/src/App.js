import "./Styles/App.css";
import Main from "./Components/Main/Main";
import { useEffect, useState } from "react";
// import useWebSocket from 'react-use-websocket'
const config = require('./config.js');
   
function App() {

  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [server, setWebsocketServer] = useState({});
  // My way
  // const server = new WebSocket("ws://192.168.1.9:8002")
  // server.onopen = function(e) {
  //   console.log(`Client connected`,e)
  // }
    const joinRoom = () => {
      if (username !== "" && room !== "") {
        const initConnection = {
          method : 'joinRoom',
          user : username,
          room : room,

        }

        server.send(JSON.stringify(initConnection));
        setShowChat(true);

        // new
        // const message = JSON.stringify({ event: 'join_room', data:  room  });

        // Send the message to the WebSocket server
        //  server.send(message);
      }
    };

    useEffect(() => {
      // Create a new WebSocket connection
      console.log("port, url ", config.BaseURL,config.port)
      let ws = new WebSocket(config.BaseURL + config.port);
      console.log("port:", process.env.port);
console.log("BaseURL:", process.env.BaseURL);

      setWebsocketServer(ws);

      // Event listener for handling errors
      ws.addEventListener('error', (error) => {
          console.error('WebSocket error:', error);
      });

      // Return a cleanup function to close the WebSocket connection when the component unmounts
      return () => {
          ws.close();
          console.log('WebSocket connection closed');
      };
  }, []); // Empty dependency array ensures this effect runs only once
  
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
          <Main socket={server} username={username} room_id={room} />
        )}
      </div>
  );
}

export default App;

