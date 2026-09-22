import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Every sub-app in this repo owns a subpath matching its folder name,
// and builds into dist/<folder-name>/ at the workspace root. Don't
// change base/outDir unless you also rename the apps/ folder to match.
export default defineConfig({
  plugins: [react()],
  base: '/__APP_NAME__/',
  build: {
    outDir: '../../dist/__APP_NAME__',
    emptyOutDir: true
  }
})
