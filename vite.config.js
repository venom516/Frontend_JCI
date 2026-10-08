import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    // Écouter sur les deux familles IP : sinon Vite ne répond que sur ::1
    // (IPv6) et l'app est inaccessible via 127.0.0.1, ce qui change l'origine
    // CORS vue par le navigateur.
    host: true,
  },
});
