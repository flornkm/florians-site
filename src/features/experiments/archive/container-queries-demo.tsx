import { cn } from "@/lib/utils";
import { IconAudio } from "central-icons-filled/IconAudio";
import { IconPlay } from "central-icons-filled/IconPlay";
import { IconChevronLeftSmall } from "central-icons/IconChevronLeftSmall";
import { IconChevronRightSmall } from "central-icons/IconChevronRightSmall";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef, useState } from "react";

// Three tiny components that read the box they sit in (@container), not the viewport.
// The panel resizes from its top-right corner in both axes; every layout change while
// dragging is pure CSS — the demo ships zero resize-aware JS besides the drag itself.
// Min height leaves room for the tallest stacked card plus the chevron row.
const MIN = { w: 208, h: 232 };
const MAX = { w: 340, h: 312 };
const KEY_STEP = 16;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

// iOS-style rubber band: dragging past a limit still moves, but with diminishing
// returns, and the spring pulls the panel back to the limit on release.
const rubberband = (excess: number, dimension = 80) =>
  (1 - 1 / ((excess * 0.55) / dimension + 1)) * dimension;

const overdrag = (v: number, min: number, max: number) => {
  if (v < min) return min - rubberband(min - v);
  if (v > max) return max + rubberband(v - max);
  return v;
};

// Tracks the pointer near-1:1 while dragging, with just enough smoothing to feel
// physical; slightly underdamped so the release from a rubber band lands with life.
const SPRING = { stiffness: 700, damping: 46 };

interface Example {
  key: string;
  title: string;
  Component: () => React.ReactNode;
}

const EXAMPLES: Example[] = [
  { key: "card", title: "Media card", Component: MediaCard },
  { key: "stats", title: "Stat block", Component: StatBlock },
  { key: "team", title: "Team list", Component: TeamList },
];

export const ContainerQueries = () => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  // Committed size, for aria and as the keyboard baseline. The live size during a
  // drag lives in motion values so per-frame updates never re-render the tree.
  const [size, setSize] = useState({ w: 340, h: 248 });
  const [dragging, setDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const reduceMotion = useReducedMotion();

  const w = useMotionValue(size.w);
  const h = useMotionValue(size.h);
  const wSpring = useSpring(w, SPRING);
  const hSpring = useSpring(h, SPRING);

  // The readout shows the clamped target, so at a limit it pins to the min/max
  // value while the rubber band stretches — the number itself signals the edge.
  const readout = useTransform(
    () =>
      `${Math.round(clamp(w.get(), MIN.w, MAX.w))} × ${Math.round(clamp(h.get(), MIN.h, MAX.h))}`,
  );

  const go = (dir: number) => {
    setDirection(dir);
    setIndex((i) => (i + dir + EXAMPLES.length) % EXAMPLES.length);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    // Don't let the press focus the button: a lingering focus ring after a mouse
    // drag reads as the handle being stuck active. Keyboard users still Tab to it.
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    // Measure the rendered box (max-w/h-full may have clamped the styled size) so the
    // first move never jumps, and sync the springs to it without animating.
    const rect = panelRef.current?.getBoundingClientRect();
    const start = {
      x: e.clientX,
      y: e.clientY,
      w: rect?.width ?? size.w,
      h: rect?.height ?? size.h,
    };
    dragStart.current = start;
    w.set(start.w);
    h.set(start.h);
    wSpring.jump(start.w);
    hSpring.jump(start.h);
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    // The panel is centered on both axes, so each edge only moves half a pixel per
    // pixel of size; double the deltas to keep the corner under the pointer.
    const start = dragStart.current;
    w.set(overdrag(start.w + (e.clientX - start.x) * 2, MIN.w, MAX.w));
    h.set(overdrag(start.h - (e.clientY - start.y) * 2, MIN.h, MAX.h));
  };

  // Shared by pointerup / pointercancel / lostpointercapture, so no path out of a
  // drag can leave the handle stuck in its active state. Idempotent by design.
  const onPointerEnd = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    // Snap the target back inside the limits; the spring animates the return.
    const settled = {
      w: clamp(w.get(), MIN.w, MAX.w),
      h: clamp(h.get(), MIN.h, MAX.h),
    };
    w.set(settled.w);
    h.set(settled.h);
    setSize(settled);
    setDragging(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const grow = {
      ArrowRight: [KEY_STEP, 0],
      ArrowLeft: [-KEY_STEP, 0],
      ArrowUp: [0, KEY_STEP],
      ArrowDown: [0, -KEY_STEP],
    }[e.key];
    if (!grow) return;
    e.preventDefault();
    setSize((s) => {
      const next = {
        w: clamp(s.w + grow[0], MIN.w, MAX.w),
        h: clamp(s.h + grow[1], MIN.h, MAX.h),
      };
      w.set(next.w);
      h.set(next.h);
      return next;
    });
  };

  const active = EXAMPLES[index];
  const slideX = reduceMotion ? 0 : 32;

  return (
    <div className="font-pretendard absolute inset-0 flex select-none items-center justify-center">
      <div className="relative flex h-full w-full items-center justify-center px-6">
        <motion.div
          ref={panelRef}
          style={{ width: wSpring, height: hSpring }}
          className="relative max-h-[70%] max-w-full rounded-[20px] bg-black/[0.03] p-4 dark:bg-white/[0.05]"
        >
          {/* No overflow clipping: the cards' shadows and the slide transition are
              allowed to breathe past the well's padding. pb-11 keeps the content
              clear of the chevron row pinned to the well's bottom edge. */}
          <div className="@container flex h-full w-full items-center pb-11">
            <AnimatePresence initial={false} mode="popLayout" custom={direction}>
              <motion.div
                key={active.key}
                custom={direction}
                variants={{
                  enter: (dir: number) => ({ x: dir * slideX, opacity: 0, filter: "blur(3px)" }),
                  center: { x: 0, opacity: 1, filter: "blur(0px)" },
                  exit: (dir: number) => ({ x: dir * -slideX, opacity: 0, filter: "blur(3px)" }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                // A settling spring on the travel (interruptible for rapid arrow
                // presses) while opacity and blur tween — the blur bridges the two
                // cards so the swap reads as one morph, not two objects crossfading.
                transition={{
                  x: { type: "spring", stiffness: 320, damping: 34 },
                  opacity: { duration: 0.35, ease: "easeOut" },
                  filter: { duration: 0.35, ease: "easeOut" },
                }}
                className="w-full"
              >
                <active.Component />
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            type="button"
            role="slider"
            aria-label="Resize container"
            aria-valuemin={MIN.w}
            aria-valuemax={MAX.w}
            aria-valuenow={Math.round(size.w)}
            aria-valuetext={`${Math.round(size.w)} by ${Math.round(size.h)} pixels`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerEnd}
            onPointerCancel={onPointerEnd}
            onLostPointerCapture={onPointerEnd}
            onKeyDown={onKeyDown}
            // Named group: the experiment dialog tile already carries a bare `group`,
            // so an unnamed group-hover here would light up on entering the dialog.
            className="group/resize absolute -right-1.5 -top-1.5 size-9 cursor-nesw-resize touch-none outline-none"
          >
            {/* The arc's center sits exactly on the well corner's center (radius 20),
                drawn at radius 24 — a concentric echo of the panel's rounding, 4px out,
                with round line caps that a CSS border corner can't produce. */}
            <svg
              viewBox="0 0 36 36"
              aria-hidden
              className={cn(
                // --border-secondary is the only edge token visible on both the light
                // well and the near-black dark dialog; --border-primary vanishes in dark.
                "size-full fill-none stroke-(--border-secondary)",
                "transition-[scale,stroke] duration-150 ease-out",
                "group-hover/resize:scale-105 group-hover/resize:stroke-(--text-quaternary) group-focus-visible/resize:stroke-(--text-quaternary)",
                dragging &&
                  "scale-105 stroke-(--text-tertiary) group-hover/resize:stroke-(--text-tertiary)",
              )}
            >
              <path d="M4 2H10A24 24 0 0 1 34 26V32" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>

          <motion.span
            className={cn(
              "absolute -top-5 left-1.5 text-[11px] tabular-nums text-quaternary",
              "transition-[opacity,translate] duration-150 ease-out",
              !dragging && "translate-y-0.5 opacity-0",
            )}
            aria-hidden
          >
            {readout}
          </motion.span>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            <ArrowButton direction={-1} onClick={() => go(-1)} />
            <ArrowButton direction={1} onClick={() => go(1)} />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

interface ArrowButtonProps {
  direction: number;
  onClick: () => void;
  className?: string;
}

function ArrowButton({ direction, onClick, className }: ArrowButtonProps) {
  const Icon = direction === -1 ? IconChevronLeftSmall : IconChevronRightSmall;
  return (
    <button
      type="button"
      aria-label={direction === -1 ? "Previous example" : "Next example"}
      onClick={onClick}
      className={cn(
        "flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full",
        "bg-surface text-secondary shadow-ring-sm hover:text-primary",
        "transition-[color,scale] duration-150 active:scale-[0.94]",
        "outline-none focus-visible:ring-2 focus-visible:ring-default",
        className,
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}

// ——— Examples ————————————————————————————————————————————————————————————————
// Each one is plain markup whose responsive classes are @container variants — the
// thresholds are container widths, tuned by resizing the panel, not the window.

function MediaCard() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface p-4 text-center shadow-ring-sm @min-[280px]:flex-row @min-[280px]:p-3 @min-[280px]:text-left">
      <div className="flex size-14 shrink-0 items-center justify-center rounded-[10px] bg-surface-tertiary @min-[280px]:size-11 @min-[280px]:rounded-lg">
        <IconAudio className="size-5 text-quaternary" />
      </div>
      <div className="w-full min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-primary">Golden Hour</p>
        <p className="truncate text-xs text-quaternary">Jules Marek · 3:42</p>
      </div>
      <button
        type="button"
        className={cn(
          "w-full cursor-pointer rounded-lg py-1.5 text-[13px] font-medium @min-[280px]:hidden",
          "bg-accent-primary text-inverted hover:bg-accent-primary-hover",
          "transition-[background-color,scale] duration-150 active:scale-[0.98]",
        )}
      >
        Play
      </button>
      <button
        type="button"
        aria-label="Play"
        className={cn(
          "hidden size-8 shrink-0 cursor-pointer items-center justify-center rounded-full @min-[280px]:flex",
          "bg-accent-primary text-inverted hover:bg-accent-primary-hover",
          "transition-[background-color,scale] duration-150 active:scale-[0.95]",
        )}
      >
        <IconPlay className="size-3.5" />
      </button>
    </div>
  );
}

const STATS = [
  { label: "Revenue", value: "$48.2k", delta: "+12.4%", up: true },
  { label: "Orders", value: "1,204", delta: "+3.1%", up: true },
  { label: "Refunds", value: "18", delta: "−0.8%", up: false },
];

function StatBlock() {
  return (
    <div className="flex flex-col divide-y divide-(--border-primary) rounded-2xl bg-surface px-4 py-1 shadow-ring-sm @min-[280px]:grid @min-[280px]:grid-cols-3 @min-[280px]:divide-x @min-[280px]:divide-y-0 @min-[280px]:px-0 @min-[280px]:py-3.5">
      {STATS.map((stat) => (
        <div
          key={stat.label}
          className="flex min-w-0 items-baseline justify-between gap-2 py-2.5 @min-[280px]:flex-col @min-[280px]:items-start @min-[280px]:justify-start @min-[280px]:gap-1 @min-[280px]:px-4 @min-[280px]:py-0"
        >
          <span className="text-xs text-quaternary">{stat.label}</span>
          {/* In the grid the delta drops below the value, so a column is never wider
              than its label and the card can't overflow mid-resize. */}
          <span className="flex min-w-0 items-baseline gap-1.5 @min-[280px]:flex-col @min-[280px]:items-start @min-[280px]:gap-0">
            <span className="truncate text-[15px] font-medium tabular-nums text-primary">
              {stat.value}
            </span>
            {/* The tightest container keeps just label + value; the delta joins in
                once there's room for it, instead of truncating the value. */}
            <span
              className={cn(
                "hidden text-[11px] tabular-nums @min-[240px]:inline",
                stat.up ? "text-success" : "text-destructive",
              )}
            >
              {stat.delta}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

// Deep ink fill with a pale tint of the same hue for the initials — the inverse
// duotone reads on both the light and the dark card. Content artwork.
const PEOPLE = [
  {
    name: "Ada Fields",
    role: "Design",
    initials: "AF",
    avatar: "bg-[#5661d6] text-[#e7e9ff]",
    status: "Active",
    dot: "bg-[#429e6d]",
  },
  {
    name: "Noor Malik",
    role: "Engineering",
    initials: "NH",
    avatar: "bg-[#cf4880] text-[#ffe3ee]",
    status: "Away",
    dot: "bg-[#d3942f]",
  },
  {
    name: "Tom Okafor",
    role: "Support",
    initials: "TO",
    avatar: "bg-[#31855c] text-[#def0e6]",
    status: "Offline",
    dot: "bg-(--text-quaternary)",
  },
];

function TeamList() {
  return (
    <div className="divide-y divide-(--border-primary) rounded-2xl bg-surface py-1 shadow-ring-sm">
      {PEOPLE.map((person) => (
        <div key={person.name} className="flex items-center gap-2.5 px-3.5 py-2">
          <span
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-full font-serif text-[10px] inset-ring inset-ring-black/10",
              person.avatar,
            )}
          >
            {person.initials}
          </span>
          <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-primary">
            {person.name}
          </span>
          {/* flex-1 like the name column, so wide layouts read as balanced table
              columns instead of a lone label adrift in the middle. */}
          <span className="hidden min-w-0 flex-1 truncate text-xs text-quaternary @min-[288px]:block">
            {person.role}
          </span>
          {/* Fixed width once the text shows: with an auto-width status, "Active" vs
              "Offline" would give each row a different flex remainder and the role
              column would drift out of alignment row to row. */}
          <span className="flex items-center gap-1.5 @min-[256px]:w-16">
            <span className={cn("size-1.5 shrink-0 rounded-[1px]", person.dot)} />
            <span className="hidden truncate text-xs text-tertiary @min-[256px]:inline">
              {person.status}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
