import { cn } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { IconArrowUp } from "central-icons/IconArrowUp";
import { useEffect, useState } from "react";
import { Streamdown } from "streamdown";
import { Body1 } from "../design-system/body";
import { Code } from "../design-system/code";
import Button from "../ui/button";
import Input from "../ui/input";
import { useChatStatusEvents } from "./chat-status";

const RECOMMENDATIONS = ["What do you work on?", "How can I reach you?", "Tell me about your projects"];

export const Chat = () => {
  const [input, setInput] = useState("");

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

  useEffect(() => {
    chatEvents.emit(status);
  }, [status, chatEvents]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 space-y-2 py-4">
        {messages.map((message) => (
          <Body1
            key={message.id}
            className={cn("leading-relaxed flex", message.role === "user" ? "text-tertiary" : "text-primary")}
          >
            <span className="font-medium mr-1 w-14 shrink-0">{message.role === "user" ? "You:" : "Clone:"}</span>
            {message.parts.map((part, index) =>
              part.type === "text" ? (
                <Streamdown key={index} components={{ code: Code }}>
                  {part.text}
                </Streamdown>
              ) : null,
            )}
          </Body1>
        ))}
      </div>
      <div className="sticky bottom-0 max-w-xs transition-all ease-out focus-within:max-w-lg w-full mx-auto bg-primary pt-2 pb-4">
        <form
          className="flex relative gap-2 w-full outline -outline-offset-3 shadow-xl shadow-black/5 outline-transparent focus-within:outline-(--bg-primary) rounded-full"
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
            className="flex-1 text-ellipsis h-12 pl-4 pr-14 rounded-full"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={status !== "ready"}
            placeholder="Ask my clone anything..."
            required
          />
          <Button
            type="submit"
            variant="primary"
            iconOnly
            rounded
            className="absolute top-1/2 -translate-y-1/2 right-2.5"
            disabled={status !== "ready"}
          >
            <IconArrowUp />
          </Button>
        </form>
      </div>
    </div>
  );
};
