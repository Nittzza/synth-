import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    strictPort: false, // tries 5175, 5176… if 5174 is taken
  },
  optimizeDeps: {
    exclude: ['@mediapipe/hands', '@mediapipe/face_mesh'],
  },
})
