export const config = {
  runtime: "edge",
}

const delay = (ms) => new Promise((res) => setTimeout(res, ms))

export default async function handler() {
  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode("<html><body>"))
      await delay(500)
      controller.enqueue(encoder.encode("<ul><li>List Item 1</li>"))
      await delay(500)
      controller.enqueue(encoder.encode("<li>List Item 2</li>"))
      await delay(500)
      controller.enqueue(encoder.encode("<li>List Item 3</li></ul>"))
      await delay(500)
      controller.enqueue(encoder.encode("</body></html>"))
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  })
}
