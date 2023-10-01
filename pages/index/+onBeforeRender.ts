export default onBeforeRender

import { returnContent } from "../../markdown/convert"

async function onBeforeRender() {
  const projects = await returnContent("work")

  return {
    pageContext: {
      pageProps: {
        projects: projects,
      },
    },
  }
}
