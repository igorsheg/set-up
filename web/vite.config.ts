import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), vanillaExtractPlugin()],
  resolve: {
    alias: {
      "@styles": "/src/styles",
      "@components": "/src/components",
      "@types": "/src/types",
      "@models": "/src/models",
      "@routes": "/src/routes",
      "@dialogs": "/src/dialogs",
      "@menus": "/src/menus",
      "@services": "/src/services",
      "@store": "/src/store",
      "@hooks": "/src/hooks",
      "@views": "/src/views",
    },
  },
  server: {
    port: 5173,
    strictPort: true,

    hmr: {
      clientPort: 443,
      port: 5173,
      protocol: "wss",
    },

    proxy: {
      "/api": {
        target: "http://localhost:5432",
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
