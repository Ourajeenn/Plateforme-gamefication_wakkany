/**
 * OfflineBanner.jsx
 * Bannière flottante indiquant l'état de connexion de l'utilisateur.
 * - Rouge / icône coupée = hors ligne
 * - Jaune / icône lente = connexion faible (2G/slow-2g)
 * - Vert / icône checkmark = reconnexion réussie (s'efface après 5s)
 */
import React, { useEffect, useState } from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export default function OfflineBanner() {
  const { isOnline, wasOffline, quality } = useNetworkStatus();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isOnline || wasOffline || quality === 'slow') {
      setVisible(true);
    } else {
      // Petite animation de sortie
      const t = setTimeout(() => setVisible(false), 400);
      return () => clearTimeout(t);
    }
  }, [isOnline, wasOffline, quality]);

  if (!visible) return null;

  // État de reconnexion (vert)
  if (isOnline && wasOffline) {
    return (
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3
                   px-5 py-3 rounded-full bg-emerald-500 text-white shadow-2xl shadow-emerald-500/30
                   animate-slide-up font-monda text-sm font-bold tracking-wider"
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        <span className="text-lg">✓</span>
        <span>Connexion rétablie — synchronisation en cours…</span>
      </div>
    );
  }

  // Connexion lente (jaune)
  if (isOnline && quality === 'slow') {
    return (
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3
                   px-5 py-3 rounded-full shadow-2xl font-monda text-sm font-bold tracking-wider"
        style={{
          background: 'linear-gradient(135deg, #b45309, #d97706)',
          color: '#fff',
          animation: 'slideUp 0.3s ease-out',
        }}
      >
        <iconify-icon icon="mdi:signal-cellular-1" width="20" />
        <span>Connexion lente — certaines données peuvent tarder</span>
      </div>
    );
  }

  // Hors ligne (rouge/noir)
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999]"
      style={{ animation: 'slideUp 0.3s ease-out' }}
    >
      {/* Bande principale */}
      <div
        className="flex items-center justify-center gap-3 px-4 py-3 text-white
                   font-monda text-sm font-bold tracking-wider"
        style={{
          background: 'linear-gradient(135deg, #1a0000, #3d0000)',
          borderTop: '2px solid #ef4444',
        }}
      >
        <iconify-icon icon="mdi:wifi-off" width="20" />
        <span>
          Mode hors connexion — le quiz et les jeux restent disponibles
        </span>
        <span className="ml-2 px-2 py-0.5 rounded-full bg-red-500/30 border border-red-500/60 text-red-300 text-xs">
          OFFLINE
        </span>
      </div>
    </div>
  );
}
