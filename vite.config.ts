import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { join } from 'path'

// Plugin to copy 404.html for GitHub Pages SPA routing
const copy404Plugin = () => {
  return {
    name: 'copy-404',
    writeBundle() {
      copyFileSync(
        join(__dirname, '404.html'),
        join(__dirname, 'dist', '404.html')
      )
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  base: '/AnimalApp/',
  plugins: [react(), copy404Plugin()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
