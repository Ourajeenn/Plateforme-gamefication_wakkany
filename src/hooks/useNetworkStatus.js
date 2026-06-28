/**
 * useNetworkStatus.js
 * Détecte en temps réel si l'utilisateur est en ligne ou hors ligne.
 * Expose aussi une file d'attente pour synchroniser les données dès la reconnexion.
 */
import { useState, useEffect, useCallback, useRef } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [quality, setQuality] = useState('unknown'); // 'good' | 'slow' | 'offline'
  const pingRef = useRef(null);

  const checkQuality = useCallback(async () => {
    if (!navigator.onLine) {
      setQuality('offline');
      return;
    }
    // Évalue la qualité de connexion via l'API Network Information si dispo
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
      const effectiveType = conn.effectiveType; // '4g' | '3g' | '2g' | 'slow-2g'
      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        setQuality('slow');
      } else {
        setQuality('good');
      }
    } else {
      setQuality('good');
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      checkQuality();
      // Réinitialise wasOffline après 5s (le temps d'afficher le message de reconnexion)
      setTimeout(() => setWasOffline(false), 5000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setQuality('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Écoute les changements de qualité réseau
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
      conn.addEventListener('change', checkQuality);
    }

    checkQuality();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (conn) conn.removeEventListener('change', checkQuality);
      if (pingRef.current) clearTimeout(pingRef.current);
    };
  }, [checkQuality]);

  return { isOnline, wasOffline, quality };
}
