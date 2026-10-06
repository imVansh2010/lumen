import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Project site: https://imvansh2010.github.io/lumen/
  // Assets must be requested from /lumen/... , not /... , or Pages 404s them.
  base: '/lumen/',
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
})
