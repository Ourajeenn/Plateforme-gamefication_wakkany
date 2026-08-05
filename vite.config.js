import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Inclut tous les assets dans le precache automatique
      includeAssets: ['**/*'],
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
        // Précache tous les chunks JS/CSS/HTML/audio générés par Vite
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,webp,woff,woff2,mp3,ogg,wav}'],
        // Taille max d'un fichier en precache (5 MB)
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          // Documents HTML → NetworkFirst avec fallback offline
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Scripts & styles → StaleWhileRevalidate (rapide + toujours frais)
          {
            urlPattern: ({ request }) =>
              request.destination === 'script' || request.destination === 'style',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          // Images → CacheFirst (chargement instantané)
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Fonts → CacheFirst permanent
          {
            urlPattern: ({ request }) => request.destination === 'font',
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Google Fonts CSS → StaleWhileRevalidate
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          // Iconify icons → CacheFirst
          {
            urlPattern: /^https:\/\/.*\.iconify\.design\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'iconify-cache',
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Fichiers audio (MP3, WAV, OGG) → CacheFirst pour réduire les erreurs réseau en production
          {
            urlPattern: /\.(?:mp3|wav|ogg)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
        // Toutes les routes SPA → renvoie index.html (navigation offline)
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
      },
      manifest: {
        name: `Wakkany — renoué avec vos racines d'origine`,
        short_name: 'Wakkany',
        description: 'Plateforme de gamification familiale — fonctionne même sans connexion',
        start_url: '/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#09090b',
        theme_color: '#09090b',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
        categories: ['education', 'games', 'family'],
        lang: 'fr',
      },
    }),
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
  ],
  base: process.env.VITE_BASE_PATH || '/',
  server: {
    port: 5179,
    strictPort: false,
    // HTTP/2 support for better multiplexing
    http2: true,
    headers: {
      'Cache-Control': 'no-cache',
    },
  },
  build: {
    // Aggressive minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      mangle: true,
    },
    // Optimized chunk splitting handled below
    // Target modern browsers for smaller bundles (esnext for full ES2022+ support)
    target: 'esnext',
    // CSS code splitting
    cssCodeSplit: true,
    // Source maps only for production debugging
    sourcemap: false,
    // Increase chunk size warning threshold to reduce noisy warnings
    chunkSizeWarningLimit: 1500,
    // Use a function to create focused chunks for very large deps like three
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('node_modules/three')) return 'three';
            if (id.includes('node_modules/@react-three')) return 'three-react';
            if (id.includes('node_modules/framer-motion')) return 'animation';
            if (id.includes('node_modules/@supabase')) return 'supabase';
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'react-vendor';
            return 'vendor';
          }
        },
        // keep asset naming configured below
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setupTests.js',
    exclude: ['node_modules', 'tests/e2e/**'],
  },
});