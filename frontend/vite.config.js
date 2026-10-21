import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const frontendDir = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  build: {
    outDir: resolve(frontendDir, '../rhyme_mapper/static'),
    emptyOutDir: true,
  },
})
