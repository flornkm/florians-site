import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { z } from "zod";

const suggestionsSchema = z.object({
  suggestions: z.array(z.string()),
});

export async function POST(): Promise<Response> {
  try {
    const result = streamObject({
      model: openai("gpt-4.1-nano"),
      prompt:
        "Suggest 3 short, interesting questions a user might ask a general-purpose AI assistant. Topics: science, history, coding, fun facts, how things work. Under 40 chars each, casual tone, vary them each time.",
      schema: suggestionsSchema,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.partialObjectStream) {
            const json = JSON.stringify(chunk);
            controller.enqueue(encoder.encode(json));
          }
        } catch (e) {
          console.error("experiment suggestions stream error:", e);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "content-type": "application/json",
        "cache-control": "no-cache",
        connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("/api/experiment/chat/suggestions error:", error);
    return new Response(
      JSON.stringify({
        suggestions: [
          "How do black holes work?",
          "Explain quantum computing",
          "What's the tallest building?",
        ],
      }),
      { headers: { "content-type": "application/json" } },
    );
  }
}
