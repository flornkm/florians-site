import { ReactNode } from "react";
import { LetterEditorProvider } from "./letter-editor-context";
import LetterForm from "./letter-form";
import LetterPreview from "./letter-preview";

interface LetterEditorProps {
  children: ReactNode;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function LetterEditor({ children, onSuccess, onError }: LetterEditorProps) {
  return (
    <LetterEditorProvider onSuccess={onSuccess} onError={onError}>
      {children}
    </LetterEditorProvider>
  );
}

LetterEditor.Form = function LetterEditorForm() {
  return (
    <div className="flex-1 flex flex-col items-end w-full pl-8">
      <LetterForm />
    </div>
  );
};

LetterEditor.Preview = function LetterEditorPreview() {
  return (
    <div className="flex-1 w-full md:h-[calc(100dvh+2rem)] md:max-h-none max-h-96 shrink-0">
      <LetterPreview />
    </div>
  );
};
