import { marked } from "marked"
import { readFile } from "fs/promises"
import { readdir } from "fs/promises"

export async function convertMarkdownToHtml(
  url: string
): Promise<string | boolean> {
  const contentRoot = "./content"

  const markdown = await readFile(`${contentRoot}${url}.md`, "utf-8")

  return marked(deleteInfo(markdown))
}

export async function returnContent(category: "work") {
  const contentRoot = "./content/" + category
  const tableOfContents = []

  const files = await readdir(contentRoot)

  for (const file of files) {
    const markdown = await readFile(`${contentRoot}/${file}`, "utf-8")
    const properties = markdown.match(/---(.*?)---/s)![1].split("\n")

    const projectInfo = {}
    for (const property of properties) {
      if (property === "") continue
      const key = property.split(": ")[0]
      const value = property.split(": ")[1]
      projectInfo[key] = value
    }

    tableOfContents.push({
      ...projectInfo,
      slug: file.replace(".md", ""),
      url: `/${category}/${file.replace(".md", "")}`,
    })
  }

  tableOfContents.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  return tableOfContents
}

function deleteInfo(string: string, n = 7) {
  return string.replace(new RegExp(`(?:.*?\n){${n - 1}}(?:.*?\n)`), "")
}
