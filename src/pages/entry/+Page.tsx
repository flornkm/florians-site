import { LetterEditor } from "@/components/letters/letter-editor";

export default function Page() {
  return (
    <section className="w-full overflow-hidden flex flex-col md:h-[calc(100dvh-1rem)] -mt-8 md:-mt-16">
      <div className="w-full h-full flex-1 flex md:flex-row flex-col-reverse items-center gap-20 md:gap-0">
        <LetterEditor>
          <LetterEditor.Form />
          <LetterEditor.Preview />
        </LetterEditor>
      </div>
    </section>
  );
}
