import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss() // <-- Hooks v4 compiler directly into Vite's build stream
  ],
  server: {
    port: 3000,
    open: true
  }
})