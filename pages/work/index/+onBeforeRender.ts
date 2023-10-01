import { returnContent } from "../../../markdown/convert"

export default onBeforeRender

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
