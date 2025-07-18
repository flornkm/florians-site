import { useActionState, useCallback, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import Button from "../../components/shared/button";
import Input from "../../components/shared/input";
import Label from "../../components/shared/label";
import Textarea from "../../components/shared/textarea";
import { useForm } from "../../hooks/use-form";
import { cn } from "../../lib/utils";

type EntryState = null | {
  success: boolean;
  message: string;
};

type FormValues = {
  name: string;
  email: string;
  message: string;
  signature?: string;
};

async function submitEntry(prevState: EntryState, formData: FormData) {
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
  const sigRef = useRef<SignatureCanvas>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const { values: formValues, handleChange } = useForm<FormValues>({
    name: "",
    email: "",
    message: "",
  });
  const [state, formAction, isPending] = useActionState(submitEntry, null);

  const handleSignatureEnd = () => {
    if (sigRef.current) {
      setSignature(sigRef.current.toDataURL());
    }
  };

  const clearSignature = () => {
    if (sigRef.current) {
      sigRef.current.clear();
      setSignature(null);
    }
  };

  const isFormEmpty = useCallback(() => {
    // disable if not all fields are filled
    return !Object.values(formValues).every((value) => value) || !signature;
  }, [formValues]);

  return (
    <section className="w-full min-h-[calc(100dvh-10rem)] overflow-hidden flex flex-col h-full -mt-16">
      <div className="w-full h-full flex-1 flex items-center">
        <div className="flex-1 flex flex-col items-end">
          <div className="w-full max-w-lg pr-8">
            <div className="mb-6">
              <h1 className="text-lg font-semibold">Send a letter</h1>
              <p className="text-sm text-neutral-500 w-full max-w-lg">It's like a digital guestbook.</p>
            </div>
            <form action={formAction} className="w-full flex flex-col gap-4">
              {state && (
                <div
                  className={`p-3 rounded-lg text-sm ${state.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                >
                  {state.message}
                </div>
              )}
              <div className="w-full flex flex-col gap-2">
                <Label htmlFor="name">Handle (e.g. @handle)</Label>
                <Input
                  id="name"
                  name="name"
                  value={formValues.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>
              <div className="w-full flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formValues.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>
              <div className="w-full flex flex-col gap-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  className="resize-none"
                  rows={6}
                  value={formValues.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                />
              </div>
              <div className="w-full flex flex-col gap-2">
                <Label htmlFor="signature">Signature</Label>
                <div className="border border-neutral-200 rounded-[9px]">
                  <SignatureCanvas
                    penColor="black"
                    canvasProps={{
                      className:
                        "w-full h-40 outline-0 transition-all duration-150 outline-offset-1 outline-neutral-100 active:outline-2 rounded-lg",
                      id: "signature",
                    }}
                    ref={sigRef}
                    onEnd={handleSignatureEnd}
                  />
                </div>
                <input type="hidden" name="signature" value={signature || ""} />
                <div className="flex flex-col gap-1.5">
                  <Button type="button" variant="tertiary" onClick={clearSignature}>
                    Clear signature
                  </Button>
                  <Button type="submit" disabled={isFormEmpty() || isPending}>
                    {isPending ? "Sending..." : "Send"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
        <div className="flex-1 w-full h-[calc(100dvh+2rem)]">
          <div className="w-full p-40 flex-1 sticky flex justify-center items-center h-full bg-neutral-100">
            <div
              className={cn(
                "aspect-[1.4142857143/1] w-full transition-all duration-300 ease-out mx-auto max-w-xl p-4 bg-white rounded-2xl border border-neutral-200 flex",
                isFormEmpty() && "scale-95",
                !isFormEmpty() && "scale-100 shadow-2xl shadow-black/5",
              )}
            >
              <div className="flex-1 max-w-1/2 flex flex-col gap-4 pr-8">
                <div
                  className={cn(
                    "transition-all duration-300 w-full flex-1",
                    formValues.message && "opacity-100",
                    !formValues.message && "opacity-0",
                  )}
                >
                  <p className="text-sm">
                    <span className="font-semibold">Dear Website,</span> <br />
                    <br />
                    {formValues.message}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex-1 flex items-end",
                    formValues.name && "opacity-100",
                    !formValues.name && "opacity-0",
                  )}
                >
                  <p className="text-sm font-medium text-neutral-500">
                    Sincerely,
                    <span className="inline-flex ml-2 items-center gap-1 translate-y-[3px]">
                      <img
                        src={`https://unavatar.io/${formValues.name}`}
                        alt={formValues.name}
                        className="w-4 h-4 rounded-full border border-neutral-200"
                      />
                      @{formValues.name}
                    </span>
                  </p>
                </div>
              </div>
              <div className="h-full shrink-0 w-px bg-neutral-200" />
              <div className="flex-1 shrink-0 w-full flex flex-col h-full items-end justify-between">
                <img
                  src="/images/letters/letter-stamp.webp"
                  alt="Stamp"
                  className={cn(
                    "w-24 rotate-4 transition-all duration-300 ease-out origin-bottom-left",
                    isFormEmpty() && "opacity-0 scale-110 shadow-xl",
                    !isFormEmpty() && "opacity-100 scale-100",
                  )}
                />
                {signature && (
                  <div className="w-full max-w-[200px]">
                    <img src={signature} alt="Signature" className="w-full" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
