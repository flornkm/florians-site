import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "motion/react";
import {
  type PointerEvent as ReactPointerEvent,
  useId,
  useRef,
  useSyncExternalStore,
} from "react";

/* Stacked avatars without borders: each avatar is an SVG whose mask cuts out a
   crescent where the previous avatar overlaps, so the separation is a real hole
   and any background shows through it. The inset ring follows the clipped
   outline exactly — its two arcs are the avatar circle inset by the ring
   offset and the neighbour's cut circle grown by it, which meet at the same
   points the clip does. A replicated cursor slides behind the
   stack — through the crescent holes too, which is the whole point of clipping
   instead of painting borders. On touch devices it wanders by itself. */

const SIZE = 44;
/** Fraction of the diameter each avatar sinks into the one before it. */
const OVERLAP = 0.25;
/** Visible crescent between neighbours, px. */
const GAP = 2.5;
const RING_WIDTH = 1;
/** Centers the stroke so its outer edge sits exactly on the clipped outline. */
const RING_INSET = RING_WIDTH / 2;

const RADIUS = SIZE / 2;
const NEIGHBOUR_CX = RADIUS - SIZE * (1 - OVERLAP);
const CUT_RADIUS = RADIUS + GAP;

// The crescent eats the left of a clipped avatar, so its visible region's
// optical center sits right of the geometric one. Halfway toward the visible
// band's midpoint reads centered; the full midpoint overshoots.
const CLIPPED_TEXT_SHIFT = (NEIGHBOUR_CX + CUT_RADIUS) / 4;

// Equal perceived brightness: every background sits at the same OKLCH lightness,
// with chroma at ~70% of each hue's sRGB maximum (equal absolute chroma would
// leave green washed out — its gamut ceiling at this lightness is half indigo's).
// Text tints share one lightness and one low chroma across all hues.
const PEOPLE = [
  {
    initials: "AF",
    fill: "fill-[oklch(0.55_0.176_275)]",
    text: "fill-[oklch(0.9_0.045_275)]",
  },
  {
    initials: "NH",
    fill: "fill-[oklch(0.55_0.154_15)]",
    text: "fill-[oklch(0.9_0.045_15)]",
  },
  {
    initials: "TO",
    fill: "fill-[oklch(0.55_0.095_155)]",
    text: "fill-[oklch(0.9_0.045_155)]",
  },
];

function StackAvatar({ initials, fill, textFill, isFirst }: {
  initials: string;
  fill: string;
  textFill: string;
  isFirst: boolean;
}) {
  // Per-instance ids: the demo can be mounted twice at once (dialog + drawer),
  // and colliding mask ids would clip every stack against the first one's defs.
  const id = useId();
  const bodyMask = isFirst ? undefined : `url(#${id}-body)`;
  const ringMask = isFirst ? undefined : `url(#${id}-ring)`;

  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      aria-hidden
      className="select-none"
      style={{ marginLeft: isFirst ? 0 : -SIZE * OVERLAP }}
    >
      {!isFirst && (
        <defs>
          <mask id={`${id}-body`}>
            <rect width="100%" height="100%" fill="black" />
            <circle cx={RADIUS} cy={RADIUS} r={RADIUS} fill="white" />
            <circle cx={NEIGHBOUR_CX} cy={RADIUS} r={CUT_RADIUS} fill="black" />
          </mask>
          <mask id={`${id}-ring`}>
            <rect width="100%" height="100%" fill="white" />
            <circle cx={NEIGHBOUR_CX} cy={RADIUS} r={CUT_RADIUS + RING_INSET} fill="black" />
          </mask>
          <clipPath id={`${id}-clip`}>
            <circle cx={RADIUS} cy={RADIUS} r={RADIUS - RING_INSET} />
          </clipPath>
        </defs>
      )}

      <g mask={bodyMask}>
        <circle cx={RADIUS} cy={RADIUS} r={RADIUS} className={fill} />
        <text
          x={isFirst ? RADIUS : RADIUS + CLIPPED_TEXT_SHIFT}
          y={RADIUS}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={SIZE * 0.3}
          className={cn("font-serif italic", textFill)}
        >
          {initials}
        </text>
      </g>

      {/* The ring's two arcs: the avatar circle inset by half the stroke (masked
          off where the neighbour's grown circle covers it), and the neighbour's
          grown circle (clipped to the inset avatar circle). Both hug the clipped
          outline flush and meet exactly where the clip's arcs do. */}
      <g fill="none" strokeWidth={RING_WIDTH} className="stroke-black/20 dark:stroke-white/35">
        <circle cx={RADIUS} cy={RADIUS} r={RADIUS - RING_INSET} mask={ringMask} />
        {!isFirst && (
          <circle
            cx={NEIGHBOUR_CX}
            cy={RADIUS}
            r={CUT_RADIUS + RING_INSET}
            clipPath={`url(#${id}-clip)`}
          />
        )}
      </g>
    </svg>
  );
}

/** Where the arrow tip sits inside the 32×32 cursor SVG. The replica is
 *  positioned so this point lands exactly on the hidden real cursor's tip. */
const CURSOR_HOTSPOT = { x: 16, y: 14 };

// Deterministic pseudo-random so SSR (deep-links) and client render the same
// wander path — Math.random() here would be a hydration mismatch.
function seeded(index: number, salt: number) {
  const x = Math.sin(index * 131.7 + salt * 269.3) * 43758.5453;
  return x - Math.floor(x);
}

// Waypoints the touch-device cursor drifts through behind the stack.
const WANDER_X = Array.from({ length: 6 }, (_, i) => (seeded(i, 1) - 0.5) * 180);
const WANDER_Y = Array.from({ length: 6 }, (_, i) => (seeded(i, 2) - 0.5) * 90);

// The real cursor never zooms with the page, so the replica can't either.
// outerWidth is in OS points while innerWidth is in CSS pixels, so their ratio
// is the absolute zoom factor — it works even when the page loads already
// zoomed, which a devicePixelRatio baseline can't detect. Snapping to the
// browser's discrete zoom steps filters out scrollbar noise in the ratio.
const ZOOM_STEPS = [
  0.25, 0.33, 0.5, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5,
];

function subscribeToZoom(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

function getZoom() {
  const raw = window.outerWidth / window.innerWidth;
  if (!Number.isFinite(raw) || raw <= 0) return 1;
  let nearest = 1;
  for (const step of ZOOM_STEPS) {
    if (Math.abs(step - raw) < Math.abs(nearest - raw)) nearest = step;
  }
  return nearest;
}

function useBrowserZoom() {
  return useSyncExternalStore(subscribeToZoom, getZoom, () => 1);
}

// Cursor=Default.svg, inlined 1:1, plus the soft shadow the OS composites onto
// the real cursor — drop-shadow (not box-shadow) so it hugs the arrow silhouette.
function DefaultCursor() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter:
          "drop-shadow(0 1px 1.5px rgb(0 0 0 / 0.25)) drop-shadow(0 3px 6px rgb(0 0 0 / 0.15))",
      }}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.501 13.8601L24.884 22.2611C25.937 23.3171 25.19 25.1191 23.699 25.1191L22.475 25.119L23.6908 28.0067C23.9038 28.5127 23.9068 29.0727 23.6998 29.5817C23.4918 30.0917 23.0978 30.4897 22.5898 30.7027C22.3338 30.8097 22.0658 30.8637 21.7918 30.8637C20.9608 30.8637 20.2158 30.3687 19.8938 29.6027L18.616 26.565L17.784 27.3031C16.703 28.2591 15 27.4921 15 26.0481V14.4811C15 13.6971 15.947 13.3051 16.501 13.8601Z"
        fill="white"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.9995 15.1292C15.9995 14.9982 16.1585 14.9322 16.2505 15.0252L24.1585 22.9502C24.5895 23.3822 24.2835 24.1192 23.6735 24.1192L20.9695 24.1177L22.7691 28.3936C22.9961 28.9336 22.7421 29.5546 22.2031 29.7806C21.6621 30.0076 21.0421 29.7546 20.8161 29.2156L18.9985 24.8917L17.1385 26.5392C16.7225 26.9072 16.0806 26.6507 16.0065 26.1274L15.9995 26.0262V15.1292Z"
        fill="black"
      />
    </svg>
  );
}

/** Counter-scales the sprite around its hotspot, so the tip stays anchored
 *  while the drawn cursor holds its real, unzoomed size. */
function CursorSprite({ zoom }: { zoom: number }) {
  return (
    <div
      style={{
        transform: `scale(${1 / zoom})`,
        transformOrigin: `${CURSOR_HOTSPOT.x}px ${CURSOR_HOTSPOT.y}px`,
      }}
    >
      <DefaultCursor />
    </div>
  );
}

export function AvatarStack() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const dragRectRef = useRef<HTMLDivElement>(null);
  const zoom = useBrowserZoom();
  // Touch is a pointer capability, not a viewport width.
  const isCoarse = useMediaQuery("(pointer: coarse)");
  const reduceMotion = useReducedMotion();

  // Direct style mutation, no state: a re-render per pointermove would redo the
  // whole stack's SVG tree just to move a 32px sprite.
  const handlePointerMove = (event: ReactPointerEvent) => {
    if (event.pointerType !== "mouse") return;
    const container = containerRef.current;
    const cursor = cursorRef.current;
    if (!container || !cursor) return;
    // Over the draggable the real grab/grabbing cursor takes over (its CSS
    // cursor overrides the container's cursor-none), so the replica bows out.
    if (dragRectRef.current?.contains(event.target as Node)) {
      cursor.style.opacity = "0";
      return;
    }
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left - CURSOR_HOTSPOT.x;
    const y = event.clientY - rect.top - CURSOR_HOTSPOT.y;
    cursor.style.transform = `translate(${x}px, ${y}px)`;
    cursor.style.opacity = "1";
  };

  const handlePointerLeave = () => {
    if (cursorRef.current) cursorRef.current.style.opacity = "0";
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative flex h-full w-full cursor-none items-center justify-center"
    >
      {/* The replicated cursor renders below the avatars in stacking order, so
          it disappears behind the stack while the real cursor stays hidden. */}
      {!isCoarse && (
        <div
          ref={cursorRef}
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 opacity-0 will-change-transform"
        >
          <CursorSprite zoom={zoom} />
        </div>
      )}
      {isCoarse && !reduceMotion && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute"
          animate={{ x: WANDER_X, y: WANDER_Y }}
          transition={{ duration: 14, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        >
          <CursorSprite zoom={zoom} />
        </motion.div>
      )}
      <div className="relative z-10 flex items-center">
        {PEOPLE.map((person, index) => (
          <StackAvatar
            key={person.initials}
            initials={person.initials}
            fill={person.fill}
            textFill={person.text}
            isFirst={index === 0}
          />
        ))}
      </div>
      {/* Drag it up and it slides behind the avatars: the stack is z-10, the
          rectangle isn't. Its grab cursors override the container's
          cursor-none, so the real cursor takes over while on it. */}
      <motion.div
        ref={dragRectRef}
        drag
        dragConstraints={containerRef}
        dragMomentum={false}
        // Centered with auto margins, not a translate — motion's drag transform
        // would overwrite a -translate-x-1/2.
        // The inset hairline mirrors the avatars' ring: 1px crisp, dark in
        // light mode, light in dark mode.
        className="absolute inset-x-0 bottom-10 mx-auto h-24 w-40 cursor-grab rounded-md shadow-[inset_0_0_0_1px_rgb(0_0_0/0.2)] active:cursor-grabbing dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.35)]"
        style={{
          // Interpolating in oklch keeps the hue walk vivid; sRGB interpolation
          // would gray out the midpoints.
          background:
            "linear-gradient(to bottom in oklch, oklch(0.87 0.07 85), oklch(0.76 0.11 30) 45%, oklch(0.58 0.13 300))",
        }}
      />
    </div>
  );
}
