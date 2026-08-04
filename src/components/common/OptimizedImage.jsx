/**
 * OptimizedImage — Composant image avec lazy loading et fallback WebP
 * Supporte WebP avec fallback PNG/JPG
 */

import React, { useState, useEffect } from 'react';

export default function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  decoding = 'async',
  ...props
}) {
  const [imageSrc, setImageSrc] = useState(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Auto-convert to WebP if available
    if (src && !hasError) {
      const webpSrc = src.replace(/\.(png|jpg|jpeg)$/i, '.webp');
      setImageSrc(webpSrc);
    }
  }, [src, hasError]);

  const handleError = () => {
    if (!hasError && src !== imageSrc) {
      // Fallback to original image
      setImageSrc(src);
      setHasError(true);
    }
  };

  return (
    <picture>
      {/* WebP source */}
      {imageSrc && imageSrc.endsWith('.webp') && (
        <source srcSet={imageSrc} type="image/webp" />
      )}
      
      {/* Fallback image */}
      <img
        src={imageSrc || src}
        alt={alt}
        loading={loading}
        decoding={decoding}
        className={className}
        width={width}
        height={height}
        onError={handleError}
        {...props}
      />
    </picture>
  );
}
