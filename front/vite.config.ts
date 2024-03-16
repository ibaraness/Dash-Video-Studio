import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dynamicImport from 'vite-plugin-dynamic-import'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dynamicImport()
  ],
  preview: {
    port: 8080,
    strictPort: true,
   },
   server: {
    port: 8080,
    strictPort: true,
    host: true,
    origin: "http://0.0.0.0:8080",
   },
})
