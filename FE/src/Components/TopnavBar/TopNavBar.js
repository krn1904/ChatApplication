import React, { useState, useEffect } from 'react';
import './TopNavBar.css';
import Slider from '../Slider/Slider';
import { useWebSocket } from '../Hooks/useWebsocket.jsx';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const TopNavBar = ({ hideConnectionStatus = false, hideHamburger = false, showBackButton = false }) => {
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const { isConnected } = useWebSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const isAboutPage = location.pathname === '/about';
  const hasState = location.state?.username && location.state?.room_id;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  const toggleSlider = () => {
    setIsSliderOpen(!isSliderOpen);
  };

  return (
    <>
      <nav className="top-navbar">
        <div className="container">
          <div className="left-section">
            {(showBackButton || (isAboutPage && hasState)) ? (
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
          <div className="right-section">
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                    <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                </>
              )}
            </button>
            <ul className="nav">
              <li className="nav-item">
                <Link to="/about" className="nav-link" state={location.state}>About Us</Link>
              </li>
              {!hideConnectionStatus && (
                <li className="nav-item">
                  <button 
                    className="logout-button" 
                    onClick={() => navigate('/', { replace: true })}
                  >
                    Logout
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
      {!hideHamburger && (
        <>
          <Slider isOpen={isSliderOpen} onClose={() => setIsSliderOpen(false)} />
          <div 
            className={`slider-overlay ${isSliderOpen ? 'visible' : ''}`} 
            onClick={() => setIsSliderOpen(false)}
          />
        </>
      )}
    </>
  );
};

export default TopNavBar;
