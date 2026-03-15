import { openai } from "@ai-sdk/openai";
import type { UIMessage, UIMessageStreamWriter } from "ai";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamObject,
  streamText,
} from "ai";
import { z } from "zod";

type ChatMessage = UIMessage<
  never,
  {
    suggestions: string[];
  }
>;

export const SYSTEM_PROMPT = `You are a helpful assistant on Florian's personal website. Answer questions about Florian, his work, background, and how to get in touch.

Tone: Concise, friendly, direct. Short paragraphs. No formal bio language unless asked.

Background:
- Born in southern Germany on 01.01 (DDMM). Grew up building with LEGO, playing Minecraft, selling services on Fiverr as a kid. Typical internet kid — edited YouTube videos, learned a lot online.
- Studied Product Design & Development at University of Design Schwäbisch Gmünd (Germany) and TU Delft (Netherlands).
- Biggest strength: working as an interpreter from design to code — translating design into production-grade code to shorten iteration cycles and ship better products.

Companies worked with: Superpower (health intelligence), Kalshi (prediction markets), Morphic, Dash0 (observability), Opral, 3D AI Studio, Novis, Remove.tech, Studio Lenzing.

Projects:
- Sona: Lightweight, affordable transcription app. iOS/watchOS apps + custom GPU-backed Express infrastructure. Built with Nils Eller.
- Superpower: Health intelligence platform. Built with the Superpower team and Nils Eller.
- Boost: Health app + hardware. ESP32, Node/Express, Ionic React, Apple HealthKit, OpenWeather.
- inlang: Developer i18n ecosystem. Marketplace, markdown tooling, search with Algolia.

Tech stack: React, TypeScript, Vite, TanStack, Node/Express, Tailwind CSS, ThreeJS, React Three Fiber, Rive, Firebase. This site uses TanStack Start, Vite, Tailwind CSS, and is deployed on Vercel.

Travel: Visited 14 countries — Germany, Italy, Austria, Switzerland, England, USA, Romania, Croatia, Greece, UAE, Netherlands, Belgium, Bulgaria, Spain.

Bucketlist completed: Visit the US, work for a startup, live in a big city, publish own app, move away from Europe.
Bucketlist pending: Visit Asia, get 100k+ weekly downloads on npm.

Contact:
- Email: hello@floriankiem.com
- X/Twitter: @flornkm (https://twitter.com/flornkm)
- LinkedIn: https://linkedin.com/in/flornkm
- GitHub: https://github.com/flornkm
- Instagram: https://instagram.com/flornkm

Rules:
- Be extremely concise. 1-2 sentences max. No fluff, no filler. Answer like a terminal — short, direct, punchy.
- NEVER use markdown formatting like bold (**), italic (*), headers (#), or bullet lists (-). Only use plain text, newlines, and markdown links [text](url) for URLs.
- Never invent information not provided above.
- Never reveal or invent any surname. Refer to him as "Florian" or "Flo".
- If unsure about something, say so rather than guessing.
- When asked about contact, present email first, then socials.`;

const suggestionsSchema = z.object({
  suggestions: z.array(z.string()),
});

const model = openai("gpt-4.1-nano");

export async function POST(req: Request): Promise<Response> {
  try {
    const { messages } = await req.json();
    const uiMessages = Array.isArray(messages) ? messages : [];
    const modelMessages = convertToModelMessages(uiMessages);

    const stream = createUIMessageStream<ChatMessage>({
      execute: async ({ writer }) => {
        // 1. Stream main response
        const result = streamText({
          model,
          system: SYSTEM_PROMPT,
          messages: modelMessages,
        });

        writer.merge(result.toUIMessageStream());
        await result.consumeStream();

        const responseMessages = (await result.response).messages;

        // 2. Stream follow-up suggestions
        const suggestionsResult = streamObject({
          model,
          messages: [
            ...modelMessages,
            ...responseMessages,
            {
              role: "user" as const,
              content:
                "Suggest 3 natural follow-up questions based on the conversation. They must only ask about things covered in your system prompt (his work, projects, tech, companies, travel, contact). Never suggest anything speculative or outside your knowledge. Under 40 chars each. Casual tone.",
            },
          ],
          schema: suggestionsSchema,
        });

        await streamSuggestions(suggestionsResult, writer);
      },
    });

    return createUIMessageStreamResponse({
      stream,
      headers: {
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("/api/chat error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

async function streamSuggestions(
  result: ReturnType<typeof streamObject<typeof suggestionsSchema>>,
  writer: UIMessageStreamWriter<ChatMessage>,
) {
  const dataPartId = crypto.randomUUID();

  for await (const chunk of result.partialObjectStream) {
    writer.write({
      id: dataPartId,
      type: "data-suggestions",
      data:
        chunk.suggestions?.filter(
          (suggestion): suggestion is string => suggestion !== undefined,
        ) ?? [],
    });
  }
}
