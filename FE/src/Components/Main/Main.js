import React, { useEffect, useRef, useState } from "react";
import "./Main.css";
import TopNavBar from "../TopnavBar/TopNavBar";
import UsersList from "../UsersList/UsersList";
import { useLocation, useNavigate } from "react-router-dom";
import { useWebSocket } from "../Hooks/useWebsocket.jsx";

function Main() {
  const [messageInput, setMessageInput] = useState("");
  const [chat, setChat] = useState([]);
  const [roomUsers, setRoomUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [roomError, setRoomError] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimeoutRef = useRef(null);
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

    const token = localStorage.getItem('token');

    const joinMessage = {
      method: 'join-room',
      username,
      room: room_id,
      token
    };
    sendMessage(joinMessage);

    const handleMessage = (event) => {
      try {
        const receivedMessage = JSON.parse(event.data);
        
        // Handle room full error
        if (receivedMessage.method === 'room-full') {
          setRoomError(receivedMessage.message || 'Room is full. Please try another room.');
          return;
        }

        if (receivedMessage.method === 'auth-error') {
          setRoomError(receivedMessage.message || 'Authentication failed. Please login again.');
          return;
        }
        
        // Handle message history (loaded on room join)
        if (receivedMessage.method === 'message-history') {
          setChat(receivedMessage.messages || []);
        }
        
        // Handle new incoming messages
        if (receivedMessage.method === 'new-message') {
          setChat(prevChat => {
            const messageExists = prevChat.some(msg => 
              msg.messageId === receivedMessage.messageId ||
              (msg.message === receivedMessage.message && 
               msg.author === receivedMessage.author &&
               msg.timestamp === receivedMessage.timestamp)
            );
            if (!messageExists) {
              return [...prevChat, receivedMessage];
            }
            return prevChat;
          });
        }
        
        // Handle room users update
        if (receivedMessage.method === 'room-users-update') {
          const users = receivedMessage.users || [];
          setRoomUsers(users);
          setOnlineUsers(new Set(users));
        }

        if (receivedMessage.method === 'user-presence') {
          const statusText = receivedMessage.status === 'online' ? 'joined' : 'left';
          setOnlineUsers(prev => {
            const next = new Set(prev);
            if (receivedMessage.status === 'online') {
              next.add(receivedMessage.user);
            } else {
              next.delete(receivedMessage.user);
            }
            return next;
          });
          setChat(prevChat => ([
            ...prevChat,
            {
              author: 'system',
              message: `${receivedMessage.user} ${statusText} the room`,
              timestamp: new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', timeZone: 'Australia/Melbourne' }),
              system: true
            }
          ]));
        }

        if (receivedMessage.method === 'typing') {
          setTypingUsers(prev => {
            const already = prev.includes(receivedMessage.user);
            if (receivedMessage.isTyping && !already) {
              return [...prev, receivedMessage.user];
            }
            if (!receivedMessage.isTyping && already) {
              return prev.filter(u => u !== receivedMessage.user);
            }
            return prev;
          });
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };

    socket.addEventListener('message', handleMessage);

    return () => {
      socket.removeEventListener('message', handleMessage);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      const leaveMessage = {
        method: 'leave-room',
        username,
        room: room_id,
        token
      };
      sendMessage(leaveMessage);
    };
  }, [socket, isConnected, locationData.state, sendMessage]);

  if (!locationData.state?.username || !locationData.state?.room_id) {
    return null;
  }

  const { username, room_id } = locationData.state;
  const usersWithStatus = roomUsers.map(user => ({
    name: user,
    status: onlineUsers.has(user) ? 'online' : 'offline'
  }));

  const handleInputChange = (event) => {
    const value = event.target.value;
    setMessageInput(value);

    if (!isConnected) return;

    const token = localStorage.getItem('token');
    sendMessage({
      method: 'typing',
      room: room_id,
      token
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      sendMessage({
        method: 'stop-typing',
        room: room_id,
        token
      });
    }, 1500);
  };

  const handleSubmit = () => {
    if (messageInput.trim() !== "" && isConnected) {
      const token = localStorage.getItem('token');
      const message = {
        method: 'send-message',
        message: messageInput,
        room: room_id,
        token,
        timestamp: new Date().toLocaleTimeString('en-AU', { 
          hour: '2-digit', 
          minute: '2-digit',
          timeZone: 'Australia/Melbourne' 
        })
      };
      // Don't add locally - let server broadcast it back
      sendMessage(message);
      setMessageInput("");
      sendMessage({
        method: 'stop-typing',
        room: room_id,
        token
      });
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
          users={usersWithStatus}
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
                  className={`message-bubble ${message.system ? 'system' : (message.author === username ? 'sent' : 'received')}`}
                >
                    {message.author !== username && !message.system && (
                      <span className="message-author">{message.author}</span>
                    )}
                  <div className="message-content">
                    <div className="message-text">{message.message}</div>
                  </div>
                    <span className="message-time">{message.formattedTime || message.timestamp}</span>
                </div>
              ))
            )}
          </div>
          {typingUsers.length > 0 && (
            <div className="no-messages">
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </div>
          )}
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
