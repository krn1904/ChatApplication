import React, { useEffect, useState } from "react";
import "./Main.css";
import TopNavBar from "../TopnavBar/TopNavBar";
import { useLocation } from "react-router-dom";
import { useWebSocket } from "../Hooks/useWebsocket.jsx";

function Main() {
  const [messageInput, setMessageInput] = useState("");
  const [chat, setChat] = useState([]); 
  // const [inputValue, setInputValue] = useState("");

  const locationData = useLocation();
  const { username, room_id } = locationData.state;
  const { socket, isConnected, sendMessage } = useWebSocket();

  // Event handler to update the message input
  const handleInputChange = (event) => {
    setMessageInput(event.target.value);
  };

  // Event handler for submitting the message
  const handleSubmit = () => {
    if (messageInput.trim() !== "") {
      // setMessages([...messages, { text: inputValue, type: "sent" }]);
      // setInputValue("");

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

      if (isConnected) {
        sendMessage(message);
        setChat(prevChat => [...prevChat, message]);
        setMessageInput("");
      } else {
        console.error("WebSocket is not connected");
        alert("Connection lost. Please try again.");
      }
    } else {
      console.log("Enter valid message");
      alert("Enter valid Message!");
    }
  };

  useEffect(() => {
    if (socket) {
      const handleMessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          // Add the message to chat if it's not from the current user
          if (message.author !== username) {
            setChat(prevChat => {
              // Check if message already exists
              const messageExists = prevChat.some(
                msg => 
                  msg.message === message.message && 
                  msg.author === message.author &&
                  msg.timestamp === message.timestamp
              );
              
              if (!messageExists) {
                return [...prevChat, message];
              }
              return prevChat;
            });
          }
        } catch (error) {
          console.error('Error processing received message:', error);
        }
      };

      // Set up message handler
      socket.addEventListener('message', handleMessage);

      // Cleanup
      return () => {
        socket.removeEventListener('message', handleMessage);
      };
    }
  }, [socket, username]);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  // Add connection status indicator
  const connectionStatus = isConnected ? (
    <div className="connection-status connected">Connected</div>
  ) : (
    <div className="connection-status disconnected">Disconnected</div>
  );

  return (
    <>
      <TopNavBar />
      <div className="app">
        {connectionStatus}
        <div className="message-box-container">
          <div className="message-box">
            {chat.map((message, index) => (
              <div key={index} className={`${message.author === username ? 'sent' : 'receive'}`}>
                <div className="message">{message.message}</div>
                <div className={`sender-name ${message.author === username ? 'sender' : 'receiver'}`}>
                  {message.author}
                </div>
              </div>
            ))}
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