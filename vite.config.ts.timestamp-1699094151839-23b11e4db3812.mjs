// vite.config.ts
import preact from "file:///Users/floriank/mine/website/designwithtech/node_modules/@preact/preset-vite/dist/esm/index.mjs";
import ssr from "file:///Users/floriank/mine/website/designwithtech/node_modules/vike/dist/esm/node/plugin/index.js";
import Icons from "file:///Users/floriank/mine/website/designwithtech/node_modules/unplugin-icons/dist/vite.mjs";
import { defineConfig } from "file:///Users/floriank/mine/website/designwithtech/node_modules/vite/dist/node/index.js";
import { fileURLToPath } from "url";
var __vite_injected_original_import_meta_url = "file:///Users/floriank/mine/website/designwithtech/vite.config.ts";
var vite_config_default = defineConfig(() => ({
  resolve: {
    alias: [
      {
        find: "#components",
        replacement: fileURLToPath(
          new URL("./interface/components", __vite_injected_original_import_meta_url)
        )
      },
      {
        find: "#hooks",
        replacement: fileURLToPath(
          new URL("./interface/hooks", __vite_injected_original_import_meta_url)
        )
      },
      {
        find: "#sections",
        replacement: fileURLToPath(
          new URL("./interface/sections", __vite_injected_original_import_meta_url)
        )
      },
      {
        find: "#layouts",
        replacement: fileURLToPath(
          new URL("./interface/layouts", __vite_injected_original_import_meta_url)
        )
      },
      {
        find: "#markdown",
        replacement: fileURLToPath(new URL("./markdown", __vite_injected_original_import_meta_url))
      },
      {
        find: "#design-system",
        replacement: fileURLToPath(new URL("./design-system", __vite_injected_original_import_meta_url))
      }
    ]
  },
  plugins: [
    preact(),
    ssr({
      prerender: true
    }),
    Icons({ compiler: "jsx", jsx: "preact" })
  ],
  optimizeDeps: {
    include: [
      "preact",
      "preact/devtools",
      "preact/debug",
      "preact/jsx-dev-runtime",
      "preact/hooks"
    ]
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvZmxvcmlhbmsvbWluZS93ZWJzaXRlL2Rlc2lnbndpdGh0ZWNoXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvZmxvcmlhbmsvbWluZS93ZWJzaXRlL2Rlc2lnbndpdGh0ZWNoL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9mbG9yaWFuay9taW5lL3dlYnNpdGUvZGVzaWdud2l0aHRlY2gvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgcHJlYWN0IGZyb20gXCJAcHJlYWN0L3ByZXNldC12aXRlXCJcbmltcG9ydCBzc3IgZnJvbSBcInZpa2UvcGx1Z2luXCJcbmltcG9ydCBJY29ucyBmcm9tIFwidW5wbHVnaW4taWNvbnMvdml0ZVwiXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiXG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSBcInVybFwiXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoKSA9PiAoe1xuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IFtcbiAgICAgIHtcbiAgICAgICAgZmluZDogXCIjY29tcG9uZW50c1wiLFxuICAgICAgICByZXBsYWNlbWVudDogZmlsZVVSTFRvUGF0aChcbiAgICAgICAgICBuZXcgVVJMKFwiLi9pbnRlcmZhY2UvY29tcG9uZW50c1wiLCBpbXBvcnQubWV0YS51cmwpXG4gICAgICAgICksXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBmaW5kOiBcIiNob29rc1wiLFxuICAgICAgICByZXBsYWNlbWVudDogZmlsZVVSTFRvUGF0aChcbiAgICAgICAgICBuZXcgVVJMKFwiLi9pbnRlcmZhY2UvaG9va3NcIiwgaW1wb3J0Lm1ldGEudXJsKVxuICAgICAgICApLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgZmluZDogXCIjc2VjdGlvbnNcIixcbiAgICAgICAgcmVwbGFjZW1lbnQ6IGZpbGVVUkxUb1BhdGgoXG4gICAgICAgICAgbmV3IFVSTChcIi4vaW50ZXJmYWNlL3NlY3Rpb25zXCIsIGltcG9ydC5tZXRhLnVybClcbiAgICAgICAgKSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGZpbmQ6IFwiI2xheW91dHNcIixcbiAgICAgICAgcmVwbGFjZW1lbnQ6IGZpbGVVUkxUb1BhdGgoXG4gICAgICAgICAgbmV3IFVSTChcIi4vaW50ZXJmYWNlL2xheW91dHNcIiwgaW1wb3J0Lm1ldGEudXJsKVxuICAgICAgICApLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgZmluZDogXCIjbWFya2Rvd25cIixcbiAgICAgICAgcmVwbGFjZW1lbnQ6IGZpbGVVUkxUb1BhdGgobmV3IFVSTChcIi4vbWFya2Rvd25cIiwgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBmaW5kOiBcIiNkZXNpZ24tc3lzdGVtXCIsXG4gICAgICAgIHJlcGxhY2VtZW50OiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoXCIuL2Rlc2lnbi1zeXN0ZW1cIiwgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgICB9LFxuICAgIF0sXG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICBwcmVhY3QoKSxcbiAgICBzc3Ioe1xuICAgICAgcHJlcmVuZGVyOiB0cnVlLFxuICAgIH0pLFxuICAgIEljb25zKHsgY29tcGlsZXI6IFwianN4XCIsIGpzeDogXCJwcmVhY3RcIiB9KSxcbiAgXSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgaW5jbHVkZTogW1xuICAgICAgXCJwcmVhY3RcIixcbiAgICAgIFwicHJlYWN0L2RldnRvb2xzXCIsXG4gICAgICBcInByZWFjdC9kZWJ1Z1wiLFxuICAgICAgXCJwcmVhY3QvanN4LWRldi1ydW50aW1lXCIsXG4gICAgICBcInByZWFjdC9ob29rc1wiLFxuICAgIF0sXG4gIH0sXG59KSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBbVQsT0FBTyxZQUFZO0FBQ3RVLE9BQU8sU0FBUztBQUNoQixPQUFPLFdBQVc7QUFFbEIsU0FBUyxvQkFBb0I7QUFDN0IsU0FBUyxxQkFBcUI7QUFMZ0ssSUFBTSwyQ0FBMkM7QUFPL08sSUFBTyxzQkFBUSxhQUFhLE9BQU87QUFBQSxFQUNqQyxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTDtBQUFBLFFBQ0UsTUFBTTtBQUFBLFFBQ04sYUFBYTtBQUFBLFVBQ1gsSUFBSSxJQUFJLDBCQUEwQix3Q0FBZTtBQUFBLFFBQ25EO0FBQUEsTUFDRjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxRQUNOLGFBQWE7QUFBQSxVQUNYLElBQUksSUFBSSxxQkFBcUIsd0NBQWU7QUFBQSxRQUM5QztBQUFBLE1BQ0Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsUUFDTixhQUFhO0FBQUEsVUFDWCxJQUFJLElBQUksd0JBQXdCLHdDQUFlO0FBQUEsUUFDakQ7QUFBQSxNQUNGO0FBQUEsTUFDQTtBQUFBLFFBQ0UsTUFBTTtBQUFBLFFBQ04sYUFBYTtBQUFBLFVBQ1gsSUFBSSxJQUFJLHVCQUF1Qix3Q0FBZTtBQUFBLFFBQ2hEO0FBQUEsTUFDRjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxRQUNOLGFBQWEsY0FBYyxJQUFJLElBQUksY0FBYyx3Q0FBZSxDQUFDO0FBQUEsTUFDbkU7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsUUFDTixhQUFhLGNBQWMsSUFBSSxJQUFJLG1CQUFtQix3Q0FBZSxDQUFDO0FBQUEsTUFDeEU7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsSUFBSTtBQUFBLE1BQ0YsV0FBVztBQUFBLElBQ2IsQ0FBQztBQUFBLElBQ0QsTUFBTSxFQUFFLFVBQVUsT0FBTyxLQUFLLFNBQVMsQ0FBQztBQUFBLEVBQzFDO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDWixTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
