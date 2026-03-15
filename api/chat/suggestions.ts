import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { z } from "zod";
import { SYSTEM_PROMPT } from "../chat.ts";

const suggestionsSchema = z.object({
  suggestions: z.array(z.string()),
});

export async function POST(): Promise<Response> {
  try {
    const result = streamObject({
      model: openai("gpt-5-nano"),
      system: SYSTEM_PROMPT,
      prompt:
        "A visitor just arrived. Suggest 3 short questions they might ask about Florian. Only ask about things you actually know from your system prompt — his work, projects, companies, tech stack, travel, or contact. Never suggest speculative questions. Under 40 chars each, casual tone, vary them each time.",
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
          console.error("suggestions stream error:", e);
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
    console.error("/api/chat/suggestions error:", error);
    return new Response(
      JSON.stringify({
        suggestions: [
          "What does Florian do?",
          "What projects has he built?",
          "How can I reach him?",
        ],
      }),
      { headers: { "content-type": "application/json" } },
    );
  }
}
