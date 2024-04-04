import OpenAI from "openai"

export const config = {
  runtime: "edge",
  supportsResponseStreaming: true,
}

const openai = new OpenAI(process.env.OPENAI_API_KEY)

export default async function handler(req) {
  if (req.method === "POST") {
    const buf = await req.arrayBuffer()
    const rawBody = new TextDecoder().decode(buf)
    const { message } = JSON.parse(rawBody)

    try {
      const stream = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
        stream: true,
      })

      const encoder = new TextEncoder()

      const readable = new ReadableStream({
        async start(controller) {
          for await (const chunk of stream) {
            controller.enqueue(encoder.encode(chunk.choices[0]?.delta?.content))
          }
          controller.close()
        },
      })

      return new Response(readable, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      })
    } catch (error) {
      console.error("Error generating response.", error)
      return new Response("Internal Server Error", { status: 500 })
    }
  }
}
