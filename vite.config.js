import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Local dev proxy for our internal API routes
      // This allows the frontend to call /api/iss-now locally
      '/api/iss-now': {
        target: 'http://api.open-notify.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/iss-now/, '/iss-now.json'),
      },
      '/api/astros': {
        target: 'http://api.open-notify.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/astros/, '/astros.json'),
      },
    },
  },
})
