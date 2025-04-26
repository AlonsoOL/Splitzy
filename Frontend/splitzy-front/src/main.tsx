import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Register from './pages/Register';
import './app/index.css'
import App from './app/App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    
    <Router>
        <App />
        <Routes>
          <Route path='/register' element={<Register/>}/>
        </Routes>
    </Router>
  </StrictMode>,
)
