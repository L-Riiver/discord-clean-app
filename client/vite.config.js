import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  envDir: '../',
  server: {
    host: true, // Listen on all interfaces
    strictPort: true, // Fail if port is occupied
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
    hmr: {
      protocol: 'wss', // Force secure websockets for tunnel
      clientPort: 443,
    },
  },
});
