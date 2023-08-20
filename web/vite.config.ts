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
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
