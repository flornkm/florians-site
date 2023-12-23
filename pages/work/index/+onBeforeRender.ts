import { returnContent } from "../../../markdown/convert"

export default onBeforeRender

async function onBeforeRender() {
  const projects = await returnContent("work")

  return {
    pageContext: {
      pageProps: {
        projects: projects,
      },
      documentProps: {
        title: "Work | Florian - Design Engineer",
        description:
          "Actual work from my studies, services for cooporations and more. All combined as readable case studies with imagery.",
      },
    },
  }
}
