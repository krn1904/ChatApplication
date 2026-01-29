import React, { useEffect, useState } from "react";
import "./Main.css";
import TopNavBar from "../TopnavBar/TopNavBar";
import UsersList from "../UsersList/UsersList";
import { useLocation, useNavigate } from "react-router-dom";
import { useWebSocket } from "../Hooks/useWebsocket.jsx";

function Main() {
  const [messageInput, setMessageInput] = useState("");
  const [chat, setChat] = useState([]);
  const [roomUsers, setRoomUsers] = useState([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [roomError, setRoomError] = useState("");
  const locationData = useLocation();
  const navigate = useNavigate();
  const { socket, isConnected, sendMessage } = useWebSocket();

  useEffect(() => {
    if (!locationData.state?.username || !locationData.state?.room_id) {
      navigate('/', { replace: true });
    }
  }, [locationData.state, navigate]);

  useEffect(() => {
    if (!locationData.state?.username || !locationData.state?.room_id || !socket || !isConnected) return;

    const { username, room_id } = locationData.state;

    const joinMessage = {
      method: 'join-room',
      username,
      room: room_id
    };
    sendMessage(joinMessage);

    const handleMessage = (event) => {
      try {
        const receivedMessage = JSON.parse(event.data);
        if (receivedMessage.method === 'room-full') {
          setRoomError(receivedMessage.message || 'Room is full. Please try another room.');
          return;
        }
        if (receivedMessage.method === 'new-message') {
          setChat(prevChat => {
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
        
        if (receivedMessage.method === 'room-users-update') {
          setRoomUsers(receivedMessage.users || []);
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };

    socket.addEventListener('message', handleMessage);

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
      // Don't add locally - let server broadcast it back
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
      <TopNavBar onTogglePanel={() => setIsPanelOpen(!isPanelOpen)} />
      <div className="app">
        <UsersList 
          isOpen={isPanelOpen} 
          onClose={() => setIsPanelOpen(false)}
          users={roomUsers}
          currentUser={username}
        />
        <div className="message-box-container">
          {roomError && (
            <div className="no-messages">
              {roomError}
            </div>
          )}
          <div className="message-box">
            {chat.length === 0 ? (
              <div className="no-messages">No messages yet</div>
            ) : (
              chat.map((message, index) => (
                <div 
                  key={`${message.author}-${message.timestamp}-${index}`}
                  className={`message-bubble ${message.author === username ? 'sent' : 'received'}`}
                >
                    {message.author !== username && (
                      <span className="message-author">{message.author}</span>
                    )}
                  <div className="message-content">
                    <div className="message-text">{message.message}</div>
                  </div>
                    <span className="message-time">{message.timestamp}</span>
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
              disabled={!isConnected || !!roomError}
            />
            <button 
              onClick={handleSubmit}
              disabled={!isConnected || !!roomError}
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
