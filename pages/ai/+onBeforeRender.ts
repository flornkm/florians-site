export default onBeforeRender

import { PageContextCustom } from "renderer/types"

async function onBeforeRender() {
  return {
    pageContext: {
      documentProps: {
        title: "AI Mode | Florian - Design Engineer",
        description: "Talk to me about design, development, or anything else.",
      } satisfies PageContextCustom["exports"]["documentProps"],
    },
  }
}
