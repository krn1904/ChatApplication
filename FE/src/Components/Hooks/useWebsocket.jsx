import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import config from "../../config.js";
import wakeUpService from "../../services/wakeUpService";

const WebSocketContext = createContext({ socket: null, isConnected: false, isBackendReady: false, sendMessage: () => {} });

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const messageQueueRef = useRef([]);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_INTERVAL = 3000;

  const connectWebSocket = useCallback(async () => {
    try {
      // Ensure backend HTTP is awake before opening WS
      const ready = await wakeUpService.ensureBackendReady();
      setIsBackendReady(ready);
      if (!ready) {
        console.error('Backend not ready, skipping WS connect');
        return;
      }

      const ws = new WebSocket(config.BaseURL);

      ws.onopen = () => {
        console.log('WebSocket Connected');
        setIsConnected(true);
        setReconnectAttempts(0);
        setSocket(ws);
        // Flush any queued messages
        try {
          while (messageQueueRef.current.length) {
            const msg = messageQueueRef.current.shift();
            ws.send(JSON.stringify(msg));
          }
        } catch (e) {
          console.error('Failed flushing queued messages:', e);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket Disconnected');
        setIsConnected(false);
        setSocket(null);
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connectWebSocket();
          }, RECONNECT_INTERVAL);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
      };
    } catch (error) {
      console.error('WebSocket Connection Error:', error);
    }
  }, [reconnectAttempts]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!isMounted) return;
      await connectWebSocket();
    })();
    return () => { isMounted = false; if (socket) { try { socket.close(); } catch {} } };
  }, [connectWebSocket]);

  const sendMessage = useCallback((message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      // Queue the message to send when connected
      messageQueueRef.current.push(message);
      console.warn('WS not connected; message queued');
    }
  }, [socket]);

  const value = { socket, isConnected, isBackendReady, sendMessage };
  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketContext;
