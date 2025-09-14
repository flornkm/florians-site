import { Chat } from "@/components/chat/chat";
import { ChatStatusProvider } from "@/components/chat/chat-status";
import { Clone } from "@/components/shared/clone/Clone";

export default function Page() {
  return (
    <ChatStatusProvider>
      <div className="lg:grid pb-4 flex -mt-8 flex-col grid-rows-[auto_1fr] lg:grid-rows-1 h-[calc(100vh-5rem)] lg:h-[calc(100vh-6rem)] lg:w-screen lg:max-w-[calc(32rem+100vw/2)] lg:-ml-[calc((100vw-64rem)/4)] relative lg:left-1/2 lg:-translate-x-1/2 lg:grid-cols-2 mx-auto overflow-hidden min-h-0">
        <div className="w-full shrink-0 h-96 lg:relative absolute mask-b-from-75% mask-b-to-100% pr-18 lg:pr-0 lg:h-full flex lg:items-center justify-center lg:mask-r-from-80% lg:mask-r-to-100%">
          <Clone />
        </div>
        <Chat />
      </div>
    </ChatStatusProvider>
  );
}
