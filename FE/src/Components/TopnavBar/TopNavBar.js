import React, { useState } from 'react';
import './TopNavBar.css'; // Import your custom CSS
import Slider from '../Slider/Slider';
import { useWebSocket } from '../Hooks/useWebsocket';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const TopNavBar = ({ hideConnectionStatus = false, hideHamburger = false }) => {
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const { isConnected } = useWebSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const isAboutPage = location.pathname === '/about';
  const hasState = location.state?.username && location.state?.room_id;

  const toggleSlider = () => {
    setIsSliderOpen(!isSliderOpen);
  };

  return (
    <>
      <nav className="top-navbar">
        <div className="container">
          <div className="left-section">
            {isAboutPage && hasState ? (
              <Link to="/chat" className="back-link" state={location.state}>
                <div className="back-button">
                  <span className="back-arrow">←</span>
                  <span>Back to Chat</span>
                </div>
              </Link>
            ) : !hideHamburger && (
              <div className="hamburger-menu" onClick={toggleSlider}>
                <div className={`hamburger-icon ${isSliderOpen ? 'open' : ''}`}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div className="navbar-brand-container">
              <span className="navbar-brand">Chat App</span>
              {!hideConnectionStatus && (
                <div className="connection-status-indicator">
                  <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
                  <span className="status-text">{isConnected ? 'Connected' : 'Disconnected'}</span>
                </div>
              )}
            </div>
          </div>
          <ul className="nav">
            <li className="nav-item">
              <Link to="/about" className="nav-link" state={location.state}>About Us</Link>
            </li>
          </ul>
        </div>
      </nav>
      
      {/* Overlay */}
      {!hideHamburger && (
        <div 
          className={`slider-overlay ${isSliderOpen ? 'visible' : ''}`} 
          onClick={() => setIsSliderOpen(false)}
        />
      )}
      
      {/* Slider component */}
      {!hideHamburger && (
        <Slider isOpen={isSliderOpen} onClose={() => setIsSliderOpen(false)} />
      )}
    </>
  );
};

export default TopNavBar;
