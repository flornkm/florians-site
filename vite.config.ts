import preact from "@preact/preset-vite"
import ssr from "vike/plugin"
import Icons from "unplugin-icons/vite"
import telefunc from "telefunc/vite"

const config = {
  plugins: [
    preact(),
    ssr({
      prerender: {
        partial: true,
      },
    }),
    Icons({ compiler: "jsx", jsx: "preact" }),
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
