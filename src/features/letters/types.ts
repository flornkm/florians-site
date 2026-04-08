export interface LetterData {
  handle: string;
  message: string;
  signature: string | null;
  email?: string;
  createdAt?: string;
}

export interface FormValues extends Record<string, string> {
  handle: string;
  email: string;
  message: string;
}
