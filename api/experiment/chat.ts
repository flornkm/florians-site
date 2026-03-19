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

const suggestionsSchema = z.object({
  suggestions: z.array(z.string()),
});

const SYSTEM_PROMPT =
  "You are a helpful, concise assistant. Answer questions clearly in 1-2 sentences. No markdown formatting except links. Plain text only.";

const model = openai("gpt-4.1-nano");

export async function POST(req: Request): Promise<Response> {
  try {
    const { messages } = await req.json();
    const uiMessages = Array.isArray(messages) ? messages : [];
    const modelMessages = convertToModelMessages(uiMessages);

    const stream = createUIMessageStream<ChatMessage>({
      execute: async ({ writer }) => {
        const result = streamText({
          model,
          system: SYSTEM_PROMPT,
          messages: modelMessages,
        });

        writer.merge(result.toUIMessageStream());
        await result.consumeStream();

        const responseMessages = (await result.response).messages;

        const suggestionsResult = streamObject({
          model,
          messages: [
            ...modelMessages,
            ...responseMessages,
            {
              role: "user" as const,
              content:
                "Suggest 3 natural follow-up questions based on the conversation. Under 40 chars each. Casual tone.",
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
    console.error("/api/experiment/chat error:", error);
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
