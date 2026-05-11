import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    outDir: 'dist',
  },
  // Local dev: proxy /api/* to the live Vercel deployment so the frontend
  // talks to real Supabase-backed serverless functions without running
  // `vercel dev` locally.
  server: {
    port: 5173,
    host: '127.0.0.1',
    proxy: {
      '/api': {
        target: 'https://erm-navigator.vercel.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
