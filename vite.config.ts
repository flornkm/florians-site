import preact from "@preact/preset-vite"
import ssr from "vite-plugin-ssr/plugin"

const config = {
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
}

export default config
