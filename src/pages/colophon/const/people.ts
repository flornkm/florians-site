export const PEOPLE: { name: string; href: string }[] = [
  { name: "Nils Eller", href: "https://www.nilseller.com/" },
  { name: "Anton Stallboerger", href: "https://antonstallboerger.com/" },
  { name: "Linus Rogge", href: "https://linusrogge.com/" },
  { name: "Samuel Stroschein", href: "https://x.com/samuelstroschei" },
  { name: "Thilo Konzok", href: "https://www.konzok.com/" },
  { name: "Xavier (Jack)", href: "https://x.com/KMkota0" },
].sort((a, b) => a.name.localeCompare(b.name));
