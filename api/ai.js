import OpenAI from "openai"
import data from "../content/data/ai-personalization.json"

export const config = {
  runtime: "edge",
  supportsResponseStreaming: true,
}

const openai = new OpenAI(process.env.OPENAI_API_KEY)

export default async function handler(req) {
  if (req.method === "POST") {
    const buf = await req.arrayBuffer()
    const rawBody = new TextDecoder().decode(buf)
    const { messages } = JSON.parse(rawBody)

    try {
      const stream = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You act as a human clone following the personalization text: ${data.input}`,
          },
          ...messages,
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
