// A single path renders wide (image or video); an array renders 3-up (phone screenshots).
export type ProjectMedia = string | string[];

export type Project = {
  name: string;
  date: string;
  url?: string;
  /** Projects without media are listed in the sidebar but not scrolled to. */
  media?: ProjectMedia[];
  /** Lower values lead the home page media column; the sidebar keeps array order regardless. */
  mediaOrder?: number;
};

export const PROJECTS: Project[] = [
  { name: "Rogo", date: "2025 – 2026", url: "https://rogo.ai" },
  {
    name: "Flow",
    date: "2026",
    url: "https://flowengineering.com",
    mediaOrder: 0,
    media: ["/images/flow/hero.webp", "/videos/flow/company.webm"],
  },
  {
    name: "Sona",
    date: "2024 – 2025",
    url: "https://sona.wtf",
    mediaOrder: 2,
    media: [
      [
        "/images/sona/recording.webp",
        "/images/sona/processing.webp",
        "/images/sona/key-insights.webp",
      ],
      ["/images/sona/transcript.webp", "/images/sona/sharing.webp", "/images/sona/follow-up.webp"],
      "/videos/sona/sona-use.webm",
      [
        "/images/sona/overview.webp",
        "/images/sona/export.webp",
        "/images/sona/mobile-protocol.webp",
      ],
      ["/images/sona/settings.webp", "/images/sona/upsell-modal.webp", "/images/sona/upsell.webp"],
      ["/images/sona/select.webp", "/images/sona/selected.webp", "/images/sona/bulk-delete.webp"],
      ["/images/sona/invite-user.webp", "/images/sona/faq.webp", "/images/sona/subscriber.webp"],
      ["/images/sona/login.webp", "/images/sona/otp.webp", "/images/sona/otp-loading.webp"],
      "/videos/sona/hero-video.webm",
      "/images/sona/devices.webp",
    ],
  },
  {
    name: "Superpower",
    date: "2025 – 2026",
    url: "https://superpower.com",
    media: [
      "/images/superpower/modal.webp",
      "/videos/superpower/health-categories.webm",
      "/videos/superpower/scroll-effect.webm",
      [
        "/images/superpower/mobile-data-sheet.webp",
        "/images/superpower/mobile-data-categories.webp",
        "/images/superpower/mobile-protocol.webp",
      ],
      "/images/superpower/superpower-ai.webp",
      "/videos/superpower/protocol-reveal.webm",
      "/images/superpower/download-mobile-app.webp",
    ],
  },
  { name: "Delphi", date: "2026", url: "https://delphi.ai" },
  { name: "Kalshi", date: "2025", url: "https://kalshi.com" },
  { name: "Snaptrude", date: "2025", url: "https://snaptrude.com" },
  { name: "Morphic", date: "2024", url: "https://morphic.com" },
  { name: "Dash0", date: "2024", url: "https://dash0.com" },
  { name: "Opral", date: "2023 – 2024", url: "https://opral.com" },
];
