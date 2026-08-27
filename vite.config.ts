import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    {
      name: 'copy-cname',
      closeBundle() {
        copyFileSync(
          `${import.meta.dirname}/CNAME`,
          `${import.meta.dirname}/docs/CNAME`
        )
      },
    },
  ],
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
})
