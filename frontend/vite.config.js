import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL || 'http://localhost:5000'

  return {
    plugins: [react()],
    server: {
      port: 5173,
      // Dev proxy — only used locally when VITE_API_URL is not set
      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
        },
        '/uploads': {
          target: apiUrl,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,   // disable sourcemaps in production for security
      rollupOptions: {
        output: {
          // Split vendor chunks for better caching
          manualChunks: {
            react:    ['react', 'react-dom'],
            router:   ['react-router-dom'],
            socketio: ['socket.io-client'],
          },
        },
      },
    },
  }
})
