import React, { useEffect, useState } from "react";
import "./Main.css";
import TopNavBar from "../TopnavBar/TopNavBar";

function Main({ socket, username, room_id }) {
  const [messageInput, setMessageInput] = useState("");
  const [chat, setChat] = useState([]);
  const [inputValue, setInputValue] = useState("");

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
        author: username,
        message: messageInput,
        room: room_id,
        timestamp: new Date().getHours() + new Date().getMinutes(),
      };
      socket.emit("send_message", message);
      setChat((chat) => [...chat, message]);
      setMessageInput("");
    }else{
      console.log("object")
    }
  };

  useEffect(() => {
    socket.on("recieve_message", (data) => {
      // Check if the message already exists in chat

      // This logic is been implemented because the message is stored twice in the chat array.. If you do not find the solution other than this do not change.
      // Kindly update below code to check above comment
      //  setChat((prevChat)=> [...prevChat, data])

      // Woring code that remove duplicates

      setChat((prevChat) => {
        // Check if the message already exists in chat
        const messageExists = prevChat.some(
          (chatMessage) => chatMessage.message === data.message
        );

        // If the message doesn't exist, add it to the chat state
        if (!messageExists) {
          return [...prevChat, data];
        }

        return prevChat; // Return the same state if the message exists
      });
    });
  }, [socket]);

  return (
    <>
      <TopNavBar />
      <div className="app">
        <div className="message-box-container">

        <div className={`message-box `}>
          {chat.map((message, index) => (
            <div key={index} className={`${message.author == username ? 'sent' : 'receive'}`}>
              <div className="message">{message.message}</div>
              <div className={`sender-name ${message.author == username ? 'sender' : 'receiver'}`}>{message.author}</div>
            </div>
          ))}
        </div>
        <div className="input-box">
          <input
            type="text"
            placeholder="Type your message..."
            value={messageInput}
            onChange={handleInputChange}
            />
          <button onClick={handleSubmit}>Send</button>
        </div>
            </div>
      </div>
    </>
  );
}

export default Main;
