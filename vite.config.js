import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: "/", // Ensure it's set correctly
  build: {
    outDir: "dist", // Ensure the output is correct
  },
  server: {
    historyApiFallback: true, // Ensures routing works properly
    proxy: {
      '/api': {
        target: 'https://kobklaster.tw1.ru',
        changeOrigin: true,
        secure: false,
      }
    },
    host: '0.0.0.0',
  },
});
