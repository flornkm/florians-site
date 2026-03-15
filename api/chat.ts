import { openai } from "@ai-sdk/openai";
import type { UIMessage, UIMessageStreamWriter } from "ai";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamObject,
  streamText,
} from "ai";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SYSTEM_PROMPT: string = JSON.parse(
  readFileSync(join(__dirname, "content-data.json"), "utf-8"),
).systemPrompt;

type ChatMessage = UIMessage<
  never,
  {
    suggestions: string[];
  }
>;

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
                "Suggest 3 natural follow-up questions based on the conversation. Always phrase questions using 'Florian' or 'he/him', never 'you'. They must only ask about things covered in your system prompt (his work, projects, tech, companies, travel, contact). Never suggest anything speculative or outside your knowledge. Under 40 chars each. Casual tone.",
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
        chunk.suggestions?.filter((suggestion): suggestion is string => suggestion !== undefined) ??
        [],
    });
  }
}
