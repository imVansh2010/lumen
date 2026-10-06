import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Relative base so one build works at any mount point: Vercel serves the site
  // from the domain root, while GitHub Pages serves it from the /lumen/ subpath.
  // Absolute base '/lumen/' 404s every asset on Vercel; '/' 404s them on Pages.
  base: './',
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
})
