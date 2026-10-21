import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const FRONTEND_DIR = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  build: {
    outDir: resolve(FRONTEND_DIR, '../rhyme_mapper/static'),
    emptyOutDir: true,
  },
  server: {
    proxy:{
      "/api":{
        target:
        "http://localhost:8000",
        changeOrigin: true,
      }
    }
  }
})
