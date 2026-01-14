import React, { useEffect } from 'react';
import "./Styles/App.css";
import "./Styles/theme.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Main from "./Components/Main/Main";
import Login from "./Components/LoginPage/LoginPage";
import Home from "./Components/Home/Home";
import AboutUs from "./Components/AboutUs/AboutUs";
import { WebSocketProvider } from "./Components/Hooks/useWebsocket.jsx";

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <Router>
      <WebSocketProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Login />} />
          <Route path="/chat" element={<Main />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </WebSocketProvider>
    </Router>
  );
}

export default App;

