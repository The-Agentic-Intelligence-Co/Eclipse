import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        'side-panel': resolve(__dirname, 'src/side-panel/index.html'),
        'background': resolve(__dirname, 'src/background/background.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    },
    target: 'es2015',
    minify: false, // Para debugging de la extensión
    sourcemap: true,
    emptyOutDir: false // ← Esto evita que Vite elimine archivos existentes
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
