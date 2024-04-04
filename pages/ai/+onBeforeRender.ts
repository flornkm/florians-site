export default onBeforeRender

import { returnContent } from "../../markdown/convert"
import { PageContextCustom } from "renderer/types"

async function onBeforeRender() {
  // const projects = await returnContent("work")

  return {
    pageContext: {
      // pageProps: {
      //   projects: projects,
      // },
      documentProps: {
        title: "AI Mode | Florian - Design Engineer",
        description: "Talk to me about design, development, or anything else.",
      } satisfies PageContextCustom["exports"]["documentProps"],
    },
  }
}
