// Auto-récupération en cas d'erreur de préchargement de chunk après un nouveau déploiement
window.addEventListener('vite:preloadError', (event) => {
  console.warn('[Vite] Chunk obsolète détecté lors de la navigation, actualisation...', event);
  const reloaded = sessionStorage.getItem('vite_preload_reloaded');
  if (!reloaded) {
    sessionStorage.setItem('vite_preload_reloaded', 'true');
    window.location.reload();
  }
});

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './pages/App.jsx';
import { AssetErrorBoundary } from './components/common/AssetErrorHandler';
import './index.css';
import 'iconify-icon';
import { ThemeProvider } from './context/ThemeContext';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker for offline capability
try {
  registerSW({ immediate: true });
} catch (e) {
  console.warn('PWA registration skipped:', e);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AssetErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </AssetErrorBoundary>
  </React.StrictMode>
);
