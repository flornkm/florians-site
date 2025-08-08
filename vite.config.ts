import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import vike from "vike/plugin";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  plugins: [react(), tailwindcss(), vike()],
  publicDir: "../public",
  build: {
    target: "es2022",
    outDir: path.resolve(__dirname, "dist"),
  },
  server: {
    port: 3000,
  },
  ssr: {
    noExternal: ["vike", "vike-react", "react-globe.gl", "globe.gl", "three-globe"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@public": path.resolve(__dirname, "./public"),
    },
  },
});
