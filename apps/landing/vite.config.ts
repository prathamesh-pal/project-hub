import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The landing page owns the repo root (base '/') and builds straight
// into dist/, unlike every other app which owns a subpath.
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: '../../dist',
    emptyOutDir: true
  }
})
