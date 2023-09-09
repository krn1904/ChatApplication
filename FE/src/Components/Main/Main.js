import React, { useState } from "react";
import "./Main.css";
import io from "socket.io-client";
import TopNavBar from "../TopnavBar/TopNavBar";

function Main() {
  const [messageInput, setMessageInput] = useState("");
  const [submittedMessage, setSubmittedMessage] = useState("");

  // Event handler to update the message input
  const handleInputChange = (event) => {
    setMessageInput(event.target.value);
  };

  // Event handler for submitting the message
  const handleSubmit = () => {
    setSubmittedMessage(messageInput);
    setMessageInput("");
  };

  return (
    <>
      <TopNavBar />
      <div className="background">
        <div className="message_background">
          {submittedMessage && (
            <div className="Message">{submittedMessage}</div>
          )}
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
