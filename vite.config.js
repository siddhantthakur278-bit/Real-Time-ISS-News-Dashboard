import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy ISS location endpoint - bypasses CORS completely
      '/iss-now': {
        target: 'http://api.open-notify.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/iss-now/, '/iss-now.json'),
      },
      // Proxy astronauts endpoint
      '/astros': {
        target: 'http://api.open-notify.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/astros/, '/astros.json'),
      },
    },
  },
})
