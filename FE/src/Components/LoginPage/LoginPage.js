import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import TopNavBar from "../TopnavBar/TopNavBar";
import api from "../../api";

function LoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    room_id: ''
  });

  const handleChange = (e) => {
    setError('');
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        if (!formData.username || !formData.password || !formData.room_id) {
          setError('Username, Password, and Room ID are required');
          setLoading(false);
          return;
        }
        
        // Call login API to verify credentials
        try {
          const response = await api.login(formData.username, formData.password);
          
          // Store JWT token
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          
          // Navigate to chat with authenticated user
          navigate("/chat", { 
            state: { 
              username: formData.username, 
              room_id: formData.room_id 
            } 
          });
        } catch (loginError) {
          // Use HTTP status code for accurate error detection
          if (loginError.status === 404) {
            // User not found in database
            setError('User not registered. Please sign up first.');
          } else if (loginError.status === 401) {
            // Wrong password
            setError('Invalid username or password. Please try again.');
          } else if (loginError.status === 400) {
            // Missing fields
            setError('Please enter both username and password.');
          } else {
            // Generic error
            setError(loginError.message || 'An error occurred. Please try again.');
          }
          setLoading(false);
          return;
        }
      } else {
        // Signup
        if (!formData.username || !formData.email || !formData.password) {
          setError('All fields are required');
          setLoading(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        const response = await api.register(
          formData.username,
          formData.email,
          formData.password
        );
        
        // Auto-login after signup - store token and navigate
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Show success and switch to login view
        setIsLogin(true);
        setError('');
        setFormData({
          username: formData.username,
          email: '',
          password: '',
          confirmPassword: '',
          room_id: ''
        });
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <TopNavBar hideConnectionStatus={true} hideHamburger={true} />
      <div className="home-container">
        <div className="home-content auth-form">
          <h1>{isLogin ? "Welcome Back" : "Create Account"}</h1>
          <p>{isLogin ? "Login to continue chatting" : "Sign up to start chatting"}</p>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            {isLogin && (
              <>
                <div className="form-group">
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="room_id"
                    placeholder="Room ID"
                    value={formData.room_id}
                    onChange={handleChange}
                    required
                  />
                </div>
              </>
            )}

            {!isLogin && (
              <>
                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </>
            )}

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? (isLogin ? "Logging in..." : "Signing up...") : (isLogin ? "Login" : "Sign Up")}
            </button>
          </form>

          <p className="switch-auth">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}>
              {isLogin ? "Sign Up" : "Login"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
