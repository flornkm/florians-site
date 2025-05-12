import { useState } from "react";

export const useForm = <T extends Record<string, string>>(initialValues: T) => {
  const [values, setValues] = useState<T>(initialValues);

  const handleChange = (field: keyof T, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const reset = () => {
    setValues(initialValues);
  };

  return {
    values,
    handleChange,
    reset,
  };
};
