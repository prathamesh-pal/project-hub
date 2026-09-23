import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Matches the hub repo convention: each sub-app owns a subpath and
// builds into dist/<app-name>/ at the workspace root.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: '../../dist/gradient-generator',
    emptyOutDir: true
  }
})
