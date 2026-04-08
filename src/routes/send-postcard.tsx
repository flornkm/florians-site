import { LetterEditorProvider } from "@/features/letters/components/letter-editor-provider";
import LetterForm from "@/features/letters/components/letter-form";
import LetterPreview from "@/features/letters/components/letter-preview";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/send-postcard")({
  head: () => ({
    meta: [
      { title: "Send Postcard • Florian - Design Engineer" },
      {
        name: "description",
        content:
          "Sending a postcard on florians site is similar to entering your name on a guestbook, just digitally.",
      },
      { property: "og:image", content: "/api/og?title=Send Postcard" },
    ],
  }),
  component: SendPostcardPage,
});

function SendPostcardPage() {
  const navigate = useNavigate();
  return (
    <section className="w-full overflow-hidden flex flex-col md:h-[calc(100dvh-1rem)] -mt-8 md:-mt-16">
      <div className="w-full h-full flex-1 flex md:flex-row flex-col-reverse items-center gap-20 md:gap-0">
        <LetterEditorProvider onSuccess={() => navigate({ to: "/", hash: "letters" })}>
          <div className="flex-1 flex flex-col items-end w-full pl-8 md:pl-0">
            <LetterForm />
          </div>
          <div className="flex-1 w-full md:h-[calc(100dvh+2rem)] md:max-h-none max-h-96 shrink-0">
            <LetterPreview />
          </div>
        </LetterEditorProvider>
      </div>
    </section>
  );
}
