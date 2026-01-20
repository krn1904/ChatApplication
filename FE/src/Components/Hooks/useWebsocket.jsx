import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import config from "../../config.js";
import wakeUpService from "../../services/wakeUpService";

const WebSocketContext = createContext({ socket: null, isConnected: false, isBackendReady: false, sendMessage: () => {} });

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isBackendReady, setIsBackendReady] = useState(false);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef(null);
  const messageQueueRef = useRef([]);
  const isConnectingRef = useRef(false);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_INTERVAL = 3000;

  const connectWebSocket = useCallback(async () => {
    // Prevent multiple simultaneous connection attempts
    if (isConnectingRef.current) {
      return;
    }
    
    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      console.error('Max reconnection attempts reached');
      return;
    }

    isConnectingRef.current = true;

    try {
      // Ensure backend HTTP is awake before opening WS
      const ready = await wakeUpService.ensureBackendReady();
      setIsBackendReady(ready);
      if (!ready) {
        console.error('Backend not ready, will retry...');
        isConnectingRef.current = false;
        reconnectAttemptsRef.current++;
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, RECONNECT_INTERVAL);
        return;
      }

      const ws = new WebSocket(config.BaseURL);

      ws.onopen = () => {
        console.log('WebSocket Connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        isConnectingRef.current = false;
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
        isConnectingRef.current = false;
        
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current++;
          console.log(`Reconnecting... Attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS}`);
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, RECONNECT_INTERVAL);
        } else {
          console.error('Max reconnection attempts reached');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
        isConnectingRef.current = false;
      };
    } catch (error) {
      console.error('WebSocket Connection Error:', error);
      isConnectingRef.current = false;
      reconnectAttemptsRef.current++;
      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, RECONNECT_INTERVAL);
      }
    }
  }, []);

  useEffect(() => {
    connectWebSocket();
    
    return () => { 
      // Clear reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      // Close socket
      if (socket) { 
        try { 
          socket.close(); 
        } catch (e) {
          console.error('Error closing socket:', e);
        } 
      }
      isConnectingRef.current = false;
    };
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
