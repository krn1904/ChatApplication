import "./Styles/App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Main from "./Components/Main/Main.js";
import Login from "./Components/LoginPage/LoginPage.js";
import Home from "./Components/Home/Home.js";
import { WebSocketProvider } from "./Components/Hooks/useWebsocket.jsx";
import AboutUs from './Components/AboutUs/AboutUs';

function App() {
  return (
    <Router>
      <WebSocketProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Login />} />
          <Route path="/chat" element={<Main />} />
          <Route path="/about" element={<AboutUs />} />
        </Routes>
      </WebSocketProvider>
    </Router>
  );
}

export default App;