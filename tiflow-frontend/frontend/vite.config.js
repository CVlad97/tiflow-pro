import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/tiflow-pro/',
  plugins: [react()],
  server: {
    port: 5173
  }
}))
