import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import config  from "../../config.js";

function Login() {
  const [username, setUsername] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [server, setWebsocketServer] = useState({});
  const [room, setRoom] = useState("");
  const navigate = useNavigate();

  const joinRoom = async () => {

    if (username !== "" && room !== "") {
      const initConnection = {
        method: "joinRoom",
        user: username,
        room: room,
      };
      server.send(JSON.stringify(initConnection));
      setShowChat(true);
      // new
      // const message = JSON.stringify({ event: 'join_room', data:  room  });

      // Send the message to the WebSocket server
      //  server.send(message);
    }
    navigate("/", {state : { username: username, room_id: room }});
  };

  const buildConnection = () => {
    // Create a new WebSocket connection
    let ws = new WebSocket(config.BaseURL);
    setWebsocketServer(ws);
    ws.addEventListener("open", () => {
      console.log("WebSocket connection established");
    });
    // Event listener for handling errors
    ws.addEventListener("error", (error) => {
      console.error("WebSocket error:", error);
    });
    // Return a cleanup function to close the WebSocket connection when the component unmounts
    // return () => {
    //   ws.close();
    //   console.log("WebSocket connection closed");
    // };
    // }, []); // Empty dependency array ensures this effect runs only once
  };
  // Initialize WebSocket connection when component mounts
  useEffect(() => {
    const cleanup = buildConnection();
    return cleanup;
  }, []); // Empty dependency array ensures this effect runs only once

  return (
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
  );
}

export default Login;
