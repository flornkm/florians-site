/**
 * @param {import('@vercel/node').VercelRequest} req
 * @param {import('@vercel/node').VercelResponse} res
 */
export default async function handler(req, res) {
  if (req.method === "POST") {
    /**
     * @type {string}
     */
    let email = JSON.parse(req.body).email

    if (!email || !email.includes("@")) {
      res.statusCode = 400
      res.end()
      return
    }

    try {
      await fetch(process.env.WAITLIST_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })
      res.statusCode = 200
      res.end()
    } catch (error) {
      console.error("Error adding email.", error)
      res.statusCode = 500
      res.end()
    }
  }
}
