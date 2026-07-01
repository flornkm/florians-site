import { ClaudeInstaller } from "@/features/claude-installation/components/claude-installer";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/claude-installation")({
  head: () => ({
    meta: [
      { title: "Claude Setup ‹ Florian Design Engineer" },
      {
        name: "description",
        content:
          "A nostalgia experiment: the Claude Code installer as if Anthropic had shipped it for Windows XP in the early 2000s.",
      },
      { property: "og:title", content: "Claude Setup (Windows XP)" },
      {
        property: "og:description",
        content: "What if Claude Code had a Windows XP setup wizard in 2003?",
      },
      { property: "og:image", content: "/api/og?title=Claude%20Setup" },
      { name: "twitter:title", content: "Claude Setup (Windows XP)" },
      {
        name: "twitter:description",
        content: "What if Claude Code had a Windows XP setup wizard in 2003?",
      },
      { name: "twitter:image", content: "/api/og?title=Claude%20Setup" },
    ],
  }),
  component: ClaudeInstallationPage,
});

function ClaudeInstallationPage() {
  const router = useRouter();

  // The scene is a fixed full-screen takeover that covers the site chrome, so give people a
  // keyboard escape hatch back to the real site.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.navigate({ to: "/experiments" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <div className="fixed inset-0 z-[60] bg-black">
      {/* Low-res "old monitor" pixelation: sample one pixel per 3×3 tile and dilate it to fill
          the tile, mosaicing whatever it's applied to. Used only on the wallpaper layer so the
          display itself reads as low-res while UI text stays as crisp, readable bitmap pixels. */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <filter id="xp-pixelate" x="0" y="0" width="100%" height="100%">
          <feFlood x="0" y="0" width="1" height="1" />
          <feComposite width="2" height="2" />
          <feTile result="grid" />
          <feComposite in="SourceGraphic" in2="grid" operator="in" />
          <feMorphology operator="dilate" radius="1" />
        </filter>
        {/* Gives the smooth illustrations clear-but-subtle pixels so they read as low-res
            early-2000s icon art rather than a slick modern render. */}
        <filter id="illus-pixelate" x="0" y="0" width="100%" height="100%">
          <feFlood x="0" y="0" width="1" height="1" />
          <feComposite width="2" height="2" />
          <feTile result="grid" />
          <feComposite in="SourceGraphic" in2="grid" operator="in" />
          <feMorphology operator="dilate" radius="1" />
        </filter>
        {/* Gentler variant (≈1.5px cells, less dilation) for the CD/folder icons, which were
            getting mangled by the full-strength mosaic above. */}
        <filter id="illus-pixelate-soft" x="0" y="0" width="100%" height="100%">
          <feFlood x="0" y="0" width="1" height="1" />
          <feComposite width="1.5" height="1.5" />
          <feTile result="grid" />
          <feComposite in="SourceGraphic" in2="grid" operator="in" />
          <feMorphology operator="dilate" radius="0.5" />
        </filter>
      </svg>
      <div className="xp-root" style={{ width: "100%", height: "100%" }}>
        <ClaudeInstaller />
      </div>
      <button
        type="button"
        onClick={() => router.navigate({ to: "/experiments" })}
        className="fixed right-3 top-3 z-[70] rounded bg-black/40 px-2 py-1 text-[11px] text-white/80 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-white"
      >
        Exit (Esc)
      </button>
    </div>
  );
}
