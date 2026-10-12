import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // In development, requests to /api are forwarded to the Express backend,
    // so the browser sees one origin and login cookies work without CORS tricks.
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})