import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import rehypeUnwrapImages from "rehype-unwrap-images";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    {
      enforce: "pre",
      ...mdx({
        remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
        // Standalone images render as block components (a <div> card), so they
        // must not be wrapped in a <p> — that's invalid HTML and breaks SSR.
        rehypePlugins: [rehypeUnwrapImages],
        providerImportSource: "@mdx-js/react",
      }),
    },
    tanstackStart(),
    nitro(),
    react(),
    tailwindcss(),
  ],
  build: {
    target: "es2022",
  },
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@public": path.resolve(__dirname, "./public"),
    },
  },
});
