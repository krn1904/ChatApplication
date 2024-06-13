import "./Styles/App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Main from "./Components/Main/Main.js";
import Login from "./Components/LoginPage/LoginPage.jsx";
import { WebSocketProvider } from "./Components/Hooks/useWebsocket.jsx";

function App() {
  return (
    <Router>
      <WebSocketProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Main />} />
        </Routes>
      </WebSocketProvider>
    </Router>
  );
}

export default App;