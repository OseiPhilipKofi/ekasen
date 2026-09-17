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
      ".ngrok-free.app" // Allows ALL ngrok-free subdomains automatically
    ],
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    },
    proxy: {
      "/api": {
        // target: "http://localhost:8000", // Adjust this to your actual backend port
        target: "https://a5da-154-163-129-192.ngrok-free.app/", // Adjust this to your actual backend port
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
