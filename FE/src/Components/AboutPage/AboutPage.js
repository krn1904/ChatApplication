import React from 'react';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-container">
      <div className="about-content">
        <h1 className="about-title">About Our Chat Application</h1>
        
        <div className="about-section">
          <h2>What We Do</h2>
          <p>
            Our real-time chat application provides a seamless communication experience 
            for users to connect and collaborate in real-time. Built with modern web 
            technologies, we offer instant messaging with room-based conversations.
          </p>
        </div>

        <div className="about-section">
          <h2>Features</h2>
          <ul className="features-list">
            <li>Real-time messaging with WebSocket technology</li>
            <li>Room-based chat organization</li>
            <li>User-friendly interface</li>
            <li>Cross-platform compatibility</li>
            <li>Secure and reliable communication</li>
            <li>Responsive design for all devices</li>
          </ul>
        </div>

        <div className="about-section">
          <h2>Technology Stack</h2>
          <div className="tech-grid">
            <div className="tech-item">
              <h3>Frontend</h3>
              <p>React.js, CSS3, WebSocket API</p>
            </div>
            <div className="tech-item">
              <h3>Backend</h3>
              <p>Node.js, Express.js, WebSocket</p>
            </div>
            <div className="tech-item">
              <h3>Database</h3>
              <p>MongoDB, Mongoose</p>
            </div>
            <div className="tech-item">
              <h3>Deployment</h3>
              <p>Render.com, Cloud hosting</p>
            </div>
          </div>
        </div>

        <div className="about-section">
          <h2>Our Mission</h2>
          <p>
            We strive to create a simple, efficient, and enjoyable chat experience 
            that brings people together. Our focus is on reliability, performance, 
            and user satisfaction.
          </p>
        </div>

        <div className="about-section">
          <h2>Contact</h2>
          <p>
            Have questions or suggestions? We'd love to hear from you! 
            Reach out to us for support or feedback.
          </p>
          <div className="contact-info">
            <p><strong>Email:</strong> support@chatapp.com</p>
            <p><strong>GitHub:</strong> github.com/your-username/chat-application</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage; 