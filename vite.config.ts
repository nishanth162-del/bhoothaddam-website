import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages project site: https://nishanth162-del.github.io/bhoothaddam-website/
export default defineConfig({
  base: '/bhoothaddam-website/',
  plugins: [react()],
})
