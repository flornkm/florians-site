import { useChat } from "@ai-sdk/react";
import { useRouter } from "@tanstack/react-router";
import { TextStreamChatTransport } from "ai";
import { useCallback, useEffect, useRef, useState } from "react";
import { useChatStatusEvents } from "./chat-status";
import { CRTDisplay } from "./crt/crt-display";
import type { CRTMessage } from "./crt/crt-text-renderer";

const TYPING_SPEED = 50; // chars per second

export const Chat = () => {
  const [input, setInput] = useState("");
  const [revealedCount, setRevealedCount] = useState(0);
  const revealTimerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const lastFullTextRef = useRef("");
  const router = useRouter();

  const handleBack = useCallback(() => {
    const matches = router.state.matches;
    const parentMatch = matches.length > 1 ? matches[matches.length - 2] : null;
    const backPath =
      parentMatch?.pathname && parentMatch.pathname !== "/contact" ? parentMatch.pathname : "/";
    router.navigate({ to: backPath });
  }, [router]);

  const chatEvents = useChatStatusEvents();
  const { messages, sendMessage, status } = useChat({
    transport: new TextStreamChatTransport({
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
  let currentStreamText = "";

  for (const msg of messages) {
    const text = msg.parts
      .filter((p) => p.type === "text")
      .map((p) => p.text)
      .join("");
    if (!text) continue;

    if (msg === messages.at(-1) && msg.role === "assistant" && isStreaming) {
      currentStreamText = text;
    } else {
      completedMessages.push({
        role: msg.role === "user" ? "user" : "assistant",
        text,
      });
    }
  }

  // Character-by-character reveal for streaming text
  useEffect(() => {
    if (!currentStreamText) {
      setRevealedCount(0);
      lastFullTextRef.current = "";
      return;
    }

    lastFullTextRef.current = currentStreamText;

    clearInterval(revealTimerRef.current);
    revealTimerRef.current = setInterval(() => {
      setRevealedCount((prev) => {
        if (prev >= lastFullTextRef.current.length) {
          clearInterval(revealTimerRef.current);
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / TYPING_SPEED);

    return () => clearInterval(revealTimerRef.current);
  }, [currentStreamText]);

  // When streaming finishes, reveal everything immediately
  if (!isStreaming && lastFullTextRef.current && revealedCount < lastFullTextRef.current.length) {
    setRevealedCount(lastFullTextRef.current.length);
  }

  const streamedText = currentStreamText.slice(0, revealedCount);

  const handleSubmit = useCallback(
    (text: string) => {
      chatEvents.emit("submitted");
      sendMessage({ text });
      setInput("");
      setRevealedCount(0);
      lastFullTextRef.current = "";
    },
    [chatEvents, sendMessage],
  );

  return (
    <CRTDisplay
      messages={completedMessages}
      streamedText={streamedText}
      isStreaming={isStreaming}
      inputText={input}
      onInputChange={setInput}
      onSubmit={handleSubmit}
      onBack={handleBack}
      disabled={status !== "ready"}
    />
  );
};
