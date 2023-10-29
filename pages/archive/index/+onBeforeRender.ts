export default onBeforeRender

import { returnContent } from "../../../markdown/convert"

async function onBeforeRender() {
  const projects = await returnContent("archive")

  return {
    pageContext: {
      pageProps: {
        projects: projects,
      },
      documentProps: {
        title: "Archive | Florian - Design Engineer",
        description:
          "In my archive, you will find smaller creations, MVPs, ideas and results from hackathons. Feel free to look through if you are interested.",
        image: "/images/opengraph/og-image-archive.jpg",
      },
    },
  }
}
