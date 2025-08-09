import "./Styles/App.css";
import Main from "./Components/Main/Main";
import { useEffect, useState, useRef } from "react";
import wakeUpService from "./services/wakeUpService";
const config = require('./config.js');
   
function App() {

  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [server, setWebsocketServer] = useState(null);
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [pendingJoin, setPendingJoin] = useState(null);
  const pendingJoinRef = useRef(null);

    const joinRoom = () => {
      if (username !== "" && room !== "") {
        const initConnection = {
          method : 'joinRoom',
          user : username,
          room : room,
        }
        // If socket is open, send immediately; otherwise queue until open
        if (server && server.readyState === WebSocket.OPEN) {
          server.send(JSON.stringify(initConnection));
          setShowChat(true);
        } else {
          console.warn('Socket not ready yet, queuing join...');
          setPendingJoin(initConnection);
          pendingJoinRef.current = initConnection;
        }
      }
    };

    useEffect(() => {
      let ws;
      let isMounted = true;

      (async () => {
        setIsConnecting(true);
        
        // Wake up backend first (non-blocking UI)
        console.log('Waking up backend...');
        const backendReady = await wakeUpService.ensureBackendReady();
        setIsBackendReady(backendReady);
        
        if (!backendReady) {
          setIsConnecting(false);
          console.error('Backend is not ready, cannot establish WebSocket connection');
          return;
        }
        
        // Create WebSocket connection after backend is ready
        ws = new WebSocket(config.BaseURL);
        setWebsocketServer(ws);
        
        ws.addEventListener('open', () => {
          if (!isMounted) return;
          console.log('WebSocket connection established');
          setIsConnecting(false);
          // If user attempted to join before socket was ready, send now
          const queued = pendingJoinRef.current;
          if (queued) {
            try { ws.send(JSON.stringify(queued)); } catch (e) { console.error('Failed to send queued join:', e); }
            pendingJoinRef.current = null;
            setPendingJoin(null);
            setShowChat(true);
          }
        });
        
        ws.addEventListener('error', (error) => {
          if (!isMounted) return;
          console.error('WebSocket error:', error);
          setIsConnecting(false);
        });
      })();

      return () => {
        isMounted = false;
        try { ws && ws.close(); } catch {}
        console.log('WebSocket connection closed');
      };
  }, []);
  
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

