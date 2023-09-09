import "./Styles/App.css";
import Main from "./Components/Main/Main";
import LoginPage from "./Components/LoginPage/LoginPage";
import { BrowserRouter, Route, BrowserRouter as Router, Routes } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={ <LoginPage/> }/>
        <Route path="/Home" element={ <Main/> }/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
