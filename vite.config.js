import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.football-data.org',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/v4'),
        headers: { 'X-Auth-Token': '67655057f3934e9f8674d35dec465040' },
      },
      '/db': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})