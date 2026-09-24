import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion')) return 'vendor-framer-motion';
            if (id.includes('react-dom') || id.includes('/react/') || id.includes('react-router')) return 'vendor-react';
            if (id.includes('lucide-react') || id.includes('react-icons')) return 'vendor-icons';
            if (id.includes('@tanstack')) return 'vendor-query';
            return 'vendor';
          }
        },
      },
    },
  },
})