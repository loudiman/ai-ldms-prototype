import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base = GitHub Pages project subpath (https://loudiman.github.io/ai-ldms-prototype/)
export default defineConfig({
  base: '/ai-ldms-prototype/',
  plugins: [react(), tailwindcss()],
})
