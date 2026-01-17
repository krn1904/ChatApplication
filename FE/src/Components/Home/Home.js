import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import TopNavBar from "../TopnavBar/TopNavBar";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="page-wrapper">
      <TopNavBar hideConnectionStatus={true} hideHamburger={true} />
      <div className="home-container">
        <div className="home-content">
          <h1>Welcome to ChatApp</h1>
          <p>Connect and chat with people around the world</p>
          <div className="button-container">
            <button 
              className="auth-button login"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
            <button 
              className="auth-button signup"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home; 