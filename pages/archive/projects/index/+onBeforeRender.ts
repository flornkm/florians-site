export default onBeforeRender

import { returnContent } from "../../../../markdown/convert"

async function onBeforeRender() {
  const projects = await returnContent("archive/projects")

  return {
    pageContext: {
      pageProps: {
        projects: projects,
      },
      documentProps: {
        title: "Projects Archive | Florian - Design Engineer",
        description:
          "In my projects archive, you will find some shortened case studies.",
        image: "/images/opengraph/og-image-archive.jpg",
      },
    },
  }
}
