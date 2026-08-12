export interface Contact {
  name: string;
  handle?: string;
  href: string;
}

export const CONTACTS: Contact[] = [
  { name: "Email", handle: "hello@floriankiem.com", href: "mailto:hello@floriankiem.com" },
  { name: "X", handle: "@flornkm", href: "https://twitter.com/flornkm" },
  { name: "GitHub", handle: "flornkm", href: "https://github.com/flornkm" },
  { name: "LinkedIn", handle: "flornkm", href: "https://linkedin.com/in/flornkm" },
  { name: "iMessage", handle: "hello@floriankiem.com", href: "imessage://hello@floriankiem.com" },
];
