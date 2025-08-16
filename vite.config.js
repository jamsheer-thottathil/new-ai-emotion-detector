import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Replace 'new-ai-emotion-detector' with your repo name
export default defineConfig({
  base: '/new-ai-emotion-detector/',
  plugins: [react()],
})
