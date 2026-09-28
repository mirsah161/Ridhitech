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
            // PERFORMANCE FIX: framer-motion 11+ splits its runtime into
            // separate npm packages (motion-dom, motion-utils) that live
            // in their own node_modules folders — the plain 'framer-motion'
            // substring check below misses them, so they were silently
            // falling into the generic 'vendor' bucket even though they
            // execute on every page that uses useScroll/motion.div.
            if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) return 'vendor-framer-motion';

            // PERFORMANCE FIX: react-router-dom is needed on every route
            // (App.jsx wraps <Routes> at the top level), so it must load
            // eagerly regardless of page. Splitting it out from react/
            // react-dom keeps that unavoidable eager load as small as
            // possible, rather than merging it into a broader chunk.
            if (id.includes('react-router')) return 'vendor-router';
            if (id.includes('react-dom') || id.includes('/react/')) return 'vendor-react';

            if (id.includes('lucide-react')) return 'vendor-icons';
            // PERFORMANCE FIX: react-icons isolated on its own — if it's
            // actually unused anywhere, Rollup tree-shakes it to ~0 bytes
            // regardless of this rule. If it IS used, this stops it from
            // ever being folded into the generic vendor chunk.
            if (id.includes('react-icons')) return 'vendor-react-icons';

            if (id.includes('@tanstack')) return 'vendor-query';

            // PERFORMANCE FIX: reCAPTCHA is only used inside the About
            // page (lazy-loaded via React.lazy in App.jsx). Without this
            // rule it was falling into the generic 'vendor' bucket below,
            // which risked getting pulled into the eagerly-loaded chunks
            // and shipping on every page, including Home. Giving it its
            // own named chunk keeps it tied to About's lazy import.
            if (id.includes('react-google-recaptcha')) return 'vendor-recaptcha';

            return 'vendor';
          }
        },
      },
    },
  },
})