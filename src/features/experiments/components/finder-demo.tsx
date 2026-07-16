import { cn } from "@/lib/utils";
import { IconAirdrop } from "central-icons/IconAirdrop";
import { IconAppstore } from "central-icons/IconAppstore";
import { IconArrowDownCircle } from "central-icons/IconArrowDownCircle";
import { IconBulletList } from "central-icons/IconBulletList";
import { IconChevronDownSmall } from "central-icons/IconChevronDownSmall";
import { IconChevronLeft } from "central-icons/IconChevronLeft";
import { IconChevronRight } from "central-icons/IconChevronRight";
import { IconCircleDotsCenter1 } from "central-icons/IconCircleDotsCenter1";
import { IconClock } from "central-icons/IconClock";
import { IconCloud } from "central-icons/IconCloud";
import { IconDotGrid3x3 } from "central-icons/IconDotGrid3x3";
import { IconFileBend } from "central-icons/IconFileBend";
import { IconFolderShared } from "central-icons/IconFolderShared";
import { IconImac } from "central-icons/IconImac";
import { IconLayoutBottom } from "central-icons/IconLayoutBottom";
import { IconLayoutColumn } from "central-icons/IconLayoutColumn";
import { IconLayoutGrid2 } from "central-icons/IconLayoutGrid2";
import { IconMacbook } from "central-icons/IconMacbook";
import { IconMagnifyingGlass } from "central-icons/IconMagnifyingGlass";
import { IconServer } from "central-icons/IconServer";
import { IconShareOs } from "central-icons/IconShareOs";
import { IconTag } from "central-icons/IconTag";
import { IconTrashCan } from "central-icons/IconTrashCan";
import { Icon3dSphere } from "central-icons/Icon3dSphere";
import { motion } from "motion/react";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { useLayoutEffect, useRef, useState } from "react";

type IconComponent = ComponentType<{ size?: string | number } & SVGProps<SVGSVGElement>>;

/* macOS renders San Francisco through -apple-system; everything in the window
   opts out of the site font so it reads as a native window. */
const SYSTEM_FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", "Segoe UI", system-ui, sans-serif';

/* The window is laid out at the reference screenshot's native size and scaled
   down to fit the dialog, so every metric keeps its 1:1 Finder proportion. */
const WINDOW_W = 912;
const WINDOW_H = 697;

const SPRING = { type: "spring", stiffness: 550, damping: 40 } as const;

/* Liquid-glass capsule shared by every toolbar control. One hairline via the
   gradient border, one soft shadow — never a second ring. */
const CAPSULE = cn(
  "gradient-border relative flex items-center rounded-full bg-white/85 backdrop-blur-xl",
  "[--gradient-border:linear-gradient(to_bottom,rgba(0,0,0,0.03),rgba(0,0,0,0.08))]",
  "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_14px_rgba(0,0,0,0.05)]",
  "dark:bg-white/[0.08]",
  "dark:[--gradient-border:linear-gradient(to_bottom,rgba(255,255,255,0.18),rgba(255,255,255,0.05))]",
  "dark:shadow-[0_1px_2px_rgba(0,0,0,0.25),0_4px_14px_rgba(0,0,0,0.18)]",
);

/* The traffic lights' hover glyphs are window-control artwork, not icons. */
function CloseGlyph() {
  return (
    <svg width={8} height={8} viewBox="0 0 8 8" aria-hidden>
      <path d="m2 2 4 4M6 2 2 6" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" />
    </svg>
  );
}

function MinGlyph() {
  return (
    <svg width={8} height={8} viewBox="0 0 8 8" aria-hidden>
      <path d="M1.8 4h4.4" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" />
    </svg>
  );
}

function ZoomGlyph() {
  return (
    <svg width={8} height={8} viewBox="0 0 8 8" aria-hidden>
      <path d="M1.6 6.4V3.5l2.9 2.9H1.6Z" fill="currentColor" />
      <path d="M6.4 1.6H3.5l2.9 2.9V1.6Z" fill="currentColor" />
    </svg>
  );
}

/* ---------- Sidebar ---------- */

interface SideItem {
  icon: IconComponent;
  label: string;
}

const SIDEBAR_SECTIONS: { header?: string; items: SideItem[] }[] = [
  {
    items: [
      { icon: IconClock, label: "Recents" },
      { icon: IconFolderShared, label: "Shared" },
    ],
  },
  {
    header: "Favorites",
    items: [
      { icon: IconAppstore, label: "Applications" },
      { icon: IconImac, label: "Desktop" },
      { icon: IconFileBend, label: "Documents" },
      { icon: IconArrowDownCircle, label: "Downloads" },
    ],
  },
  {
    header: "Locations",
    items: [
      { icon: IconCloud, label: "iCloud Drive" },
      { icon: IconMacbook, label: "MacBook Pro" },
      { icon: IconServer, label: "Macintosh HD" },
      { icon: IconAirdrop, label: "AirDrop" },
      { icon: Icon3dSphere, label: "Network" },
      { icon: IconTrashCan, label: "Trash" },
    ],
  },
];

/* The stock macOS tag palette. */
const TAG_ITEMS = [
  { color: "#ff3b30", label: "Red" },
  { color: "#ff9500", label: "Orange" },
  { color: "#ffcc00", label: "Yellow" },
  { color: "#28cd41", label: "Green" },
  { color: "#007aff", label: "Blue" },
  { color: "#af52de", label: "Purple" },
  { color: "#8e8e93", label: "Gray" },
];

function SidebarHeader({ children }: { children: ReactNode }) {
  return (
    <div className="px-2 pb-0.5 pt-2.5 text-[11px] font-semibold text-black/35 dark:text-white/35">
      {children}
    </div>
  );
}

function SidebarRow({
  selected,
  onSelect,
  children,
}: {
  selected?: boolean;
  onSelect?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex h-[25px] w-full cursor-default items-center gap-1.5 rounded-[6px] px-1.5",
        "text-[13px] text-black/85 transition-colors dark:text-white/85",
        selected
          ? "bg-black/[0.07] dark:bg-white/[0.1]"
          : "hover:bg-black/[0.04] active:bg-black/[0.08] dark:hover:bg-white/[0.05] dark:active:bg-white/[0.09]",
      )}
    >
      {children}
    </button>
  );
}

function Sidebar({
  current,
  onNavigate,
  windowFocused,
}: {
  current: string;
  onNavigate: (label: string) => void;
  windowFocused: boolean;
}) {
  return (
    <aside className="flex w-[152px] shrink-0 flex-col overflow-hidden border-r border-black/[0.08] bg-[#ececee] dark:border-white/[0.08] dark:bg-[#232326]">
      <div className="flex h-[46px] shrink-0 items-center px-4">
        <TrafficLights windowFocused={windowFocused} />
      </div>
      <div
        className={cn(
          "flex-1 overflow-hidden px-2.5 pb-2 transition-opacity duration-150",
          !windowFocused && "opacity-60",
        )}
      >
        {SIDEBAR_SECTIONS.map((section, si) => (
          <div key={section.header ?? si}>
            {section.header && <SidebarHeader>{section.header}</SidebarHeader>}
            {section.items.map((item) => {
              const selected = current === item.label;
              return (
                <SidebarRow
                  key={item.label}
                  selected={selected}
                  onSelect={() => onNavigate(item.label)}
                >
                  <span className="flex w-[21px] shrink-0 justify-center">
                    <item.icon
                      className={cn(
                        "size-4",
                        selected ? "text-[#0a82ff]" : "text-black/65 dark:text-white/65",
                      )}
                    />
                  </span>
                  <span className="truncate">{item.label}</span>
                </SidebarRow>
              );
            })}
          </div>
        ))}
        <SidebarHeader>Tags</SidebarHeader>
        {TAG_ITEMS.map((tag) => (
          <SidebarRow key={tag.label}>
            <span className="flex w-[21px] shrink-0 justify-center">
              <span
                className="size-3 rounded-full shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.15)]"
                style={{ backgroundColor: tag.color }}
              />
            </span>
            <span className="truncate">{tag.label}</span>
          </SidebarRow>
        ))}
      </div>
    </aside>
  );
}

/* ---------- Window chrome ---------- */

const TRAFFIC_LIGHTS = [
  { color: "#ff5f57", Glyph: CloseGlyph },
  { color: "#febc2e", Glyph: MinGlyph },
  { color: "#28c840", Glyph: ZoomGlyph },
];

function TrafficLights({ windowFocused }: { windowFocused: boolean }) {
  return (
    <div className="group/lights flex items-center gap-2">
      {TRAFFIC_LIGHTS.map(({ color, Glyph }) => (
        <span
          key={color}
          className={cn(
            "flex size-3 items-center justify-center rounded-full transition-colors duration-150",
            "shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.15)]",
            !windowFocused && "bg-[#d9d9d8] dark:bg-[#4c4c4e]",
          )}
          style={windowFocused ? { backgroundColor: color } : undefined}
        >
          <span className="flex items-center justify-center text-black/50 opacity-0 transition-opacity duration-100 group-hover/lights:opacity-100">
            <Glyph />
          </span>
        </span>
      ))}
    </div>
  );
}

function NavButton({
  icon: Icon,
  enabled,
  onClick,
}: {
  icon: IconComponent;
  enabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={!enabled}
      onClick={onClick}
      className={cn(
        "flex h-full w-9 cursor-default items-center justify-center rounded-full transition-colors",
        enabled
          ? cn(
              "text-black/80 hover:bg-black/[0.05] active:bg-black/[0.09]",
              "dark:text-white/90 dark:hover:bg-white/[0.07] dark:active:bg-white/[0.12]",
            )
          : "text-black/25 dark:text-white/25",
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}

/* Click-drag in the empty folder area draws Finder's selection marquee. */
function MarqueeArea() {
  const ref = useRef<HTMLDivElement>(null);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const [rect, setRect] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  // Pointer coords arrive in screen space; the window renders inside a scale
  // transform, so map through the current scale and clamp to the folder area.
  const toLocal = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return { x: 0, y: 0 };
    const bounds = el.getBoundingClientRect();
    const scale = bounds.width / el.offsetWidth;
    return {
      x: Math.min(Math.max((e.clientX - bounds.left) / scale, 0), el.offsetWidth),
      y: Math.min(Math.max((e.clientY - bounds.top) / scale, 0), el.offsetHeight),
    };
  };

  const stop = () => {
    origin.current = null;
    setRect(null);
  };

  return (
    <div
      ref={ref}
      className="relative flex-1 overflow-hidden"
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        origin.current = toLocal(e);
      }}
      onPointerMove={(e) => {
        if (!origin.current) return;
        const point = toLocal(e);
        const from = origin.current;
        setRect({
          left: Math.min(from.x, point.x),
          top: Math.min(from.y, point.y),
          width: Math.abs(point.x - from.x),
          height: Math.abs(point.y - from.y),
        });
      }}
      onPointerUp={stop}
      onPointerCancel={stop}
    >
      {rect && rect.width + rect.height > 3 && (
        <div
          className="pointer-events-none absolute rounded-[2px] border border-[#0a82ff]/40 bg-[#0a82ff]/10"
          style={rect}
        />
      )}
    </div>
  );
}

const VIEW_MODES: { label: string; icon: IconComponent }[] = [
  { label: "icons", icon: IconLayoutGrid2 },
  { label: "list", icon: IconBulletList },
  { label: "columns", icon: IconLayoutColumn },
  { label: "gallery", icon: IconLayoutBottom },
];

/* Fits fixed-size content into whatever space the dialog gives us. */
function FitScale({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.7);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setScale(Math.min(rect.width / WINDOW_W, rect.height / WINDOW_H));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative h-full w-full">
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          width: WINDOW_W,
          height: WINDOW_H,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function Finder() {
  // Back/forward walk a real history stack of visited folders, like Finder.
  const [history, setHistory] = useState<string[]>(["Documents"]);
  const [cursor, setCursor] = useState(0);
  const [view, setView] = useState(0);
  const [query, setQuery] = useState("");

  const current = history[cursor];
  const canGoBack = cursor > 0;
  const canGoForward = cursor < history.length - 1;

  // Clicking the desktop behind the window blurs it, like real window focus.
  const [windowFocused, setWindowFocused] = useState(true);

  const navigate = (label: string) => {
    if (label === current) return;
    const next = [...history.slice(0, cursor + 1), label];
    setHistory(next);
    setCursor(next.length - 1);
  };

  return (
    <div
      className={cn(
        "h-full w-full select-none rounded-[inherit] p-4 antialiased",
        "bg-[#eceef0] dark:bg-[#131316]",
      )}
      style={{ fontFamily: SYSTEM_FONT }}
      onPointerDown={(e) =>
        setWindowFocused((e.target as HTMLElement).closest("[data-finder-window]") !== null)
      }
    >
      <FitScale>
        <div
          data-finder-window
          className={cn(
            "flex h-full w-full overflow-hidden rounded-[12px] bg-white dark:bg-[#202023]",
            "transition-shadow duration-200",
            windowFocused
              ? "shadow-[0_0_0_0.5px_rgba(0,0,0,0.12),0_10px_30px_rgba(0,0,0,0.08),0_40px_110px_rgba(0,0,0,0.16)] dark:shadow-[0_0_0_0.5px_rgba(255,255,255,0.12),0_10px_30px_rgba(0,0,0,0.3),0_40px_110px_rgba(0,0,0,0.45)]"
              : "shadow-[0_0_0_0.5px_rgba(0,0,0,0.12),0_4px_14px_rgba(0,0,0,0.08),0_12px_36px_rgba(0,0,0,0.1)] dark:shadow-[0_0_0_0.5px_rgba(255,255,255,0.12),0_4px_14px_rgba(0,0,0,0.3),0_12px_36px_rgba(0,0,0,0.35)]",
          )}
        >
          <Sidebar current={current} onNavigate={navigate} windowFocused={windowFocused} />

          <div className="flex min-w-0 flex-1 flex-col">
            {/* Toolbar */}
            <div
              className={cn(
                "flex h-[50px] shrink-0 items-center gap-2 px-3 transition-opacity duration-150",
                !windowFocused && "opacity-55",
              )}
            >
              <div className={cn(CAPSULE, "h-[32px]")}>
                <NavButton
                  icon={IconChevronLeft}
                  enabled={canGoBack}
                  onClick={() => setCursor(cursor - 1)}
                />
                <span className="h-[16px] w-px shrink-0 bg-black/[0.12] dark:bg-white/[0.14]" />
                <NavButton
                  icon={IconChevronRight}
                  enabled={canGoForward}
                  onClick={() => setCursor(cursor + 1)}
                />
              </div>

              <span className="pl-1.5 text-[16px] font-semibold text-black/85 dark:text-white/90">
                {current}
              </span>

              <div className="flex-1" />

              {/* View switcher */}
              <div className={cn(CAPSULE, "h-[32px] p-[3px]")}>
                {VIEW_MODES.map((mode, i) => (
                  <button
                    key={mode.label}
                    type="button"
                    onClick={() => setView(i)}
                    className={cn(
                      "relative flex h-full w-[33px] cursor-default items-center justify-center rounded-full",
                      view !== i && "active:bg-black/[0.06] dark:active:bg-white/[0.09]",
                    )}
                  >
                    {view === i && (
                      <motion.span
                        layoutId="finder-view"
                        transition={SPRING}
                        className="absolute inset-0 rounded-full bg-black/[0.07] dark:bg-white/[0.14]"
                      />
                    )}
                    <mode.icon
                      className={cn(
                        "relative size-4",
                        view === i
                          ? "text-black/85 dark:text-white/90"
                          : "text-black/65 dark:text-white/65",
                      )}
                    />
                  </button>
                ))}
              </div>

              {/* Group by */}
              <button
                type="button"
                className={cn(
                  CAPSULE,
                  "h-[32px] cursor-default gap-1 px-3 text-black/75 dark:text-white/85",
                  "active:bg-black/[0.05] dark:active:bg-white/[0.12]",
                )}
              >
                <IconDotGrid3x3 className="size-4" />
                <IconChevronDownSmall className="size-3 text-black/55 dark:text-white/55" />
              </button>

              {/* Share / tag / more */}
              <div className={cn(CAPSULE, "h-[32px] p-[3px]")}>
                {[IconShareOs, IconTag, IconCircleDotsCenter1].map((Icon, i) => (
                  <button
                    key={i}
                    type="button"
                    className={cn(
                      "flex h-full w-[33px] cursor-default items-center justify-center rounded-full",
                      "text-black/75 transition-colors hover:bg-black/[0.05] active:bg-black/[0.09]",
                      "dark:text-white/85 dark:hover:bg-white/[0.08] dark:active:bg-white/[0.13]",
                    )}
                  >
                    <Icon className="size-4" />
                  </button>
                ))}
              </div>

              {/* Search */}
              <label
                className={cn(
                  CAPSULE,
                  "ml-2.5 h-[32px] w-[205px] gap-1.5 px-3",
                  "focus-within:outline focus-within:outline-[3px] focus-within:outline-offset-0 focus-within:outline-[#0a82ff]/40",
                )}
              >
                <IconMagnifyingGlass className="size-3.5 shrink-0 text-black/45 dark:text-white/50" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search"
                  className={cn(
                    "w-full select-text bg-transparent text-[14px] text-black/85 outline-none",
                    "placeholder:text-black/40 dark:text-white/90 dark:placeholder:text-white/40",
                  )}
                />
              </label>
            </div>

            {/* Folder contents — empty, but drag-selectable like Finder */}
            <MarqueeArea />
          </div>
        </div>
      </FitScale>
    </div>
  );
}
