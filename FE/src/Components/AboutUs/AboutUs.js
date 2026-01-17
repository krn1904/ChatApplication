import React from 'react';
import './AboutUs.css';
import TopNavBar from '../TopnavBar/TopNavBar';
import { useLocation } from 'react-router-dom';

const AboutUs = () => {
  const location = useLocation();
  
  // If coming from chat, we'll have the state
  // If coming directly to About Us, we won't have state (and that's okay)
  const hasState = location.state?.username && location.state?.room_id;

  return (
    <div className="about-container">
      <TopNavBar showBackButton={hasState} />
      <div className="about-wrapper">
        <div className="about-hero">
          <h1>Welcome to Chat App</h1>
          <p className="hero-subtitle">Connecting People in Real-Time</p>
        </div>

        <div className="about-content">
          <section className="mission-section">
            <div className="section-content">
              <h2>Our Mission</h2>
              <p>
                To provide a seamless and secure communication platform that connects people 
                in real-time, making conversations more accessible and enjoyable.
              </p>
            </div>
          </section>

          <section className="features-section">
            <h2>Key Features</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">💬</div>
                <h3>Real-time Chat</h3>
                <p>Instant messaging with real-time updates</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <h3>Secure</h3>
                <p>End-to-end encrypted communications</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">👥</div>
                <h3>Room System</h3>
                <p>Create and join different chat rooms</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📱</div>
                <h3>Responsive</h3>
                <p>Works seamlessly on all devices</p>
              </div>
            </div>
          </section>

          <section className="tech-section">
            <h2>Technology Stack</h2>
            <div className="tech-cards">
              <div className="tech-category">
                <h3>Frontend</h3>
                <div className="tech-items">
                  <div className="tech-item">React.js</div>
                  <div className="tech-item">WebSocket</div>
                  <div className="tech-item">CSS3</div>
                </div>
              </div>
              <div className="tech-category">
                <h3>Backend</h3>
                <div className="tech-items">
                  <div className="tech-item">Node.js</div>
                  <div className="tech-item">Express</div>
                  <div className="tech-item">MongoDB</div>
                </div>
              </div>
            </div>
          </section>

          <section className="contact-section">
            <h2>Get in Touch</h2>
            <div className="contact-content">
              <p>
                Have questions or suggestions? We'd love to hear from you!
              </p>
              <div className="contact-info">
                <a href="mailto:support@chatapp.com" className="contact-button">
                  Contact Us
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutUs; 