import { marked } from "marked"
import { readFile } from "fs/promises"
import { readdir } from "fs/promises"

export async function convertMarkdownToHtml(
  url: string
): Promise<string | boolean> {
  const contentRoot = "./content"

  let markdown = await readFile(`${contentRoot}${url}.md`, "utf-8")

  const convertedHTML = marked(
    deleteInfo(
      markdown + '\n <base target="_blank">',
      markdown.match(/---(.*?)---/s)![1].split("\n").length
    )
  )

  return convertedHTML
}

export async function returnContent(
  category: "work" | "archive/projects" | "archive/short-projects" | "feed"
) {
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
      // @ts-ignore
      projectInfo[key] = value
    }

    tableOfContents.push({
      ...projectInfo,
      slug: file.replace(".md", ""),
      url: `/${category}/${file.replace(".md", "")}`,
      short: markdown.length < 2000,
    })
  }

  tableOfContents.sort(
    (a, b) =>
      // @ts-expect-error
      new Date(b.date.split("/")[1], b.date.split("/")[0]).getTime() -
      // @ts-expect-error
      new Date(a.date.split("/")[1], a.date.split("/")[0]).getTime()
  )

  return tableOfContents
}

function deleteInfo(string: string, n: number) {
  return string.replace(new RegExp(`(?:.*?\n){${n - 1}}(?:.*?\n)`), "")
}
