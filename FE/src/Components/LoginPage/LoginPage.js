import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import TopNavBar from "../TopnavBar/TopNavBar";

function LoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    room_id: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      navigate("/chat", { state: { username: formData.username, room_id: formData.room_id } });
    } else {
      console.log('Signup data:', formData);
    }
  };

  return (
    <div className="page-wrapper">
      <TopNavBar hideConnectionStatus={true} hideHamburger={true} />
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

            <button type="submit" className="auth-button">
              {isLogin ? "Login" : "Sign Up"}
            </button>
          </form>

          <p className="switch-auth">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Sign Up" : "Login"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
