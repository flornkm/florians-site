import LetterForm, { EntryState, FormValues } from "@/components/letters/letter-form";
import LetterPreview from "@/components/letters/letter-preview";
import { useForm } from "@/hooks/use-form";
import { useActionState, useCallback, useState } from "react";

async function submitEntry(prevState: EntryState | null, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const message = formData.get("message") as string;
    const signature = formData.get("signature") as string;

    if (!name || !email || !message || !signature) {
      return { success: false, message: "All fields are required" };
    }

    // Here you would typically send data to your backend
    // This is a placeholder for the actual API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return { success: true, message: "Entry submitted successfully" };
  } catch (error) {
    return { success: false, message: "Failed to submit entry" };
  }
}

export default function Page() {
  const [signature, setSignature] = useState<string | null>(null);
  const { values: formValues, handleChange } = useForm<FormValues>({
    name: "",
    email: "",
    message: "",
  });
  const [state, formAction, isPending] = useActionState(submitEntry, null);

  const isFormEmpty = useCallback(() => {
    return !Object.values(formValues).every((value) => value) || !signature;
  }, [formValues, signature]);

  const handleSignatureChange = (signatureData: string | null) => {
    setSignature(signatureData);
  };

  return (
    <section className="w-full overflow-hidden flex flex-col md:h-[calc(100dvh-1rem)] -mt-8 md:-mt-16">
      <div className="w-full h-full flex-1 flex md:flex-row flex-col-reverse items-center gap-20 md:gap-0">
        <div className="flex-1 flex flex-col items-end w-full pl-8">
          <LetterForm
            formValues={formValues}
            onFormChange={handleChange}
            onSubmit={formAction}
            state={state}
            isPending={isPending}
            onSignatureChange={handleSignatureChange}
          />
        </div>
        <div className="flex-1 w-full md:h-[calc(100dvh+2rem)] md:max-h-none max-h-96 shrink-0">
          <LetterPreview formValues={formValues} signature={signature} isFormEmpty={isFormEmpty()} />
        </div>
      </div>
    </section>
  );
}
