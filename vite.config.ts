import tailwindcss from "@tailwindcss/vite";
import vercel from "@vite-plugin-vercel/vike";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss(), vercel()],
  build: {
    target: "es2022",
  },
  server: {
    port: 3000,
  },
  ssr: {
    noExternal: ["vike", "vike-react"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@icons": path.resolve(__dirname, "./src/icons"),
    },
  },
});
