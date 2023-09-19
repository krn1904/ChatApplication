import React, { useEffect, useState } from "react";
import "./Main.css";
import TopNavBar from "../TopnavBar/TopNavBar";

function Main({ socket, username, room_id }) {
  const [messageInput, setMessageInput] = useState("");
  const [chat, setChat] = useState([]);

  // Event handler to update the message input
  const handleInputChange = (event) => {
    setMessageInput(event.target.value);
  };

  // Event handler for submitting the message
  const handleSubmit = () => {

    const message = {
      author: username,
      message: messageInput,
      room: room_id,
      timestamp: new Date().getHours() + new Date().getMinutes(),
    };
    socket.emit("send_message", message);
    setChat((chat)=>[...chat,message])
    setMessageInput("");
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
      <div className="background">
        <div className="message_background">
        {chat.map((data, index) => (
            <div className="message_box" style={{alignItems : username == data.author ? 'end':'start'}} >
              <div className="message_detail" >
              <div className="Message" key={index}>
                {data.message}
              </div>
              {/* <div className="message_meta-data">
                <div>{data.author}</div>
                <div>{data.timestamp}</div>
              </div> */}
            </div>
            </div>
          ))}
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
