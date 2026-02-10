import { Body1 } from "@/components/design-system/body";
import { H1 } from "@/components/design-system/heading";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Label from "@/components/ui/label";
import Textarea from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import React, { memo, useCallback, useEffect, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { navigate } from "vike/client/router";
import { FormValues, useLetterEditor } from "./letter-editor-provider";

const FormField = memo(function FormField({
  id,
  label,
  type = "text",
  value,
  onChange,
  component: Component = Input,
  disabled,
  ...props
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  component?: typeof Input | typeof Textarea;
  disabled?: boolean;
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
      <Component id={id} name={id} type={type} value={value} onChange={handleChange} disabled={disabled} {...props} />
    </div>
  );
});

const SignatureField = memo(function SignatureField({ disabled }: { disabled?: boolean }) {
  const { signature, setSignature, resetSignature } = useLetterEditor();
  const sigRef = useRef<SignatureCanvas>(null);

  React.useEffect(() => {
    if (resetSignature && sigRef.current) {
      sigRef.current.clear();
    }
  }, [resetSignature]);

  const handleSignatureEnd = useCallback(() => {
    if (sigRef.current) {
      const signatureData = sigRef.current.toDataURL();
      setSignature(signatureData);
    }
  }, [setSignature]);

  const clearSignature = useCallback(() => {
    if (sigRef.current) {
      sigRef.current.clear();
      setSignature(null);
    }
  }, [setSignature]);

  return (
    <div className="w-full flex flex-col gap-1">
      <Label htmlFor="signature">Signature</Label>
      <div
        className={cn(
          "border border-primary bg-transparent rounded-[9px] mb-2",
          disabled ? "opacity-50 cursor-not-allowed" : "",
        )}
      >
        <div
          className={cn(
            "w-full outline-0 -outline-offset-0 active:-outline-offset-1 active:bg-surface-secondary transition-all border-none duration-150 outline-primary active:outline-2 rounded-lg",
            disabled && "pointer-events-none",
          )}
        >
          <SignatureCanvas
            penColor="black"
            canvasProps={{
              className: "dark:invert h-40 w-full",
              id: "signature",
            }}
            ref={sigRef}
            onEnd={handleSignatureEnd}
          />
        </div>
      </div>
      <Button type="button" variant="tertiary" className="mb-6" onClick={clearSignature} disabled={!signature}>
        Clear signature
      </Button>
      <input type="hidden" name="signature" value={signature || ""} />
    </div>
  );
});

export default function LetterForm() {
  const { formValues, setFormValue, isSubmitting, submitLetter, isEmpty, success } = useLetterEditor();

  const handleFieldChange = useCallback(
    (field: keyof FormValues) => (value: string) => {
      setFormValue(field, value);
    },
    [setFormValue],
  );

  useEffect(() => {
    if (success) {
      navigate("/#letters");
    }
  }, [success]);

  return (
    <div className="w-full md:max-w-lg pr-8">
      <div className="mb-6">
        <H1 className="text-lg font-semibold">Send a postcard</H1>
        <Body1 className="max-w-lg">It's like a digital guestbook.</Body1>
      </div>
      <form action={submitLetter} className="w-full flex flex-col gap-4">
        <FormField
          id="handle"
          label="Handle (e.g. @handle)"
          maxLength={12}
          value={formValues.handle}
          onChange={handleFieldChange("handle")}
          disabled={isSubmitting}
        />
        <FormField
          id="email"
          label="Email"
          type="email"
          value={formValues.email}
          onChange={handleFieldChange("email")}
          disabled={isSubmitting}
        />
        <FormField
          id="message"
          label="Message"
          component={Textarea}
          className="resize-none"
          rows={6}
          maxLength={102}
          value={formValues.message}
          onChange={handleFieldChange("message")}
          disabled={isSubmitting}
        />
        <SignatureField disabled={isSubmitting} />
        <div className="flex flex-col gap-1.5">
          <Button type="submit" disabled={isEmpty || isSubmitting}>
            {isSubmitting ? "Sending..." : "Send"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export type { FormValues };
