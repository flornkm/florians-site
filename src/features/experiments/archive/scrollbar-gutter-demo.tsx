import { cn } from "@/lib/utils";
import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import "./scrollbar-gutter-demo.css";

// The body sits in the field already, just under the threshold. Only TAIL gets typed —
// and it's the bit that tips the field over so a scrollbar appears. That's the moment to
// watch: on `auto` the bar steals width and the lines re-wrap; on `stable` the gutter is
// reserved up front, so nothing moves. Then it backspaces TAIL away and repeats, so the
// bar appears and disappears smoothly instead of hard-resetting.
const PREFILL = "A scrollbar takes up space.\n\n";
const TAIL =
  "When it shows up, everything suddenly gets narrower and rearranges to fit. Reserve that space up front and nothing moves.";

const TYPE_MS = 26; // per character
const HOLD_TICKS = 26; // pause at each end (caret blinks here)
const PERIOD = TAIL.length + HOLD_TICKS + TAIL.length + HOLD_TICKS; // type · hold · delete · hold

export const ScrollbarGutter = () => {
  const reduce = useReducedMotion();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setTick((t) => t + 1), TYPE_MS);
    return () => clearInterval(id);
  }, [reduce]);

  const { count, active } = phase(reduce ? -1 : tick % PERIOD);
  const text = PREFILL + TAIL.slice(0, count);
  // Every other run, overlay the dashed guide so the viewer can see the right edge move.
  const showGuide = !reduce && Math.floor(tick / PERIOD) % 2 === 1;

  return (
    <div className="flex w-full max-w-full flex-col items-center justify-center px-4 py-6">
      <div className="grid w-full max-w-[28rem] grid-cols-2 gap-4">
        <Panel good={false} value="Auto" text={text} typing={active} showGuide={showGuide} />
        <Panel good value="Stable" stable text={text} typing={active} showGuide={showGuide} />
      </div>
    </div>
  );
};

// Maps a position in the loop to how much of TAIL is shown and whether the caret is moving
// (solid) or idle (blinking). pos < 0 is the reduced-motion resting state: fully typed.
function phase(pos: number): { count: number; active: boolean } {
  if (pos < 0) return { count: TAIL.length, active: false };
  if (pos < TAIL.length) return { count: pos, active: true }; // typing
  let p = pos - TAIL.length;
  if (p < HOLD_TICKS) return { count: TAIL.length, active: false }; // hold, full
  p -= HOLD_TICKS;
  if (p < TAIL.length) return { count: TAIL.length - p, active: true }; // deleting
  return { count: 0, active: false }; // hold, empty
}

function Panel({
  stable = false,
  text,
  typing,
  showGuide,
  good,
  value,
}: {
  stable?: boolean;
  text: string;
  typing: boolean;
  showGuide: boolean;
  good: boolean;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3.5">
      <div className="flex h-60 w-full flex-col overflow-hidden rounded-xl bg-surface shadow-ring-md">
        <div className="relative min-h-0 flex-1">
          <div
            aria-label={`${value} comment field`}
            className={cn(
              // No right padding on purpose: on `auto` the text runs to the very edge and
              // into the gutter band, then gets shoved out when the bar appears.
              "sg-scroll h-full w-full whitespace-pre-wrap break-words pb-2 pl-3.5 pr-0 pt-3 font-pretendard text-[17px] leading-[1.3] text-primary",
              stable && "sg-stable",
            )}
          >
            {text}
            <span className="sg-caret" data-blink={!typing} aria-hidden />
          </div>

          {/* The scrollbar gutter — the rightmost 14px (the bar's width). On `auto` the text
              fills into this band until the scrollbar appears and pushes it out; on `stable`
              the band is reserved up front, so text never reaches it. */}
          {showGuide && (
            <span
              className="pointer-events-none absolute inset-y-0 right-0 w-[14px] border-l-[1.5px] border-dashed border-blue-500 bg-blue-500/15"
              aria-hidden
            />
          )}
        </div>

        <div className="flex items-center justify-between border-t border-black/[0.06] px-2.5 py-2 dark:border-white/[0.07]">
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            className="flex size-7 items-center justify-center rounded-full text-tertiary transition-colors hover:bg-surface-secondary"
          >
            <SmileIcon />
          </button>
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            className="inline-flex items-center gap-1.5 rounded-full bg-surface py-1.5 pl-3 pr-2 text-[13px] font-medium text-primary shadow-ring-sm transition-transform active:scale-95"
          >
            Send
            <SendIcon />
          </button>
        </div>
      </div>

      <Verdict good={good} value={value} />
    </div>
  );
}

const SmileIcon = () => (
  <svg width={19} height={19} viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={1.7} />
    <path
      d="M8.5 14.2a4.2 4.2 0 0 0 7 0"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
    />
    <circle cx="9.2" cy="10" r="1" fill="currentColor" />
    <circle cx="14.8" cy="10" r="1" fill="currentColor" />
  </svg>
);

const SendIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M5 12h13M13 6l6 6-6 6"
      stroke="currentColor"
      strokeWidth={2.1}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function Verdict({ good, value }: { good: boolean; value: string }) {
  return (
    <div className="inline-flex items-center gap-2">
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full text-white",
          good ? "bg-blue-500" : "bg-neutral-900 dark:bg-white dark:text-neutral-900",
        )}
      >
        {good ? <CheckIcon /> : <CrossIcon />}
      </span>
      <span className="font-pretendard text-[15px] font-medium text-primary">{value}</span>
    </div>
  );
}

const CheckIcon = () => (
  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M5 13l4 4L19 7"
      stroke="currentColor"
      strokeWidth={3.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CrossIcon = () => (
  <svg width={11} height={11} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M6 6l12 12M18 6L6 18"
      stroke="currentColor"
      strokeWidth={3.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
