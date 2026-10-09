import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    strictPort: false,
    cors: true,
    allowedHosts: [
      ".uks1.devtunnels.ms/", // Allows ALL forwarded ports automatically
      ".ngrok-free.app" // Allows ALL ngrok-free subdomains automatically
    ],
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    },
    proxy: {
      proxy: {
      '/api': {
        target: 'http://localhost:8080', // Default fallback string
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '') || '/',
        router: (req) => {
          // You can dynamically return a target string here
          // If you want to strictly enforce the IPv4 IP address for stability:
          return 'http://127.0.0.1:8080';
        }
      }
    }
    },
  },
});
