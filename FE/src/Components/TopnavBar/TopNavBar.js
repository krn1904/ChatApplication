import React from 'react';
import './TopNavBar.css'; // Import your custom CSS

function TopNavBar() {
  return (
    <div className="top-navbar">
      <div className="container">
        {/* Navbar Brand */} 
         {/* Heading */}
        <div className="navbar-brand">Chat</div>

        {/* Navbar Links */}
        <ul className="nav">
          <li className="nav-item">
            <a className="nav-link" href="#home">Home</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#about">About</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#services">Services</a>
          </li>
        </ul>
      </div>
    </div>

  );
}

export default TopNavBar;
