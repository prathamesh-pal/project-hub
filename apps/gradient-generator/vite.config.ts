import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Matches the hub repo convention: each sub-app owns a subpath and
// builds into dist/<app-name>/ at the workspace root.
export default defineConfig({
  plugins: [react() , tailwindcss()],
  base: './',
  build: {
    outDir: '../../dist/gradient-generator',
    emptyOutDir: true
  }
})
