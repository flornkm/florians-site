export default onBeforeRender

import { returnContent } from "../../markdown/convert"

async function onBeforeRender() {
  const projects = await returnContent("sidework")

  return {
    pageContext: {
      pageProps: {
        projects: projects,
      },
    },
  }
}
