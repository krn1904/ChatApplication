import React from 'react';
import './Slider.css';

const Slider = ({ isOpen, onClose }) => {
  return (
    <div className={`slider ${isOpen ? 'open' : ''}`}>
      <div className="slider-header">
        <h3>Chat Rooms</h3>
      </div>
      <div className="slider-content">
        {/* Content will be added later */}
        <div className="placeholder-content">
          <p>Room list will appear here</p>
        </div>
      </div>
    </div>
  );
};

export default Slider; 