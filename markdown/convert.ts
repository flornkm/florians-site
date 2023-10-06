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

    tableOfContents.push({
      title: markdown.split("\n")[1].replace("# ", "").replace("title: ", ""),
      description: markdown.split("\n")[2].replace("description: ", ""),
      icon: markdown.split("\n")[3].replace("icon: ", ""),
      image: markdown.split("\n")[4].replace("cover: ", ""),
      date: markdown.split("\n")[5].replace("date: ", ""),
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
