import { LetterEditorProvider } from "@/components/letters/letter-editor-provider";
import LetterForm from "@/components/letters/letter-form";
import LetterPreview from "@/components/letters/letter-preview";

export default function Page() {
  return (
    <section className="w-full overflow-hidden flex flex-col md:h-[calc(100dvh-1rem)] -mt-8 md:-mt-16">
      <div className="w-full h-full flex-1 flex md:flex-row flex-col-reverse items-center gap-20 md:gap-0">
        <LetterEditorProvider>
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
