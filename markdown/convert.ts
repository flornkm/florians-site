import { marked } from "marked"
import { readFile } from "fs/promises"
import { readdir } from "fs"

export default async function convertMarkdownToHtml(
  slug: string
): Promise<string | boolean> {
  const contentRoot = "./content"

  try {
    await readFile(`${contentRoot}${slug}.md`)
  } catch (error) {
    return false
  }

  const markdown = await readFile(`${contentRoot}${slug}.md`, "utf-8")
  return marked(markdown)
}

export async function returnContent(category: "work") {
  const contentRoot = "./content/" + category

  const content = await new Promise<string[]>((resolve, reject) => {
    readdir(contentRoot, (err, files) => {
      if (err) reject(err)
      resolve(files)
    })
  }).then((files) => {})
}
