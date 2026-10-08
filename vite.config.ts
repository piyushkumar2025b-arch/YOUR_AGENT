import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {defineConfig, Plugin} from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const fallbackFirebaseConfigPlugin = (): Plugin => ({
  name: 'fallback-firebase-config',
  resolveId(id) {
    if (id.includes('firebase-applet-config.json')) {
      return path.resolve(__dirname, 'firebase-applet-config.json');
    }
    return null;
  },
  load(id) {
    if (id.endsWith('firebase-applet-config.json')) {
      if (fs.existsSync(id)) {
        return fs.readFileSync(id, 'utf-8');
      }
      return JSON.stringify({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID || "ais-dev-nylhsones3edm5kt4mnzfl",
        appId: process.env.VITE_FIREBASE_APP_ID || "1:272225439471:web:3395013145614775a812",
        storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "ais-dev-nylhsones3edm5kt4mnzfl.appspot.com",
        apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyPlaceholderKeyForViteDevEnvironment",
        authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "ais-dev-nylhsones3edm5kt4mnzfl.firebaseapp.com",
        messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "272225439471",
        firestoreDatabaseId: process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || "(default)"
      });
    }
    return null;
  }
});

export default defineConfig(() => {
  return {
    plugins: [fallbackFirebaseConfigPlugin(), react(), tailwindcss()],
    optimizeDeps: {
      include: [
        'firebase/app',
        'firebase/firestore',
        'firebase/auth',
        'lucide-react',
        'canvas-confetti'
      ],
    },
    define: {
      'process.env.GOOGLE_MAPS_PLATFORM_KEY': JSON.stringify(process.env.GOOGLE_MAPS_PLATFORM_KEY || '')
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'dist',
      emptyOutDir: true,
      minify: 'esbuild' as const,
      cssMinify: true,
      sourcemap: false,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'lucide-react', 'motion'],
            pdf: ['pdfjs-dist', 'jspdf'],
            charts: ['recharts'],
          },
        },
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
        '/socket.io': {
          target: 'http://localhost:3000',
          ws: true,
        },
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
