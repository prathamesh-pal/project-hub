import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' keeps asset URLs relative, so this app works correctly
// whether it's served at the domain root, nested under a GitHub Pages
// /<repo-name>/ subpath, or moved. outDir still matches the folder name
// so build-all.sh assembles everything into dist/<folder-name>/.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: '../../dist/__APP_NAME__',
    emptyOutDir: true
  }
})
