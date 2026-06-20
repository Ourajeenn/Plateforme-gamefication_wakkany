import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './pages/App.jsx';
import './index.css';
import 'iconify-icon';
// Register PWA service worker for offline capability
try {
  const { registerSW } = await import('virtual:pwa-register');
  registerSW({ immediate: false });
} catch (e) {
  console.warn('PWA registration skipped:', e);
}


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);