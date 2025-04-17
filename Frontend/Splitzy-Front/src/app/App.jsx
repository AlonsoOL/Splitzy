import { Routes, Route } from "react-router-dom";
import './App.css'
import Login from "./login/login.jsx";

function App() {
  return (
      <div>
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
  )
}

export default App
