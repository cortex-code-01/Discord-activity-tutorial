import {defineConfig} from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  envDir: '../',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        ws: true,
      },

      '/ws': {
        target: 'ws://localhost:8080',
        changeOrigin: true,
        ws: true,
      },
    },
    hmr: {
      clientPort: 443,
    },
  },
});
