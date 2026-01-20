import React, { createContext, useEffect, useRef, useState, useCallback } from 'react';
import config from "../../config.js";
import wakeUpService from "../../services/wakeUpService";

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Create WebSocket connection
    const ws = new WebSocket(config.WsURL);

    ws.onopen = () => {
      console.log('WebSocket Connected');
      setIsConnected(true);
      setSocket(ws);
    };

    ws.onclose = () => {
      console.log('WebSocket Disconnected');
      setIsConnected(false);
      setSocket(null);
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const sendMessage = useCallback((message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }, [socket]);

  return { socket, isConnected, sendMessage };
};

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

      const ws = new WebSocket(config.WsURL);

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectWebSocket]);

  const sendMessage = useCallback((message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else if (isConnectingRef.current || !isBackendReady) {
      // Queue messages if still connecting or backend not ready
      messageQueueRef.current.push(message);
      console.warn('WebSocket not ready, message queued');
    } else {
      console.warn('WebSocket is not connected');
    }
  }, [socket, isBackendReady]);

  const value = { 
    socket, 
    isConnected, 
    isBackendReady, 
    sendMessage 
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketContext;
