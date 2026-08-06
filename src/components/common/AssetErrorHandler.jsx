/**
 * AssetErrorHandler — Gère les erreurs de chargement d'assets
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
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Asset Loading Error</h1>
            <p className="text-zinc-400 mb-6">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#c28e3a] text-black font-bold rounded-xl hover:bg-[#e8b96a]"
            >
              Reload Page
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
