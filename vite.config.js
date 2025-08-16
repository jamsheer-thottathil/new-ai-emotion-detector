import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    base: mode === 'production'
      ? '/new-ai-emotion-detector/'  // GitHub Pages repo name
      : '/',                          // local dev
    plugins: [react()],
  }
})
