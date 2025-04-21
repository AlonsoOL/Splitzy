import { Routes, Route } from "react-router-dom";
import './App.css'
import Login from "./login/login.jsx";


function Home(){
  return (
    <>
      <div>Home Page</div>
    </>
  )
}

function App() {
  return (
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
  )
}

export default App
