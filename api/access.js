/**
 * @param {import('@vercel/node').VercelRequest} req
 * @param {import('@vercel/node').VercelResponse} res
 */
export default async function handler(req, res) {
  if (req.method === "POST") {
    const { key } = req.body

    if (!key) {
      res.statusCode = 400
      res.end()
      return
    }

    if (key === process.env.ADVANCED_KEY) {
      res.statusCode = 200
      res.end()
    } else {
      res.statusCode = 401
      res.end()
    }
  }
}
