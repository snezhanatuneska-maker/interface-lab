import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `base` must match the repository name so asset URLs resolve on GitHub Pages
// (https://<user>.github.io/interface-lab/).
export default defineConfig({
  base: '/interface-lab/',
  plugins: [react()],
  // Plotly is large (~1.4 MB min) by nature; silence the default 500 kB warning.
  build: { chunkSizeWarningLimit: 2000 },
})
