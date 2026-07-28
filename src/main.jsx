import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'


createRoot(document.getElementById('root')).render(
  // <StrictMode>
    
     
        <App />

    
  // </StrictMode>,
)

// Register only in production. Once the app has been opened online, the shell and
// loaded route bundles are available on a later offline refresh.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {
      // Offline support is progressive; a registration failure must not block Notes.
    });
  });
}
