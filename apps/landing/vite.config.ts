import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' makes every asset URL relative to wherever this page is
// served from — works at the domain root locally, and under
// GitHub Pages' /<repo-name>/ subpath, with no hardcoded path.
// The landing page still builds straight into dist/ (not a subfolder).
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: '../../dist',
    emptyOutDir: true
  }
})
