import { useChat } from "@ai-sdk/react";
import { useRouter } from "@tanstack/react-router";
import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTypingAnimation } from "../../../hooks/use-typing-animation";

type ChatMessage = UIMessage<never, { suggestions: string[] }>;
import { useChatStatusEvents } from "./chat-status";
import { CRTDisplay } from "./crt/crt-display";
import type { CRTMessage } from "./crt/crt-text-renderer";

const BOOT_MESSAGE = "Bot initialized. Version 2.6.6. Ready to chat about Florian with user.";

const FALLBACK_SUGGESTIONS = [
  "What does Florian do?",
  "What projects has he built?",
  "How can I reach him?",
];

async function streamSuggestions(onUpdate: (suggestions: string[]) => void) {
  try {
    const res = await fetch("/api/chat/suggestions", { method: "POST" });
    if (!res.ok || !res.body) throw new Error("no body");
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let chunk = await reader.read();
    while (!chunk.done) {
      buffer += decoder.decode(chunk.value, { stream: true });
      const lastBrace = buffer.lastIndexOf("}");
      if (lastBrace !== -1) {
        let depth = 0;
        let start = -1;
        for (let i = lastBrace; i >= 0; i--) {
          if (buffer[i] === "}") depth++;
          if (buffer[i] === "{") depth--;
          if (depth === 0) { start = i; break; }
        }
        if (start !== -1) {
          try {
            const parsed = JSON.parse(buffer.slice(start, lastBrace + 1));
            if (parsed.suggestions?.length) {
              onUpdate(parsed.suggestions.filter(Boolean));
            }
          } catch { /* incomplete */ }
        }
      }
      chunk = await reader.read();
    }
  } catch {
    onUpdate(FALLBACK_SUGGESTIONS);
  }
}

export const Chat = () => {
  const [input, setInput] = useState("");
  const [initialSuggestions, setInitialSuggestions] = useState<string[]>([]);
  const bootText = useTypingAnimation(BOOT_MESSAGE);
  const bootComplete = bootText === BOOT_MESSAGE;
  const router = useRouter();

  const handleBack = useCallback(() => {
    const matches = router.state.matches;
    const parentMatch = matches.length > 1 ? matches[matches.length - 2] : null;
    const backPath =
      parentMatch?.pathname && parentMatch.pathname !== "/contact" ? parentMatch.pathname : "/";
    router.navigate({ to: backPath });
  }, [router]);

  // Stream initial suggestions after boot completes
  useEffect(() => {
    if (!bootComplete) return;
    if (initialSuggestions.length > 0) return; // already fetched

    streamSuggestions(setInitialSuggestions);
  }, [bootComplete, initialSuggestions.length]);

  const chatEvents = useChatStatusEvents();
  const { messages, sendMessage, status } = useChat<ChatMessage>({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      fetch: async (input, init) => {
        const res = await fetch(input, init);
        chatEvents.emit("streaming");
        return res;
      },
    }),
  });

  // Sync chat status to event system
  useEffect(() => {
    chatEvents.emit(status);
  }, [status, chatEvents]);

  // Separate completed messages from the currently streaming one
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

  // Extract suggestions from the last assistant message
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const streamedSuggestions =
    lastAssistant?.parts.find((p) => p.type === "data-suggestions")?.data ?? [];

  // Show initial suggestions if no messages yet (and boot is done), otherwise show streamed ones
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
      chatEvents.emit("submitted");
      sendMessage({ text });
      setInput("");
    },
    [chatEvents, sendMessage],
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      if (status !== "ready") return;
      chatEvents.emit("submitted");
      sendMessage({ text: suggestion });
    },
    [chatEvents, sendMessage, status],
  );

  // Build final messages list — prepend boot message when complete
  const displayMessages = useMemo(() => {
    if (!bootComplete) return [];
    const boot: CRTMessage = { role: "assistant", text: BOOT_MESSAGE };
    return [boot, ...completedMessages];
  }, [bootComplete, completedMessages]);

  // While boot is typing, show it as streamed text
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
      onBack={handleBack}
      disabled={status !== "ready" || !bootComplete}
      suggestions={suggestions as string[]}
      onSuggestionClick={handleSuggestionClick}
    />
  );
};
