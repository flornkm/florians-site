import Toggle from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { IconCodeBrackets } from "central-icons-filled/IconCodeBrackets";
import { IconEarth } from "central-icons-filled/IconEarth";
import { IconEmail1 } from "central-icons-filled/IconEmail1";
import { IconFileText } from "central-icons-filled/IconFileText";
import { IconImages1 } from "central-icons-filled/IconImages1";
import { IconPeople } from "central-icons-filled/IconPeople";
import { IconServer1 } from "central-icons-filled/IconServer1";
import { AnimatePresence, motion } from "motion/react";
import type { ComponentType } from "react";
import { useState } from "react";
import { useSuperHoverRef } from "super-hover/react";

const BLUR = 2;
const TRANSITION = { duration: 0.45, ease: [0.23, 1, 0.32, 1] } as const;
// Hysteresis so the title swap can't flicker while hovering around the threshold.
const COLLAPSE_AT = 24;
const EXPAND_AT = 12;

// Orb fills in oklch: identical lightness/chroma across hues so the palette reads
// as one friendly family. Four hues repeat across the rows — content artwork.
const ORB = {
  blue: { from: "oklch(0.74 0.13 255)", to: "oklch(0.6 0.16 255)" },
  gray: { from: "oklch(0.74 0.015 260)", to: "oklch(0.6 0.02 260)" },
  peach: { from: "oklch(0.78 0.13 55)", to: "oklch(0.65 0.15 50)" },
  green: { from: "oklch(0.74 0.12 155)", to: "oklch(0.6 0.14 155)" },
} as const;

interface Tool {
  title: string;
  subtitle: string;
  orb: keyof typeof ORB;
  Icon: ComponentType<{ className?: string }>;
}

const TOOLS: Tool[] = [
  { title: "Web", subtitle: "Search the web", orb: "blue", Icon: IconEarth },
  { title: "Documents", subtitle: "Files, notes and PDFs", orb: "gray", Icon: IconFileText },
  { title: "Databases", subtitle: "Projects and tables", orb: "peach", Icon: IconServer1 },
  { title: "Code", subtitle: "Repositories and snippets", orb: "gray", Icon: IconCodeBrackets },
  { title: "People", subtitle: "Contacts and teams", orb: "green", Icon: IconPeople },
  { title: "Images", subtitle: "Photos and screenshots", orb: "blue", Icon: IconImages1 },
  { title: "Mail", subtitle: "Messages and threads", orb: "peach", Icon: IconEmail1 },
];

export const BlurFade = () => {
  const [scrolled, setScrolled] = useState(false);
  const [blurOn, setBlurOn] = useState(true);
  const [hovered, setHovered] = useState<number | null>(null);

  const blur = blurOn ? BLUR : 0;

  const handleScroll = (y: number) =>
    setScrolled((prev) => (prev ? y > EXPAND_AT : y > COLLAPSE_AT));

  // Super Hover hit-tests every frame, so the hovered row stays correct while the
  // list scrolls under a stationary pointer — native :hover only updates on pointer move.
  const listRef = useSuperHoverRef({
    onEnter: (e) => {
      const index = Number((e.target as HTMLElement).dataset.index);
      if (!Number.isNaN(index)) setHovered(index);
    },
    onLeave: (e) => {
      const index = Number((e.target as HTMLElement).dataset.index);
      setHovered((prev) => (prev === index ? null : prev));
    },
  });

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-12 px-6">
      <div className="relative h-[17rem] w-[17rem] overflow-hidden rounded-3xl bg-surface shadow-md ring-1 ring-black/[0.07] dark:bg-neutral-900 dark:ring-white/[0.08]">
        {/* Navbar: frost + hairline appear once content scrolls underneath. */}
        {/* rounded-t-3xl matches the card: Safari lets backdrop-filter escape the parent's
            overflow-hidden radius clip, so the bar must carry its own rounding. */}
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 z-10 flex h-11 items-center justify-center overflow-hidden rounded-t-3xl border-b transition-[background-color,border-color] duration-300",
            scrolled
              ? "border-black/[0.06] bg-white/60 backdrop-blur-xl dark:border-white/[0.08] dark:bg-neutral-900/60"
              : "border-transparent",
          )}
        >
          <AnimatePresence initial={false}>
            {scrolled && (
              <motion.span
                initial={{ opacity: 0, y: 12, filter: `blur(${blur}px)` }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: 12, filter: `blur(${blur}px)` }}
                transition={TRANSITION}
                className="text-[13px] font-semibold text-primary"
              >
                Search
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div
          ref={listRef}
          onScroll={(e) => handleScroll(e.currentTarget.scrollTop)}
          className="h-full overflow-y-auto overscroll-contain px-5 pb-4 pt-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <h2
            className={cn(
              "pb-2 text-[22px] font-semibold text-primary transition-[opacity,filter] duration-300 ease-out",
              scrolled && "opacity-0",
              scrolled && blurOn && "blur-[2px]",
            )}
          >
            Search
          </h2>

          <div className="flex flex-col">
            {TOOLS.map((tool, i) => (
              <div key={tool.title}>
                {/* iOS-style divider: starts at the text column, never under the orb.
                    Vanishes instantly (no transition) when either adjacent row is hovered,
                    like a native selection. */}
                {i > 0 && (
                  <div
                    className={cn(
                      "ml-[3.125rem] h-px bg-black/[0.06] dark:bg-white/[0.08]",
                      (hovered === i || hovered === i - 1) && "opacity-0",
                    )}
                  />
                )}
                <ToolRow tool={tool} index={i} hovered={hovered === i} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Toggle checked={blurOn} onCheckedChange={setBlurOn} aria-label="Blur" />
        <span className="select-none text-xs text-quaternary">{BLUR}px blur</span>
      </div>
    </div>
  );
};

interface ToolRowProps {
  tool: Tool;
  index: number;
  hovered: boolean;
}

function ToolRow({ tool, index, hovered }: ToolRowProps) {
  const { title, subtitle, Icon } = tool;
  const { from, to } = ORB[tool.orb];
  return (
    <div
      data-super-hover
      data-index={index}
      className={cn(
        "-mx-2.5 flex cursor-pointer items-center gap-3.5 rounded-xl px-2.5 py-2.5",
        hovered && "bg-black/[0.04] dark:bg-white/[0.05]",
      )}
    >
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),inset_0_-1px_1.5px_rgba(0,0,0,0.06),0_1px_1px_rgba(0,0,0,0.06)]"
        style={{ backgroundImage: `linear-gradient(to bottom, ${from}, ${to})` }}
      >
        {/* SVGs can't take box-shadow: the chained drop-shadows (dark up, light down)
            fake an inset so the glyph reads as pressed into the orb. */}
        <Icon className="size-4 text-white/85 [filter:drop-shadow(0_-0.5px_0.5px_rgba(0,0,0,0.25))_drop-shadow(0_0.75px_0.5px_rgba(255,255,255,0.4))]" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-[13px] font-medium text-primary">{title}</span>
        <span className="truncate text-xs text-tertiary">{subtitle}</span>
      </span>
    </div>
  );
}
