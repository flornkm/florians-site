export default onBeforeRender

import { returnContent } from "../../markdown/convert"

async function onBeforeRender() {
  const projects = await returnContent("work")

  const pageProps = {
    projects: projects,
  }
  return {
    pageContext: {
      pageProps,
    },
  }
}
