import "./Styles/App.css";
import Main from "./Components/Main/Main";
import { useEffect, useState } from "react";
import wakeUpService from "./services/wakeUpService";
const config = require('./config.js');
   
function App() {

  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [server, setWebsocketServer] = useState({});
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);

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
      const initializeApp = async () => {
        setIsConnecting(true);
        
        // Wake up backend first
        console.log('Waking up backend...');
        const backendReady = await wakeUpService.ensureBackendReady();
        setIsBackendReady(backendReady);
        
        if (backendReady) {
          // Create WebSocket connection after backend is ready
          let ws = new WebSocket(config.BaseURL);
          setWebsocketServer(ws);
          
          ws.addEventListener('open', () => {
            console.log('WebSocket connection established');
            setIsConnecting(false);
          });
          
          ws.addEventListener('error', (error) => {
            console.error('WebSocket error:', error);
            setIsConnecting(false);
          });
          
          // Return cleanup function
          return () => {
            ws.close();
            console.log('WebSocket connection closed');
          };
        } else {
          setIsConnecting(false);
          console.error('Backend is not ready, cannot establish WebSocket connection');
        }
      };
      
      initializeApp();
  }, []); // Empty dependency array ensures this effect runs only once
  
    if (isConnecting) {
      return (
        <div className="App">
          <div className="ChatContainer">
            <h3>Starting Chat Application...</h3>
            <p>Waking up backend services, please wait...</p>
            <div className="loading-spinner">🔄</div>
          </div>
        </div>
      );
    }

    if (!isBackendReady) {
      return (
        <div className="App">
          <div className="ChatContainer">
            <h3>Connection Error</h3>
            <p>Unable to connect to chat services. Please refresh the page to try again.</p>
            <button onClick={() => window.location.reload()}>Refresh</button>
          </div>
        </div>
      );
    }
  
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

