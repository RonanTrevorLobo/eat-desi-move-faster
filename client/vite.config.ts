import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The browser calls /api/... on port 5173. Vite forwards those calls to Express on port 3000.
// (Module 5: "Localhost proxy: the page calls /api. Vite forwards that to port 3000.")
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:3000' },
  },
})
