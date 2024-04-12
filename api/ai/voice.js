export const config = {
  runtime: "edge",
  supportsResponseStreaming: true,
}

export default async function handler(req) {
  if (req.method === "POST") {
    try {
      const buf = await req.arrayBuffer()
      const rawBody = new TextDecoder().decode(buf)
      const { message, key } = JSON.parse(rawBody)

      if (key !== process.env.ADVANCED_KEY)
        return new Response("Unauthorized", { status: 401 })

      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}/stream?optimize_streaming_latency=1`,
        {
          method: "POST",
          headers: {
            "xi-api-key": process.env.ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: message,
            voice_settings: {
              stability: 0.8,
              similarity_boost: 0.8,
            },
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.statusText}`)
      }

      const audioStream = new ReadableStream({
        start(controller) {
          const reader = response.body.getReader()
          const pump = () =>
            reader.read().then(({ done, value }) => {
              if (done) {
                controller.close()
                return
              }
              controller.enqueue(value)
              pump()
            })
          pump()
        },
      })

      return new Response(audioStream, {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "no-cache",
          "Content-Disposition": "attachment; filename=audio.mp3",
        },
      })
    } catch (error) {
      console.error("Error generating response:", error)
      return new Response("Internal Server Error", { status: 500 })
    }
  }
}
