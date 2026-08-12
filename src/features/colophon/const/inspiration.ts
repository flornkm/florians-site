export const INSPIRATION: { name: string; href: string }[] = [
  { name: "Gavin Nelson", href: "https://nelson.co/" },
  { name: "Anton Stallboerger", href: "https://antonstallboerger.com/" },
  { name: "Linus Rogge", href: "https://linusrogge.com/" },
  { name: "Samuel Kraft", href: "https://samuelkraft.com/" },
  { name: "Making Software", href: "https://makingsoftware.com/" },
].sort((a, b) => a.name.localeCompare(b.name));
