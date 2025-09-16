import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/provenance': {
        target: 'https://ayurtrace-farmer.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/batches': {
        target: 'https://ayurtrace-farmer.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/labtest': {
        target: 'https://ayurtrace-farmer.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/labtests': {
        target: 'https://ayurtrace-farmer.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/collection': {
        target: 'https://ayurtrace-farmer.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/collections': {
        target: 'https://ayurtrace-farmer.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/processing': {
        target: 'https://ayurtrace-farmer.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/healthz': {
        target: 'https://ayurtrace-farmer.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/dev': {
        target: 'https://ayurtrace-farmer.onrender.com',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
