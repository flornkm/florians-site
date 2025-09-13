import { Chat } from "@/components/chat/chat";
import { ChatStatusProvider } from "@/components/chat/chat-status";
import { Clone } from "@/components/shared/clone/Clone";

export default function Page() {
  return (
    <ChatStatusProvider>
      <div className="grid grid-rows-[auto_1fr] lg:grid-rows-1 h-[calc(100vh-6rem)] w-screen max-w-[calc(32rem+100vw/2)] -ml-[calc((100vw-64rem)/4)] relative left-1/2 -translate-x-1/2 lg:grid-cols-2 mx-auto overflow-hidden min-h-0">
        <div className="w-full h-96 lg:h-full flex items-center justify-center mask-r-from-80%">
          <Clone />
        </div>
        <Chat />
      </div>
    </ChatStatusProvider>
  );
}
