import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // Прокси на production сервер или локальный
        target: process.env.VITE_API_URL?.replace('/api/v1', '') || 'https://backof.onrender.com',
        changeOrigin: true,
        secure: true, // HTTPS для production
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
})


