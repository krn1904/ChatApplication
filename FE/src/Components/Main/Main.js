import React, { useEffect, useState } from "react";
import "./Main.css";
import TopNavBar from "../TopnavBar/TopNavBar";

function Main({ socket, username, room_id }) {
  const [messageInput, setMessageInput] = useState("");
  const [chat, setChat] = useState([]);
  // const [inputValue, setInputValue] = useState("");

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
        timestamp: new Date().getHours() + new Date().getMinutes(),
      };
      socket.send(JSON.stringify(message));
      setChat((chat) => [...chat, message]);
      setMessageInput("");
    }else{
      console.log("Enter valid message");
      alert("Enter valid Message! check Console")
    }
  };

  useEffect(() => {
    socket.onmessage = (res) => {
      // File: test.js
      if(res){
        let ParsedRes = JSON.parse(res.data);
        setChat((prevChat) => {
          // Check if the message already exists in chat
          const messageExists = prevChat.some(
            (chatMessage) => chatMessage.message === ParsedRes.message
          );
  
          // If the message doesn't exist, add it to the chat state
          if (!messageExists) {
            return [...prevChat, ParsedRes];
          }
  
          return prevChat; // Return the same state if the message exists
        });
      }
      // Check if the message already exists in chat

      // This logic is been implemented because the message is stored twice in the chat array.. If you do not find the solution other than this do not change.
      // Kindly update below code to check above comment
      //  setChat((prevChat)=> [...prevChat, data])

      // Woring code that remove duplicates

     
    };

    socket.onclose = (res) => {
      alert("Websocket connectino closed")
    }
  }); //there was error in console of empty dependenci [] so removed it.

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <>
      <TopNavBar />
      <div className="app">
        <div className="message-box-container">

        <div className={`message-box `}>
          {chat.map((message, index) => (
            <div key={index} className={`${message.author === username ? 'sent' : 'receive'}`}>
              <div className="message">{message.message}</div>
              <div className={`sender-name ${message.author === username ? 'sender' : 'receiver'}`}>{message.author}</div>
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
            />
          <button onClick={handleSubmit}>Send</button>
        </div>
            </div>
      </div>
    </>
  );
}

export default Main;
