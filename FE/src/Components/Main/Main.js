import React, { useEffect, useState } from "react";
import "./Main.css";
import TopNavBar from "../TopnavBar/TopNavBar";
import { useLocation, useNavigate } from "react-router-dom";
import { useWebSocket } from "../Hooks/useWebsocket.jsx";

function Main() {
  const [messageInput, setMessageInput] = useState("");
  const [chat, setChat] = useState([]);
  const locationData = useLocation();
  const navigate = useNavigate();
  const { socket, isConnected, sendMessage } = useWebSocket();

  // First useEffect - check for valid state
  useEffect(() => {
    if (!locationData.state?.username || !locationData.state?.room_id) {
      navigate('/', { replace: true });
    }
  }, [locationData.state, navigate]);

  // Second useEffect - socket event handlers
  useEffect(() => {
    if (!locationData.state?.username || !locationData.state?.room_id || !socket || !isConnected) return;

    const { username, room_id } = locationData.state;

    // Join room when component mounts
    const joinMessage = {
      method: 'join-room',
      username,
      room: room_id
    };
    sendMessage(joinMessage);

    // Set up message handler
    const handleMessage = (event) => {
      try {
        const receivedMessage = JSON.parse(event.data);
        console.log('Received message:', receivedMessage);

        if (receivedMessage.method === 'new-message') {
          setChat(prevChat => {
            // Check if message already exists to prevent duplicates
            const messageExists = prevChat.some(msg => 
              msg.message === receivedMessage.message && 
              msg.author === receivedMessage.author &&
              msg.timestamp === receivedMessage.timestamp
            );
            
            if (!messageExists) {
              return [...prevChat, receivedMessage];
            }
            return prevChat;
          });
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };

    socket.addEventListener('message', handleMessage);

    // Cleanup on unmount
    return () => {
      socket.removeEventListener('message', handleMessage);
      const leaveMessage = {
        method: 'leave-room',
        username,
        room: room_id
      };
      sendMessage(leaveMessage);
    };
  }, [socket, isConnected, locationData.state, sendMessage]);

  if (!locationData.state?.username || !locationData.state?.room_id) {
    return null;
  }

  const { username, room_id } = locationData.state;

  const handleInputChange = (event) => {
    setMessageInput(event.target.value);
  };

  const handleSubmit = () => {
    if (messageInput.trim() !== "" && isConnected) {
      const message = {
        method: 'send-message',
        author: username,
        message: messageInput,
        room: room_id,
        timestamp: new Date().toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };
      
      // Add message to chat immediately for the sender
      setChat(prevChat => [...prevChat, message]);
      
      // Send message to others
      sendMessage(message);
      setMessageInput("");
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <>
      <TopNavBar />
      <div className="app">
        <div className="message-box-container">
          <div className="message-box">
            {chat.length === 0 ? (
              <div className="no-messages">No messages yet</div>
            ) : (
              chat.map((message, index) => (
                <div 
                  key={`${message.author}-${message.timestamp}-${index}`}
                  className={`message-bubble ${message.author === username ? 'sent' : 'received'}`}
                >
                  <div className="message-content">
                    {message.author !== username && (
                      <span className="message-author">{message.author}</span>
                    )}
                    <div className="message-text">{message.message}</div>
                    <span className="message-time">{message.timestamp}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="input-box">
            <input
              type="text"
              placeholder="Type your message..."
              value={messageInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={!isConnected}
            />
            <button 
              onClick={handleSubmit}
              disabled={!isConnected}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Main;