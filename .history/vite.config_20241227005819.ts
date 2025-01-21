import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  base: '/',
  server: {
    port: 5502,
    strictPort: true,
  }
}); 