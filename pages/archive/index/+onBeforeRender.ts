export default onBeforeRender

import { PageContext } from "vike/types"
import { returnContent } from "../../../markdown/convert"

async function onBeforeRender(pageContext: PageContext) {
  const projects = await returnContent("archive")
  const folder = pageContext.urlPathname.split("/")[2]

  console.log("folder", folder)

  return {
    pageContext: {
      pageProps: {
        currentFolder: folder,
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
