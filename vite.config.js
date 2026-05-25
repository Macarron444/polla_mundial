import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

// Plugin que reemplaza el hash de versión en sw.js en cada build
function swVersionPlugin() {
  return {
    name: 'sw-version',
    closeBundle() {
      const hash = Date.now().toString(36)   // hash único por build
      const swPath = resolve(__dirname, 'dist/sw.js')
      try {
        const content = readFileSync(swPath, 'utf8')
        writeFileSync(swPath, content.replace('__VITE_BUILD_HASH__', hash))
        console.log(`✅ SW actualizado con hash: ${hash}`)
      } catch (e) {
        console.warn('⚠️ No se pudo actualizar el hash del SW:', e.message)
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), swVersionPlugin()],

  // Copiar sw.js a dist/ desde public/ (Vite lo hace automáticamente)
  publicDir: 'public',

  build: {
    outDir: 'dist',
    // Genera nombres con hash para cache-busting automático
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
  },

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
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
})
