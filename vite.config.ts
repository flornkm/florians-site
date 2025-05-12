import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import vercel from "vite-plugin-vercel";

export default defineConfig({
  plugins: [react(), tailwindcss(), vercel()],
  build: {
    target: "es2022",
  },
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "@components": path.resolve(__dirname, "./components"),
      "@pages": path.resolve(__dirname, "./pages"),
      "@hooks": path.resolve(__dirname, "./hooks"),
      "@icons": path.resolve(__dirname, "./icons"),
    },
  },
});
