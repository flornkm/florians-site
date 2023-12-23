export default onBeforeRender

import { returnContent } from "../../markdown/convert"
import { PageContextCustom } from "renderer/types"

async function onBeforeRender() {
  const projects = await returnContent("work")

  return {
    pageContext: {
      pageProps: {
        projects: projects,
      },
      documentProps: {
        title: "Florian - Design Engineer",
        description: "A designer and developer building digital products.",
      } satisfies PageContextCustom["exports"]["documentProps"],
    },
  }
}
