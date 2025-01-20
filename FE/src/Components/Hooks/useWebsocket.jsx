import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import config from "../../config.js"

const WebSocketContext = createContext();

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_INTERVAL = 3000;

  const connectWebSocket = useCallback(() => {
    try {
      const ws = new WebSocket(config.BaseURL);

      ws.onopen = () => {
        console.log('WebSocket Connected');
        setIsConnected(true);
        setReconnectAttempts(0);
      };

      ws.onclose = () => {
        console.log('WebSocket Disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect if we haven't exceeded max attempts
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

      setSocket(ws);
    } catch (error) {
      console.error('WebSocket Connection Error:', error);
    }
  }, [reconnectAttempts]);

  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [connectWebSocket]);

  // Provide both socket and connection status
  const value = {
    socket,
    isConnected,
    sendMessage: useCallback((message) => {
      if (socket && isConnected) {
        socket.send(JSON.stringify(message));
      } else {
        console.warn('WebSocket is not connected');
      }
    }, [socket, isConnected])
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketContext;