import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,    // Changed from 5173 to avoid conflict with your other app (Habitual habit tracker)
    strictPort: true, // Fail clearly if port is taken, don't silently move
  }
})
