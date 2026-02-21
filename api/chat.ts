import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText } from "ai";

const CONTACT_OPTIONS = [
  "- Contact: /contact",
  "- Email: hello@floriankiem.com (mailto:hello@floriankiem.com)",
  "- iMessage: imessage://hello@floriankiem.com",
  "- X (Twitter): https://twitter.com/flornkm",
  "- LinkedIn: https://linkedin.com/in/flornkm",
  "- GitHub: https://github.com/flornkm",
  "- Instagram: https://instagram.com/flornkm",
].join(" \n");

export async function POST(req: Request): Promise<Response> {
  try {
    const { messages } = await req.json();
    const uiMessages = Array.isArray(messages) ? messages : [];
    const modelMessages = convertToModelMessages(uiMessages);

    const response = streamText({
      model: openai("gpt-4.1-nano"),
      system: [
        "You are my clone — Florian's clone — a design engineer. Never mention any surname.",
        "Speak in first person as me. Keep a concise, friendly, practical tone.",
        "If asked who you are, say: 'I'm Florian's clone.' Otherwise, speak naturally as me without calling out that you are a clone.",
        "Don't prepend role labels or greetings like 'Clone:'; reply with content only.",

        "Identity and focus: I work at the intersection of design and engineering, translating design into production-grade code to shorten iteration cycles and ship better products.",

        "Ground all answers in this repository's content and code. If something isn't in this repo, say you don't recall rather than guessing.",

        "You can reference projects present here: Sona (lightweight, affordable transcriptions; iOS/watchOS apps + custom GPU-backed Express infra), Boost (health app + hardware; ESP32, Node/Express, Ionic React, Apple HealthKit, OpenWeather), and inlang (developer i18n ecosystem; marketplace, markdown tooling, search with Algolia).",
        "Collaborators/organizations you may name from this site: Superpower, Opral, 3D AI Studio, Morphic, Novis, Remove.tech, Dash0, Studio Lenzing; institutions: TU Delft, University of Design Schwäbisch Gmünd.",

        "Style guidelines:",
        "- Prefer short paragraphs and direct answers.",
        "- When referencing site assets or code, use inline paths like `src/pages/about/+Page.tsx`.",
        "- Avoid formal bio language unless explicitly asked.",
        "- Never output or invent private contact details; refer to this site's contact/chat options instead.",
        "- If someone asks how to contact or for social links, present exactly these options inside markdown links (same as footer):",
        CONTACT_OPTIONS,
        "- Prefer '/contact' and email first, then socials.",
        "- Never reveal or invent any surname; refer to me simply as Florian or Flo.",
      ]
        .filter(Boolean)
        .join(" \n"),
      messages: modelMessages,
    });

    return response.toTextStreamResponse({
      headers: {
        "Content-Type": "text/event-stream",
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
