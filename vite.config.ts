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
    port: 3001,
    open: true,
  },
  build: {
    outDir: "build", // Mantener "build" para compatibilidad con Vercel
    sourcemap: false,
    rollupOptions: {
      output: {
        // Code splitting manual — función requerida en Vite 8 (rolldown)
        manualChunks: (id: string) => {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router")) {
              return "vendor";
            }
            if (id.includes("@mui")) {
              return "mui";
            }
            if (id.includes("@reduxjs") || id.includes("react-redux")) {
              return "redux";
            }
            if (id.includes("@tanstack")) {
              return "query";
            }
          }
        },
      },
    },
  },
  // Variables de entorno: Vite usa VITE_ en lugar de REACT_APP_
  // Las definimos acá para mantener retrocompatibilidad durante la transición
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
  },
});
