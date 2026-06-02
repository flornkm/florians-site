import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

interface Message {
  id: string;
  avatar: string; // image src — a logo (png) or a monogram (svg)
  round: string; // tailwind rounding for the avatar (circle vs squircle)
  name: string;
  time: string;
  subject: string;
  email: string;
}

const MESSAGES: Message[] = [
  {
    id: "florian",
    avatar: "/images/florian-mono.svg",
    round: "rounded-full",
    name: "Florian Kiem",
    time: "10:16 AM",
    subject: "Let's tackle these bugs asap",
    email: "hello@floriankiem.com",
  },
  {
    id: "slack",
    avatar: "/images/slack.png",
    round: "rounded-[28%]",
    name: "Slack",
    time: "9:41 AM",
    subject: "New message in #design",
    email: "notifications@slack.com",
  },
  {
    id: "maya",
    avatar: "/images/maya-mono.svg",
    round: "rounded-full",
    name: "Maya Reyes",
    time: "Yesterday",
    subject: "Design review notes",
    email: "maya@northwind.co",
  },
];

const MAX_FOLLOWERS = 8;

// Rope tuning. SEG < icon width so links overlap like a dragged chain of cards.
const SEG = 18;
const HEAD_EASE = 0.35; // how tightly the first link chases the cursor
const LINK_EASE = 0.42; // how quickly each link catches up to the one ahead
const HEAD_OFFSET = { x: 10, y: 12 }; // drag-ghost sits just below-right of the cursor

type CopyType = "image" | "text" | "email";

interface Follower {
  id: number;
  type: CopyType;
  // Spawn point (the copied element's center), in container-local coordinates.
  origin: { x: number; y: number };
  src?: string; // image href when type === "image"
}

// True if the live selection touches `el` (works for text nodes and the image alike).
function selectionTouches(sel: Selection, el: Element) {
  try {
    if (typeof sel.containsNode === "function") return sel.containsNode(el, true);
  } catch {
    // containsNode is non-standard; fall through to the Range check.
  }
  for (let i = 0; i < sel.rangeCount; i++) {
    if (sel.getRangeAt(i).intersectsNode(el)) return true;
  }
  return false;
}

export const CopyExperiment = () => {
  const reduced = useReducedMotion() ?? false;

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [followers, setFollowers] = useState<Follower[]>([]);
  const idRef = useRef(0);

  // Imperative state for the rAF rope sim — kept out of React so it never re-renders per frame.
  const cursorRef = useRef({ x: 0, y: 0 });
  const followersRef = useRef<Follower[]>([]);
  const pointsRef = useRef(new Map<number, { x: number; y: number }>());
  const nodesRef = useRef(new Map<number, HTMLElement>());
  const reducedRef = useRef(reduced);

  useEffect(() => {
    followersRef.current = followers;
  }, [followers]);
  useEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);

  // Seed the cursor near the card so a copy made before any pointer move flies somewhere sane.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    cursorRef.current = { x: r.width / 2, y: r.height / 2.4 };
  }, []);

  // The rope: link 0 (newest) chases the cursor; every other link is pulled to a fixed
  // distance behind the link ahead of it, so lag accumulates down the chain like a real rope.
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const order = [...followersRef.current].reverse(); // newest → oldest (head → tail)
      const points = pointsRef.current;
      const headEase = reducedRef.current ? 1 : HEAD_EASE;
      const linkEase = reducedRef.current ? 1 : LINK_EASE;

      let prev = {
        x: cursorRef.current.x + HEAD_OFFSET.x,
        y: cursorRef.current.y + HEAD_OFFSET.y,
      };

      for (let i = 0; i < order.length; i++) {
        const f = order[i];
        let p = points.get(f.id);
        if (!p) {
          p = { ...f.origin };
          points.set(f.id, p);
        }

        if (i === 0) {
          p.x += (prev.x - p.x) * headEase;
          p.y += (prev.y - p.y) * headEase;
        } else {
          const vx = p.x - prev.x;
          const vy = p.y - prev.y;
          const d = Math.hypot(vx, vy) || 0.0001;
          const tx = prev.x + (vx / d) * SEG;
          const ty = prev.y + (vy / d) * SEG;
          p.x += (tx - p.x) * linkEase;
          p.y += (ty - p.y) * linkEase;
        }

        const node = nodesRef.current.get(f.id);
        if (node) node.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
        prev = p;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleMove = (e: React.PointerEvent) => {
    const r = containerRef.current?.getBoundingClientRect();
    if (!r) return;
    cursorRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const spawn = (type: CopyType, el: Element, src?: string) => {
    const container = containerRef.current;
    if (!container) return;
    const base = container.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    const origin = {
      x: rect.left - base.left + rect.width / 2,
      y: rect.top - base.top + rect.height / 2,
    };
    setFollowers((prev) => {
      const next = [...prev, { id: idRef.current++, type, origin, src }];
      return next.length > MAX_FOLLOWERS ? next.slice(next.length - MAX_FOLLOWERS) : next;
    });
  };

  // Native copy: every selected [data-copy] element joins the rope. One handler covers
  // every row in the list, so copying spans multiple messages naturally.
  const handleCopy = () => {
    const sel = window.getSelection();
    const card = cardRef.current;
    if (!sel || sel.isCollapsed || sel.rangeCount === 0 || !card) return;
    for (const el of card.querySelectorAll<HTMLElement>("[data-copy]")) {
      if (selectionTouches(sel, el)) spawn(el.dataset.copy as CopyType, el, el.dataset.src);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // Clicking the card just places/clears a text cursor — leave the rope alone.
    if (cardRef.current?.contains(e.target as Node)) return;
    setFollowers([]);
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handleMove}
      onCopy={handleCopy}
      onClick={handleClick}
      className="relative flex h-full w-full flex-col items-center justify-center px-6"
    >
      {/* Each row's avatar / subject / email is select-all + data-copy, so a single click
          natively selects an item and ⌘C drops it onto the rope. */}
      <div
        ref={cardRef}
        className="w-[21rem] rounded-2xl bg-surface px-3 shadow-lg ring-1 ring-black/[0.07] dark:ring-white/[0.08]"
      >
        {MESSAGES.map((m, i) => (
          <div key={m.id}>
            {/* Divider starts at the text column (past the avatar), like Apple Mail. */}
            {i > 0 && <div className="ml-14 h-px bg-black/[0.06] dark:bg-white/[0.08]" />}

            <div className="flex gap-3 py-3">
              <span
                data-copy="image"
                data-src={m.avatar}
                className="relative size-11 shrink-0 self-start select-all"
              >
                <img
                  src={m.avatar}
                  alt={m.name}
                  draggable={false}
                  className={cn("size-11 object-cover", m.round)}
                />
                {/* Ring lives on an overlay, not the <img> — an inset box-shadow on a replaced
                    element is painted over by the image content and never shows. */}
                <span
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute inset-0 ring-1 ring-black/10 ring-inset dark:ring-white/15",
                    m.round,
                  )}
                />
              </span>

              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-primary">{m.name}</span>
                  <span className="ml-auto shrink-0 text-xs text-tertiary">{m.time}</span>
                </div>

                <span data-copy="text" className="truncate text-sm text-primary select-all">
                  {m.subject}
                </span>

                <span data-copy="email" className="truncate text-sm text-tertiary select-all">
                  {m.email}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* The rope. pointer-events-none so it never blocks selecting or the clear-click. */}
      <div className="pointer-events-none absolute inset-0 select-none">
        <AnimatePresence>
          {followers.map((f, i) => (
            <div
              key={f.id}
              ref={(node) => {
                if (node) {
                  node.style.transform = `translate3d(${f.origin.x}px, ${f.origin.y}px, 0)`;
                  nodesRef.current.set(f.id, node);
                  if (!pointsRef.current.has(f.id)) pointsRef.current.set(f.id, { ...f.origin });
                } else {
                  nodesRef.current.delete(f.id);
                  pointsRef.current.delete(f.id);
                }
              }}
              style={{ zIndex: i }}
              className="absolute left-0 top-0 will-change-transform"
            >
              {/* Plain wrapper centers on the rope point; inner motion owns the pop/fade. */}
              <div className="-translate-x-1/2 -translate-y-1/2">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 520, damping: 30 }}
                >
                  <FollowerVisual type={f.type} src={f.src} />
                </motion.div>
              </div>
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

function FollowerVisual({ type, src }: { type: CopyType; src?: string }) {
  if (type === "email") return <EnvelopeIcon className="h-[1.4rem] w-8" />;
  return <FileIcon variant={type === "image" ? "image" : "txt"} src={src} className="size-8" />;
}

// macOS-style document — kept short, flat and softly rounded so the chain reads as a tidy
// stack of cards. "txt" shows a minimal label + line; "image" turns the sheet into a photo file.
const PAGE = "M8.5 4 H25 L34 13 V33.5 Q34 36 31.5 36 H8.5 Q6 36 6 33.5 V6.5 Q6 4 8.5 4 Z";

function FileIcon({
  variant,
  src,
  className,
}: {
  variant: "txt" | "image";
  src?: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" aria-hidden>
      <defs>
        <clipPath id="cp-file-clip">
          <path d={PAGE} />
        </clipPath>
        <filter id="cp-file-shadow" x="-25%" y="-20%" width="150%" height="150%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#0b1220" floodOpacity="0.14" />
        </filter>
      </defs>
      <g filter="url(#cp-file-shadow)">
        <path d={PAGE} fill="#ffffff" />
        {variant === "image" && src && (
          <image
            href={src}
            x="6"
            y="4"
            width="28"
            height="32"
            preserveAspectRatio="xMidYMid slice"
            clipPath="url(#cp-file-clip)"
          />
        )}
        <path d={PAGE} stroke="#d6dae1" strokeWidth="1" strokeLinejoin="round" fill="none" />
        {/* Folded corner: the dog-ear sitting over the top-right cut. */}
        <path
          d="M25 4 L34 13 L25 13 Z"
          fill="#eef1f4"
          stroke="#d6dae1"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        {variant === "txt" && (
          <>
            <text
              x="20"
              y="26"
              textAnchor="middle"
              fontSize="7"
              fontWeight="700"
              letterSpacing="0.4"
              fontFamily="ui-monospace, SFMono-Regular, monospace"
              fill="#aab1bc"
            >
              TXT
            </text>
            <rect x="12" y="30" width="16" height="1.8" rx="0.9" fill="#e4e7ec" />
          </>
        )}
      </g>
    </svg>
  );
}

// A small crafted envelope — flat white with a light border and soft shadow, matching the files.
function EnvelopeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 34" className={className} fill="none" aria-hidden>
      <defs>
        <filter id="cp-env-shadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#0b1220" floodOpacity="0.14" />
        </filter>
      </defs>
      <g filter="url(#cp-env-shadow)">
        <rect
          x="1.5"
          y="3"
          width="45"
          height="28"
          rx="4.5"
          fill="#ffffff"
          stroke="#d6dae1"
          strokeWidth="1"
        />
        <path d="M3 5 L24 18 L45 5" stroke="#d6dae1" strokeWidth="1" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
