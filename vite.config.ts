import preact from "@preact/preset-vite";
import ssr from "vike/plugin";
import { defineConfig } from "vite";

export default defineConfig(() => ({
  plugins: [
    preact(),
    ssr({
      prerender: true,
    }),
  ],
  optimizeDeps: {
    include: [
      "preact",
      "preact/devtools",
      "preact/debug",
      "preact/jsx-dev-runtime",
      "preact/hooks",
    ],
  },
  server: {
    allowedHosts: true,
  },
}));
