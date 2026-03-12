import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { nitro } from "nitro/vite";
import { defineConfig, type Plugin } from "vite";

/**
 * Vite plugin to serve .mdx files as raw text when imported with ?rawmdx query.
 * Runs before the MDX compiler so the source isn't transformed.
 */
function rawMdxPlugin(): Plugin {
  return {
    name: "raw-mdx",
    enforce: "pre",
    resolveId(source, importer) {
      if (source.endsWith("?rawmdx")) {
        const filePath = source.replace("?rawmdx", "");
        // Resolve relative to importer or project root
        const resolved = importer
          ? path.resolve(path.dirname(importer.replace(/\?.*$/, "")), filePath)
          : path.resolve(__dirname, filePath.replace(/^\//, ""));
        return `\0rawmdx:${resolved}`;
      }
    },
    load(id) {
      if (id.startsWith("\0rawmdx:")) {
        const filePath = id.replace("\0rawmdx:", "");
        const content = fs.readFileSync(filePath, "utf-8");
        return `export default ${JSON.stringify(content)}`;
      }
    },
  };
}

export default defineConfig({
  plugins: [
    rawMdxPlugin(),
    {
      enforce: "pre",
      ...mdx({
        remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
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
