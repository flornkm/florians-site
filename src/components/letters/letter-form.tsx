import { Body1 } from "@/components/design-system/body";
import { H1 } from "@/components/design-system/heading";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Label from "@/components/ui/label";
import Textarea from "@/components/ui/textarea";
import { useDarkmode } from "@/hooks/use-darkmode";
import { memo, useCallback, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

export interface FormValues extends Record<string, string> {
  name: string;
  email: string;
  message: string;
}

export interface EntryState {
  success: boolean;
  message: string;
}

export interface LetterFormProps {
  formValues: FormValues;
  onFormChange: (field: keyof FormValues, value: string) => void;
  onSubmit: (formData: FormData) => void;
  state: EntryState | null;
  isPending: boolean;
  onSignatureChange: (signature: string | null) => void;
}

const FormField = memo(function FormField({
  id,
  label,
  type = "text",
  defaultValue,
  onChange,
  component: Component = Input,
  ...props
}: {
  id: string;
  label: string;
  type?: string;
  defaultValue: string;
  onChange: (value: string) => void;
  component?: typeof Input | typeof Textarea;
  [key: string]: unknown;
}) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  return (
    <div className="w-full flex flex-col gap-1">
      <Label htmlFor={id}>{label}</Label>
      <Component id={id} name={id} type={type} defaultValue={defaultValue} onChange={handleChange} {...props} />
    </div>
  );
});

const SignatureField = memo(function SignatureField({
  onSignatureChange,
}: {
  onSignatureChange: (signature: string | null) => void;
}) {
  const sigRef = useRef<SignatureCanvas>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const { darkmode } = useDarkmode();

  const handleSignatureEnd = useCallback(() => {
    if (sigRef.current) {
      const signatureData = sigRef.current.toDataURL();
      setSignature(signatureData);
      onSignatureChange(signatureData);
    }
  }, [onSignatureChange]);

  const clearSignature = useCallback(() => {
    if (sigRef.current) {
      sigRef.current.clear();
      setSignature(null);
      onSignatureChange(null);
    }
  }, [onSignatureChange]);

  return (
    <div className="w-full flex flex-col gap-1">
      <Label htmlFor="signature">Signature</Label>
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-[9px] mb-2">
        <SignatureCanvas
          penColor={darkmode ? "white" : "black"}
          canvasProps={{
            className:
              "w-full h-40 outline-0 transition-all dark:active:bg-neutral-950 duration-150 outline-offset-1 outline-neutral-100 active:outline-2 rounded-lg dark:outline-neutral-800 dark:outline-neutral-900",
            id: "signature",
          }}
          ref={sigRef}
          onEnd={handleSignatureEnd}
        />
      </div>
      <Button type="button" variant="tertiary" className="mb-6" onClick={clearSignature} disabled={!signature}>
        Clear signature
      </Button>
      <input type="hidden" name="signature" value={signature || ""} />
    </div>
  );
});

const FormStatus = memo(function FormStatus({ state }: { state: EntryState | null }) {
  if (!state) return null;

  return (
    <div
      className={`p-3 rounded-lg text-ms ${state.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
    >
      {state.message}
    </div>
  );
});

export default function LetterForm({
  formValues,
  onFormChange,
  onSubmit,
  state,
  isPending,
  onSignatureChange,
}: LetterFormProps) {
  const [signature, setSignature] = useState<string | null>(null);
  const formDataRef = useRef<FormValues>({ name: "", email: "", message: "" });

  const handleSignatureChange = useCallback(
    (signatureData: string | null) => {
      setSignature(signatureData);
      onSignatureChange(signatureData);
    },
    [onSignatureChange],
  );

  const isFormEmpty = useCallback(() => {
    return !Object.values(formDataRef.current).every((value) => value) || !signature;
  }, [signature]);

  // Create stable callbacks that only update refs and parent
  const handleNameChange = useCallback(
    (value: string) => {
      formDataRef.current.name = value;
      onFormChange("name", value);
    },
    [onFormChange],
  );

  const handleEmailChange = useCallback(
    (value: string) => {
      formDataRef.current.email = value;
      onFormChange("email", value);
    },
    [onFormChange],
  );

  const handleMessageChange = useCallback(
    (value: string) => {
      formDataRef.current.message = value;
      onFormChange("message", value);
    },
    [onFormChange],
  );

  return (
    <div className="w-full md:max-w-lg pr-8">
      <div className="mb-6">
        <H1 className="text-lg font-semibold">Send a letter</H1>
        <Body1 className="max-w-lg">It's like a digital guestbook.</Body1>
      </div>
      <form action={onSubmit} className="w-full flex flex-col gap-4">
        <FormStatus state={state} />
        <FormField
          id="name"
          label="Handle (e.g. @handle)"
          maxLength={12}
          defaultValue={formValues.name}
          onChange={handleNameChange}
        />
        <FormField id="email" label="Email" type="email" defaultValue={formValues.email} onChange={handleEmailChange} />
        <FormField
          id="message"
          label="Message"
          component={Textarea}
          className="resize-none"
          rows={6}
          maxLength={102}
          defaultValue={formValues.message}
          onChange={handleMessageChange}
        />
        <SignatureField onSignatureChange={handleSignatureChange} />
        <div className="flex flex-col gap-1.5">
          <Button type="submit" disabled={isFormEmpty() || isPending}>
            {isPending ? "Sending..." : "Send"}
          </Button>
        </div>
      </form>
    </div>
  );
}
