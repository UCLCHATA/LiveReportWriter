import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Get the repository name from package.json or environment variable
const base = process.env.NODE_ENV === 'production' ? '/chata-autism-report/' : '/';

export default defineConfig({
  plugins: [react()],
  base,
  server: {
    port: 5500,
    open: true // Auto-open browser
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  }
}); 