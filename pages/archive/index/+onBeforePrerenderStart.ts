export default onBeforePrerenderStart

import { convertMarkdownToHtml, returnContent } from "../../../markdown/convert"

const rendered = {}

async function onBeforePrerenderStart() {
  const projects = await returnContent("archive")
  for (const project of projects) {
    rendered[project.slug] = await convertMarkdownToHtml(project.url)
  }

  return [
    {
      url: "/archive",
      pageContext: {
        pageProps: {
          projects: projects,
        },
      },
    },
    ...projects.map((project) => {
      const url = `/archive/${project.slug}`
      return {
        url,
        pageContext: {
          pageProps: {
            content: rendered[project.slug],
          },
        },
      }
    }),
  ]
}
