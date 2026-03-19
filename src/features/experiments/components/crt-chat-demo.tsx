import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTypingAnimation } from "../../../hooks/use-typing-animation";
import { CRTDisplay } from "../../contact/components/crt/crt-display";
import type { CRTMessage } from "../../contact/components/crt/crt-text-renderer";

type ChatMessage = UIMessage<never, { suggestions: string[] }>;

const BOOT_MESSAGE = "Terminal ready. Ask me anything.";

const FALLBACK_SUGGESTIONS = [
  "How do black holes work?",
  "Explain quantum computing",
  "What's the tallest building?",
];

function parseLastJson(buffer: string): string[] | null {
  const lastBrace = buffer.lastIndexOf("}");
  if (lastBrace === -1) return null;
  let depth = 0;
  let start = -1;
  for (let i = lastBrace; i >= 0; i--) {
    if (buffer[i] === "}") depth++;
    if (buffer[i] === "{") depth--;
    if (depth === 0) {
      start = i;
      break;
    }
  }
  if (start === -1) return null;
  try {
    const parsed = JSON.parse(buffer.slice(start, lastBrace + 1));
    return parsed.suggestions?.filter(Boolean) ?? null;
  } catch {
    return null;
  }
}

function streamSuggestions(onUpdate: (suggestions: string[]) => void) {
  fetch("/api/experiment/chat/suggestions", { method: "POST" })
    .then((res) => {
      if (!res.ok || !res.body) throw new Error("no body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      function read(): Promise<void> {
        return reader.read().then(({ done, value }) => {
          if (done) return;
          buffer += decoder.decode(value, { stream: true });
          const suggestions = parseLastJson(buffer);
          if (suggestions?.length) onUpdate(suggestions);
          return read();
        });
      }
      return read();
    })
    .catch(() => onUpdate(FALLBACK_SUGGESTIONS));
}

export const CrtChatDemo = () => {
  const [input, setInput] = useState("");
  const [initialSuggestions, setInitialSuggestions] = useState<string[]>([]);
  const bootText = useTypingAnimation(BOOT_MESSAGE);
  const bootComplete = bootText === BOOT_MESSAGE;

  useEffect(() => {
    if (!bootComplete) return;
    if (initialSuggestions.length > 0) return;
    streamSuggestions(setInitialSuggestions);
  }, [bootComplete, initialSuggestions.length]);

  const { messages, sendMessage, status } = useChat<ChatMessage>({
    transport: new DefaultChatTransport({
      api: "/api/experiment/chat",
    }),
  });

  const isStreaming = status !== "ready";
  const completedMessages: CRTMessage[] = [];
  let rawStreamText = "";

  for (const msg of messages) {
    const text = msg.parts
      .filter((p) => p.type === "text")
      .map((p) => p.text)
      .join("");
    if (!text) continue;

    if (msg === messages.at(-1) && msg.role === "assistant" && isStreaming) {
      rawStreamText = text;
    } else {
      completedMessages.push({
        role: msg.role === "user" ? "user" : "assistant",
        text,
      });
    }
  }

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const streamedSuggestions =
    lastAssistant?.parts.find((p) => p.type === "data-suggestions")?.data ?? [];

  const suggestions =
    messages.length === 0
      ? bootComplete
        ? initialSuggestions
        : []
      : isStreaming
        ? []
        : streamedSuggestions;

  const handleSubmit = useCallback(
    (text: string) => {
      sendMessage({ text });
      setInput("");
    },
    [sendMessage],
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      if (status !== "ready") return;
      sendMessage({ text: suggestion });
    },
    [sendMessage, status],
  );

  const displayMessages = useMemo(() => {
    if (!bootComplete) return [];
    const boot: CRTMessage = { role: "assistant", text: BOOT_MESSAGE };
    return [boot, ...completedMessages];
  }, [bootComplete, completedMessages]);

  const displayStreamText = !bootComplete ? bootText : rawStreamText;
  const displayIsStreaming = !bootComplete || isStreaming;

  return (
    <CRTDisplay
      messages={displayMessages}
      streamedText={displayStreamText}
      isStreaming={displayIsStreaming}
      inputText={input}
      onInputChange={setInput}
      onSubmit={handleSubmit}
      disabled={status !== "ready" || !bootComplete}
      suggestions={suggestions as string[]}
      onSuggestionClick={handleSuggestionClick}
      showLogo={false}
      fullscreen={false}
    />
  );
};
