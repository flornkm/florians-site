import { Config } from "vike/types"

// https://vike.com/config
export default {
  // https://vike.com/passToClient
  passToClient: ["pageProps", "documentProps", "languageTag"],
  // https://vike.com/clientRouting
  clientRouting: true,
  hydrationCanBeAborted: true,
  // https://vite-plugin-ssr.com/meta
  meta: {
    title: {
      env: "server-and-client",
    },
    description: {
      env: "server-and-client",
    },
    image: {
      env: "server-and-client",
    },
    noindex: {
      env: "server-and-client",
    },
  },
} satisfies Config
