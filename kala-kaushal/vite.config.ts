import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@/components": path.resolve(__dirname, "./client/src/components"),
      "@/lib": path.resolve(__dirname, "./client/src/lib"),
      "@/hooks": path.resolve(__dirname, "./client/src/hooks"),
      "@/pages": path.resolve(__dirname, "./client/src/pages"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
