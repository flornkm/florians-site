import { useCallback, useRef, useState } from "react";

export interface FormValues {
  name: string;
  email: string;
  message: string;
}

export function useLetterForm(initialValues: FormValues = { name: "", email: "", message: "" }) {
  const formDataRef = useRef<FormValues>(initialValues);
  const [, forceUpdate] = useState({});

  const createFieldHandler = useCallback((field: keyof FormValues) => {
    return (value: string) => {
      formDataRef.current[field] = value;
      // Force update to trigger preview updates
      forceUpdate({});
    };
  }, []);

  const getValues = useCallback(() => formDataRef.current, []);

  const reset = useCallback(() => {
    formDataRef.current = { name: "", email: "", message: "" };
    forceUpdate({});
  }, []);

  return {
    getValues,
    createFieldHandler,
    reset,
    values: formDataRef.current,
  };
}