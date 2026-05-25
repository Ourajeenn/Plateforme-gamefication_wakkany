import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Pour GitHub Pages, remplacer 'wakkany' par le nom du repo si différent
export default defineConfig({
  plugins: [react()],
  base: '/plateforme%20wakkany/',
  server: {
    port: 5179,
    strictPort: false
  }
});