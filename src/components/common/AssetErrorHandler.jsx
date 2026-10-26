/**
 * AssetErrorHandler — Gère les erreurs de chargement d'assets et les chunks obsolètes
 */

import React from 'react';

export class AssetErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Asset loading error:', error, errorInfo);

    const isChunkError =
      error?.message?.includes('Failed to fetch dynamically imported module') ||
      error?.message?.includes('Importing a module script failed') ||
      error?.name === 'ChunkLoadError';

    // Auto-reload une seule fois en cas de chunk obsolète après un redéploiement
    if (isChunkError && !sessionStorage.getItem('asset_error_auto_reloaded')) {
      sessionStorage.setItem('asset_error_auto_reloaded', 'true');
      this.handleHardReload();
    }
  }

  handleHardReload = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        for (const key of keys) {
          await caches.delete(key);
        }
      }
    } catch (e) {
      console.warn('Cache clear error:', e);
    }
    // Recharge propre avec contournement de cache
    window.location.href = window.location.origin + window.location.pathname + '?refresh=' + Date.now();
  };

  render() {
    if (this.state.hasError) {
      const isChunkError =
        this.state.error?.message?.includes('Failed to fetch dynamically imported module') ||
        this.state.error?.message?.includes('Importing a module script failed') ||
        this.state.error?.name === 'ChunkLoadError';

      return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white px-4">
          <div className="max-w-md w-full text-center bg-zinc-900/80 border border-[#c28e3a]/30 p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
            <div className="w-16 h-16 rounded-2xl bg-[#c28e3a]/10 border border-[#c28e3a]/30 flex items-center justify-center mx-auto mb-6 text-[#c28e3a]">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h1 className="text-2xl font-heading font-black text-white uppercase tracking-wide mb-3">
              {isChunkError ? 'Mise à jour disponible' : 'Chargement interrompu'}
            </h1>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6 font-monda">
              {isChunkError
                ? "Une nouvelle version de Wakkany a été déployée. Cliquez sur le bouton ci-dessous pour actualiser l'application avec les dernières fonctionnalités."
                : (this.state.error?.message || "Une ressource nécessaire n'a pas pu être chargée.")}
            </p>
            <button
              onClick={this.handleHardReload}
              className="w-full py-3.5 px-6 bg-[#c28e3a] text-black font-heading font-bold uppercase tracking-wider rounded-xl hover:bg-[#e8b96a] transition-all duration-200 shadow-lg shadow-[#c28e3a]/20 cursor-pointer"
            >
              Actualiser l&apos;application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * SafeImage — Charge une image avec fallback
 */
export function SafeImage({ src, alt, className, onError, ...props }) {
  const [error, setError] = React.useState(false);

  const handleError = (e) => {
    console.error(`Failed to load image: ${src}`);
    setError(true);
    onError?.(e);
  };

  if (error) {
    return (
      <div className={`${className} bg-zinc-900 flex items-center justify-center text-zinc-500`}>
        <span className="text-xs">Image unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
      {...props}
    />
  );
}

/**
 * SafeAudio — Charge un audio avec fallback
 */
export function SafeAudio({ src, ...props }) {
  const [error, setError] = React.useState(false);

  if (error) {
    console.warn(`Failed to load audio: ${src}`);
    return null;
  }

  return (
    <audio
      onError={() => setError(true)}
      {...props}
    >
      <source src={src} type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
  );
}
