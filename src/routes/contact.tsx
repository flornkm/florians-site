import { Chat } from "@/features/contact/components/chat";
import { ChatStatusProvider } from "@/features/contact/components/chat-status";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact • Florian - Design Engineer" },
      {
        name: "description",
        content:
          "Talk to my AI clone in realtime in order to contact and get in touch with me.",
      },
      { property: "og:image", content: "/api/og?title=Contact (AI)" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <ChatStatusProvider>
      <div className="w-full h-full flex flex-col">
        <Chat />
      </div>
    </ChatStatusProvider>
  );
}
