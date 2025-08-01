import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    ...(process.env.NODE_ENV === 'development' ? [
      visualizer({
        filename: 'dist/stats.html',
        open: true,
        gzipSize: true,
      })
    ] : [])
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    global: 'globalThis',
  },
  build: {
    target: 'es2015',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          store: ['zustand'],
          icons: ['lucide-react'],
          supabase: ['@supabase/supabase-js'],
          pdf: ['@react-pdf/renderer'],
        },
      },
    },
  },
  server: {
    fs: {
      strict: false
    }
  }
});
