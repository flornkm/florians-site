import { cn } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { IconArrowUp } from "central-icons/IconArrowUp";
import { useEffect, useRef, useState } from "react";
import { Streamdown } from "streamdown";
import { Body1 } from "../design-system/body";
import Button from "../ui/button";
import Input from "../ui/input";
import { useChatActionEvents, useChatStatusEvents } from "./chat-status";

const RECOMMENDATIONS = ["How can I contact you?", "What are you currently working on?", "How did you learn to code?"];

export const Chat = () => {
  const [input, setInput] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const actionEvents = useChatActionEvents();
  const chatEvents = useChatStatusEvents();
  const { messages, sendMessage, status } = useChat({
    transport: new TextStreamChatTransport({
      api: "/api/chat",
      fetch: async (input, init) => {
        const res = await fetch(input, init);
        try {
          const action = res.headers.get("X-Clone-Action") || "None";
          actionEvents.emit(action);
          chatEvents.emit("streaming");
        } catch (error) {
          console.log(error);
        }
        return res;
      },
    }),
  });

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    chatEvents.emit(status);
  }, [status, chatEvents]);

  return (
    <div className="w-full h-full min-h-0 overflow-hidden flex flex-col pb-16">
      <div
        ref={scrollContainerRef}
        className="flex-1 lg:px-0 px-8 min-h-0 overscroll-contain scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar scrollbar-thumb-neutral-200 scrollbar-track-transparent mask-y-from-[calc(100%-4rem)] py-12 mask-y-to-100% overflow-y-auto space-y-2"
      >
        {messages.map((message) => (
          <Body1 key={message.id} className={cn("leading-relaxed flex", message.role === "user" && "text-neutral-500")}>
            <span className="font-medium mr-1 w-14 shrink-0">{message.role === "user" ? "You:" : "Clone:"}</span>
            {message.parts.map((part, index) =>
              part.type === "text" ? <Streamdown key={index}>{part.text}</Streamdown> : null,
            )}
          </Body1>
        ))}
      </div>
      <div
        className={cn(
          "flex overflow-x-auto shrink-0 scrollbar-none px-10 mask-x-from-[calc(100%-4rem)] mask-x-to-100% gap-2 transition-all",
          messages.length > 0 ? "opacity-0 h-0" : "opacity-100 h-10 mb-2 py-1",
        )}
      >
        {RECOMMENDATIONS.map((recommendation, index) => (
          <Button
            onClick={() => {
              setInput(recommendation);
            }}
            variant="tertiary"
            className={cn(
              "border shrink-0 py-1 border-neutral-200 rounded-full",
              recommendation === input && "bg-neutral-50",
            )}
            key={index}
          >
            {recommendation}
          </Button>
        ))}
      </div>
      <form
        className="flex shrink-0 z-[99] gap-2 w-full relative mx-auto lg:max-w-[calc(100%-5rem)] max-w-[calc(100%-4rem)]"
        onSubmit={(e) => {
          e.preventDefault();
          const value = input.trim();
          if (value) {
            chatEvents.emit("submitted");
            sendMessage({ text: value });
            setInput("");
          }
        }}
      >
        <Input
          className="flex-1 text-ellipsis bg-white h-12 pl-4 pr-24 rounded-full"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={status !== "ready"}
          placeholder="Contact my clone…"
          required
          autoFocus
        />
        <Button
          type="submit"
          className="rounded-full absolute top-1/2 -translate-y-1/2 right-2.5 size-8 p-0 flex items-center justify-center bg-black text-white disabled:opacity-50"
          disabled={status !== "ready"}
        >
          <IconArrowUp className="size-4" />
        </Button>
      </form>
    </div>
  );
};
