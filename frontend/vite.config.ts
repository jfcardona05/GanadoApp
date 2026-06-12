import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [
    react(),
  ],
  preview: {
    host: '0.0.0.0',
    allowedHosts: [
      'adorable-alignment-production-852f.up.railway.app',
      'adorable-alignment-production-153c.up.railway.app',
    ],
  },
})