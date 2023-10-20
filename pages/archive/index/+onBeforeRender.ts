export default onBeforeRender

import { returnContent } from "../../../markdown/convert"

async function onBeforeRender() {
  const projects = await returnContent("archive")

  return {
    pageContext: {
      pageProps: {
        projects: projects,
      },
    },
  }
}
