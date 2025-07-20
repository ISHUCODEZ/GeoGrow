import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
     port: 8080, // Removed to allow Vite to use default or any available port
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});
