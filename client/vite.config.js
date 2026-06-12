import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy API calls to the Express server during development.
      '/auth': 'http://localhost:4000',
      '/data': 'http://localhost:4000',
      '/payment': 'http://localhost:4000',
    },
  },
});
