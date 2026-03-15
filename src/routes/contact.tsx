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
          "Ask questions about Florian, his work, and projects — or get in touch directly.",
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
