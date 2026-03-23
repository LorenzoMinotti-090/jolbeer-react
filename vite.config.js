import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiUrl = (env.VITE_API_URL || env.VITE_BACKEND_URL || "").replace(/\/$/, "");
  const proxyTarget = apiUrl || "http://localhost:3000";

  return {
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: false,
        },
        "^/prodotti/.+\\.(png|jpe?g|webp|gif|svg|avif)$": {
          target: proxyTarget,
          changeOrigin: false,
        },
      },
    },
    define: {
      "import.meta.env.VITE_API_URL": JSON.stringify(apiUrl),
      "import.meta.env.VITE_BACKEND_URL": JSON.stringify(apiUrl),
    },
  };
})
