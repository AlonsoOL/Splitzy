import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router} from "react-router-dom";
import { WebSocketProvider } from './context/WebSocketContext';
import './app/index.css'
import App from './app/App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WebSocketProvider>
      <Router>
          <App />
      </Router>
    </WebSocketProvider>
  </StrictMode>,
)
