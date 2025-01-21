import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/LiveReportWriter/',  // Updated to match repository name
  plugins: [react()],
  optimizeDeps: {
    include: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities']
  },
  server: {
    port: 5502
  }
}); 