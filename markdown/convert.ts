import { marked } from "marked"
import { readFile } from "fs/promises"
import { readdir } from "fs/promises"

export default async function convertMarkdownToHtml(
  url: string
): Promise<string | boolean> {
  const contentRoot = "./content"

  try {
    await readFile(`${contentRoot}${url}.md`)
  } catch (error) {
    return false
  }

  const markdown = await readFile(`${contentRoot}${url}.md`, "utf-8")
  return marked(markdown)
}

export async function returnContent(category: "work") {
  const contentRoot = "./content/" + category
  const tableOfContents = []

  const files = await readdir(contentRoot)

  for (const file of files) {
    const markdown = await readFile(`${contentRoot}/${file}`, "utf-8")

    tableOfContents.push({
      title: markdown.split("\n")[1].replace("# ", "").replace("title: ", ""),
      slug: file.replace(".md", ""),
      url: `/${category}/${file.replace(".md", "")}`,
    })
  }

  return tableOfContents
}
