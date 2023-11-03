import { renderPage } from "vike/server"

// We use JSDoc instead of TypeScript because Vercel seems buggy with /api/**/*.ts files

/**
 * @param {import('@vercel/node').VercelRequest} req
 * @param {import('@vercel/node').VercelResponse} res
 */
export default async function handler(req, res) {
  const { url } = req
  const { path } = req.query

  if (path) {
    res.end(path)
  } else if (path !== undefined) {
    if (url === undefined) throw new Error("req.url is undefined")

    const pageContextInit = { urlOriginal: url }
    const pageContext = await renderPage(pageContextInit)
    const { httpResponse } = pageContext
    console.log("httpResponse", !!httpResponse)

    if (!httpResponse) {
      res.statusCode = 200
      res.end()
      return
    }

    const { body, statusCode, contentType } = httpResponse
    res.statusCode = statusCode
    res.setHeader("content-type", contentType)
    res.end(body)
  }
}
