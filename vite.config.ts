import mdx from "@mdx-js/rollup";
import sitemap from "@qalisa/vike-plugin-sitemap";
import { SitemapEntry } from "@qalisa/vike-plugin-sitemap/dist/types";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import vike from "vike/plugin";
import { defineConfig } from "vite";
import { getContent } from "./src/lib/mdx";

const BASE_URL = "https://floriankiem.com" as const;
const EXCLUDED = ["/imprint/", "/privacy-policy/"];

const [projects, items] = await Promise.all([getContent("work"), getContent("collection")]);

export default defineConfig({
  root: "src",
  plugins: [
    {
      enforce: "pre",
      ...mdx({
        remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
        providerImportSource: "@mdx-js/react",
      }),
    },
    react(),
    tailwindcss(),
    vike(),
    sitemap({
      baseUrl: BASE_URL,
      pagesDir: path.resolve(__dirname, "./src/pages"),
      defaultChangefreq: "monthly",
      sitemapGenerator: (entries) => {
        const excluded = EXCLUDED.map((url) => new URL(url, BASE_URL).href);
        const filtered = entries.filter((e) => !excluded.includes(e.loc));
        const dynamicEntries = [...projects, ...items].map((e) => ({
          loc: new URL(e.url + "/", BASE_URL).href,
          priority: 0.5,
          lastmod: new Date().toISOString(),
          changefreq: "monthly",
        }));
        return [...filtered, ...dynamicEntries] as SitemapEntry[];
      },
    }),
  ],
  publicDir: "../public",
  build: {
    target: "es2022",
    outDir: path.resolve(__dirname, "dist"),
  },
  server: {
    port: 3000,
  },
  ssr: {
    noExternal: ["vike", "vike-react", "react-globe.gl", "globe.gl", "three-globe", "streamdown"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@public": path.resolve(__dirname, "./public"),
    },
  },
});
