import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "motion/react";
import { WORDMARK_SPACING, WORDMARK_STROKE } from "./florian-kiem-path";

// The morph is seamless because the same rect elements persist across states:
// flap diagonals slide into the checkmark, envelope outline bars collapse to nothing.

const S = WORDMARK_SPACING;
const W = WORDMARK_STROKE;
const T = 16.2;

const COLS = 20;
// +W so the last grid bar sits fully inside the viewBox instead of bleeding off the right edge.
const VIEW_W = COLS * S + W;
const VIEW_H = 130;

const ENV_LEFT_COL = 4;
const ENV_RIGHT_COL = COLS - 4;
const ENV_LEFT = ENV_LEFT_COL * S;
const ENV_RIGHT = ENV_RIGHT_COL * S;
const ENV_CENTER = (ENV_LEFT + ENV_RIGHT) / 2;
const ENV_HALF = (ENV_RIGHT - ENV_LEFT) / 2;
const ENV_TOP = 28;
const ENV_BOTTOM = 104;
const ENV_FLAP_BOTTOM = 70; // where the two flap diagonals meet in the middle

const CHK_L = { x: 40, y: 60 };
const CHK_V = { x: 72, y: 92 };
const CHK_R = { x: 124, y: 34 };

// Flap diagonal columns and checkmark columns line up on the same range, so each flap bar morphs into a checkmark bar.
const DIAG_FROM = ENV_LEFT_COL + 1;
const DIAG_TO = ENV_RIGHT_COL - 1;

const flapY = (x: number) => {
  const frac = x <= ENV_CENTER ? (x - ENV_LEFT) / ENV_HALF : (ENV_RIGHT - x) / ENV_HALF;
  return ENV_TOP + (ENV_FLAP_BOTTOM - ENV_TOP) * frac;
};

const checkY = (x: number) => {
  const y =
    x <= CHK_V.x
      ? CHK_L.y + ((CHK_V.y - CHK_L.y) * (x - CHK_L.x)) / (CHK_V.x - CHK_L.x)
      : CHK_V.y + ((CHK_R.y - CHK_V.y) * (x - CHK_V.x)) / (CHK_R.x - CHK_V.x);
  return Math.min(VIEW_H - T, Math.max(0, y - T / 2));
};

interface Stroke {
  x: number;
  mail: { y: number; h: number };
  check: { y: number; h: number };
}

// A bar that exists only in the envelope collapses to nothing on the checkmark.
const collapsing = (x: number, y: number, h: number): Stroke => ({
  x,
  mail: { y, h },
  check: { y: y + h, h: 0 },
});

const STROKES: Stroke[] = (() => {
  const out: Stroke[] = [];
  for (let i = DIAG_FROM; i <= DIAG_TO; i++) {
    const x = i * S;
    out.push({ x, mail: { y: flapY(x), h: T }, check: { y: checkY(x), h: T } });
  }
  for (let i = DIAG_FROM; i <= DIAG_TO; i++) {
    const x = i * S;
    out.push(collapsing(x, ENV_TOP, T));
    out.push(collapsing(x, ENV_BOTTOM - T, T));
  }
  for (const i of [ENV_LEFT_COL, ENV_RIGHT_COL]) {
    out.push(collapsing(i * S, ENV_TOP, ENV_BOTTOM - ENV_TOP));
  }
  return out;
})();

const GRID_XS = Array.from({ length: COLS + 1 }, (_, i) => i * S);

const SWEEP = 0.28; // seconds for the build/morph to cross the full width
const delayFor = (x: number) => (x / VIEW_W) * SWEEP;

const EASE = [0.16, 1, 0.3, 1] as const;

export type MailLinesShape = "mail" | "check";

export function MailLines({
  shape = "mail",
  className,
}: {
  shape?: MailLinesShape;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className={cn("block size-full", className)}
      fill="none"
      preserveAspectRatio="none"
      role="img"
      aria-label={shape === "check" ? "Copied" : "Email"}
    >
      <g className="fill-[#9e9e9e] opacity-50 dark:fill-[#6e6e6e]" aria-hidden>
        {GRID_XS.map((x) => (
          <rect key={x} x={x} y={0} width={W} height={VIEW_H} />
        ))}
      </g>

      <g className="fill-[#4d4d4d] dark:fill-[#c8c8c8]" aria-hidden>
        {STROKES.map((s, i) => {
          const target = shape === "check" ? s.check : s.mail;
          return (
            <motion.rect
              key={i}
              x={s.x}
              width={W}
              initial={reduceMotion ? false : { y: s.mail.y + s.mail.h, height: 0 }}
              animate={{ y: target.y, height: target.h }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { delay: delayFor(s.x), duration: 0.3, ease: EASE }
              }
            />
          );
        })}
      </g>
    </svg>
  );
}
