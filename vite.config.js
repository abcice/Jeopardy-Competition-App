import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        // Remove the problematic import - we'll handle imports in individual files
        // additionalData: `@import "src/index.scss";`
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://jeopardy-competition-app.onrender.com/',
        changeOrigin: true
      }
    }
  }
})