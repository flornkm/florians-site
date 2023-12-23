import fs from "node:fs/promises"

const siteURL = "https://floriankiem.com"

// Add all routes that should be included in the sitemap here, dynamic routes should be marked with dynamic: true
const routes = [
  { path: "/", dynamic: false },
  { path: "/work", dynamic: true },
  { path: "/about", dynamic: false },
  { path: "/feed", dynamic: true },
  { path: "/archive", dynamic: false },
  { path: "/archive/projects", dynamic: true },
  { path: "/archive/short-projects", dynamic: true },
  { path: "/colophon", dynamic: false },
  { path: "/imprint", dynamic: false },
  { path: "/privacy-policy", dynamic: false },
]

const contentDir = new URL("../content", import.meta.url)

// Formats a page for the sitemap
function formatPage(name, published) {
  return `\n  <url>\n    <loc>${name}</loc>\n    <lastmod>${published}</lastmod>\n  </url>`
}

async function generateSitemap() {
  const publishDate = new Date().toISOString()
  let content = `<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="https://www.nsb.com/wp-content/plugins/wordpress-seo-premium/css/main-sitemap.xsl"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`
  for (const route of routes) {
    content += formatPage(`${siteURL}${route.path}`, publishDate)

    if (route.dynamic) {
      const files = await fs.readdir(
        new URL(`../content${route.path}`, import.meta.url)
      )

      for (const file of files) {
        content += formatPage(
          `${siteURL}${route.path}/${file.replace(".md", "")}`,
          publishDate
        )
      }
    }
  }

  content = `${content}\n</urlset>`
  await fs.writeFile(new URL("../public/sitemap.xml", import.meta.url), content)

  console.info("Sitemap successfully generated.")
}

generateSitemap()
