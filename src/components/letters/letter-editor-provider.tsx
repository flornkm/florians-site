import { createContext, ReactNode, useCallback, useContext, useState } from "react";

import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export interface FormValues extends Record<string, string> {
  handle: string;
  email: string;
  message: string;
}

interface LetterEditorContextType {
  formValues: FormValues;
  setFormValue: (field: keyof FormValues, value: string) => void;

  signature: string | null;
  setSignature: (signature: string | null) => void;

  isSubmitting: boolean;
  submitLetter: (formData: FormData) => void;

  resetSignature: boolean;
  success: boolean | null;

  isEmpty: boolean;
}

const LetterEditorContext = createContext<LetterEditorContextType | null>(null);

export function useLetterEditor() {
  const context = useContext(LetterEditorContext);
  if (!context) {
    throw new Error("useLetterEditor must be used within LetterEditorProvider");
  }
  return context;
}

interface LetterEditorProviderProps {
  children: ReactNode;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function LetterEditorProvider({ children, onSuccess, onError }: LetterEditorProviderProps) {
  const [formValues, setFormValues] = useState<FormValues>({
    handle: "",
    email: "",
    message: "",
  });
  const [signature, setSignature] = useState<string | null>(null);
  const [resetSignature, setResetSignature] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);

  const setFormValue = useCallback((field: keyof FormValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const handle = formData.get("handle") as string;
      const email = formData.get("email") as string;
      const message = formData.get("message") as string;
      const signatureData = formData.get("signature") as string;

      if (!email || !message || !signatureData) {
        throw new Error("All fields are required");
      }

      return axios.post("/api/letters", {
        email,
        message,
        signature: signatureData,
        handle,
      });
    },
    onSuccess: () => {
      setSuccess(true);
      setFormValues({ handle: "", email: "", message: "" });
      setSignature(null);
      setResetSignature(true);
      setTimeout(() => setResetSignature(false), 100);
      onSuccess?.();
    },
    onError: (error: Error) => {
      console.error(error);
      setSuccess(false);
      onError?.(error);
    },
  });

  const isEmpty = useCallback(() => {
    const { handle, ...fieldsToCheck } = formValues;
    return !Object.values(fieldsToCheck).every((value) => value) || !signature;
  }, [formValues, signature]);

  const contextValue: LetterEditorContextType = {
    formValues,
    setFormValue,
    signature,
    setSignature,
    isSubmitting: mutation.isPending,
    submitLetter: mutation.mutate,
    resetSignature,
    success,
    isEmpty: isEmpty(),
  };

  return <LetterEditorContext.Provider value={contextValue}>{children}</LetterEditorContext.Provider>;
}
