import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.VITE_PUBLIC_BASE ?? "/reaction-diffusion-patternmaker/",
  plugins: [react()],
  build: {
    outDir: "docs",
    assetsDir: "assets",
    emptyOutDir: false,
    sourcemap: true,
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name]-[hash][extname]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        manualChunks: {
          react: ["react", "react-dom", "@tanstack/react-query"],
          icons: ["lucide-react"],
        },
      },
    },
  },
});
