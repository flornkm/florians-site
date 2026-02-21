import { Chat } from "@/components/chat/chat";
import { ChatStatusProvider } from "@/components/chat/chat-status";
import { H1 } from "@/components/design-system/heading";

export default function Page() {
  return (
    <ChatStatusProvider>
      <div className="w-full max-w-5xl mx-auto px-4 md:px-0 flex flex-col min-h-[calc(100vh-6rem)]">
        <H1 className="mb-1">Contact</H1>

        <Chat />
      </div>
    </ChatStatusProvider>
  );
}
