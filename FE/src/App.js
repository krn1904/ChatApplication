import "./Styles/App.css";
import Main from "./Components/Main/Main";
import { useEffect, useState } from "react";
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
        }
      }
    };

    useEffect(() => {
      const initializeApp = async () => {
        setIsConnecting(true);
        
        // Wake up backend first (non-blocking UI)
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
            // If user attempted to join before socket was ready, send now
            if (pendingJoin) {
              ws.send(JSON.stringify(pendingJoin));
              setPendingJoin(null);
              setShowChat(true);
            }
          });
          
          ws.addEventListener('error', (error) => {
            console.error('WebSocket error:', error);
            setIsConnecting(false);
          });
          
          // Note: cleanup is intentionally minimal to avoid UI disruption
          // Closing socket on unmount
          // (React ignores cleanup returned within async fn, but keep for clarity)
          return () => {
            try { ws.close(); } catch {}
            console.log('WebSocket connection closed');
          };
        } else {
          setIsConnecting(false);
          console.error('Backend is not ready, cannot establish WebSocket connection');
        }
      };
      
      initializeApp();
  }, [pendingJoin]);
  
    // Full-screen loading screen (keep)
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
  
    // Lightweight banner (keep) for post-load errors only
    const Banner = () => (
      <div className="SystemBanner" style={{
        background: '#fff3cd',
        color: '#664d03',
        border: '1px solid #ffecb5',
        borderRadius: 6,
        padding: '8px 12px',
        margin: '12px',
        fontSize: 14
      }}>
        {!isBackendReady && (
          <span>
            Unable to reach chat services. <button onClick={() => window.location.reload()}>Retry</button>
          </span>
        )}
      </div>
    );
  
    return (
      <div className="App">
        {!isBackendReady && <Banner />}
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

