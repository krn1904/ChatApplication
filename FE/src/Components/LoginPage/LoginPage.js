import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLogin = location.pathname === "/login";
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    username: "",
    room_id: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear any previous errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLogin) {
      // Login logic
      if (formData.username.trim() && formData.room_id.trim()) {
        navigate("/chat", {
          state: {
            username: formData.username,
            room_id: formData.room_id
          }
        });
      } else {
        setError("Please fill in all fields");
      }
    } else {
      // Signup logic
      try {
        // Password match validation
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords don't match!");
          return;
        }

        // Password length validation
        if (formData.password.length < 8) {
          setError("Password must be at least 8 characters long");
          return;
        }

        const response = await fetch('http://localhost:8001/api/users/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: formData.username,
            email: formData.email,
            password: formData.password
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Registration failed');
        }

        // Registration successful
        alert('Registration successful! Please login.');
        navigate("/login");

      } catch (error) {
        setError(error.message || 'Registration failed');
      }
    }
  };

  return (
    <div className="home-container">
      <div className="home-content auth-form">
        <h1>{isLogin ? "Welcome Back" : "Create Account"}</h1>
        <p>{isLogin ? "Login to continue chatting" : "Sign up to start chatting"}</p>
        
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

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="auth-button login">
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <p className="switch-auth">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span 
            onClick={() => navigate(isLogin ? "/signup" : "/login")}
            className="switch-link"
          >
            {isLogin ? "Sign Up" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
