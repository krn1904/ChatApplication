import React, { useEffect, useState } from "react";
import "./Main.css";
import TopNavBar from "../TopnavBar/TopNavBar";

function Main({ room, username, socket }) {
  const [messageInput, setMessageInput] = useState("");
  const [messageList, setMessageList] = useState([]);

  // Event handler to update the message input
  const handleInputChange = (event) => {
    setMessageInput(event.target.value);
  };

  // Event handler for submitting the message
  const handleSubmit = async () => {
    if (messageInput !== "") {
      const messageData = {
        room: room,
        author: username,
        message: messageInput,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };
      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
    }
  };

  useEffect(() => {
    socket.on("recieve_message", (data) => {
      setMessageList((list) => [...list, data]);
    });
    // Return a cleanup function to remove the event listener when the component unmounts
    return () => {
      socket.off("recieve_message");
    };
  }, [socket, messageList]);

  return (
    <>
      <TopNavBar />
      <div className="background">
        <div className="message_background">
          {messageList.map((messageContent, index) => {
            return (
              <div
                className="Message"
                key={index}
                id={username == messageContent.author ? "You" : "other"}
              >
                <div>
                  <div className="message-content">
                    <p>{messageContent.message}</p>
                  </div>
                  <div className="message-meta">
                    <p>{messageContent.time}</p>
                    <p>{messageContent.author}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="inputfield">
          <input
            className="inputbox"
            type="text"
            placeholder="Please enter your text"
            value={messageInput} // Bind input value to the messageInput state
            onChange={handleInputChange}
          />
          <button className="sendButton" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </div>
    </>
  );
}

export default Main;
