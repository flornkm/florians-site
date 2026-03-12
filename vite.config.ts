import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

export default defineConfig({
  plugins: [
    {
      enforce: "pre",
      ...mdx({
        remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
        providerImportSource: "@mdx-js/react",
      }),
    },
    tanstackStart(),
    react(),
    tailwindcss(),
  ],
  build: {
    target: "es2022",
  },
  server: {
    port: 3000,
  },
  ssr: {
    noExternal: ["react-globe.gl", "globe.gl", "three-globe", "streamdown"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@public": path.resolve(__dirname, "./public"),
    },
  },
});
