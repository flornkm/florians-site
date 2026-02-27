import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

type NotifState = "idle" | "loading" | "success";

const SPRING = { type: "spring" as const, stiffness: 300, damping: 35, mass: 0.6 };

const DIMENSIONS: Record<NotifState, { width: number; height: number }> = {
  idle: { width: 44, height: 32 },
  loading: { width: 44, height: 32 },
  success: { width: 96, height: 32 },
};

function Spinner() {
  return (
    <motion.svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
      <path d="M7 1.5A5.5 5.5 0 0112.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </motion.svg>
  );
}

function Check() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none">
      <path
        d="M3 7.5L5.5 10L11 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ContentInner({ state }: { state: NotifState }) {
  return (
    <motion.div
      key={state}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="flex items-center justify-center gap-1.5"
    >
      {state === "idle" && <span className="h-1.5 w-1.5 rounded-full bg-white/50" />}
      {state === "loading" && <Spinner />}
      {state === "success" && (
        <>
          <Check />
          <span className="text-xs font-medium">Done</span>
        </>
      )}
    </motion.div>
  );
}

export const DynamicNotificationDemo = () => {
  const [state, setState] = useState<NotifState>("idle");
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isRunning = state !== "idle";

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  useEffect(() => clearTimeouts, [clearTimeouts]);

  const trigger = useCallback(() => {
    if (isRunning) return;
    clearTimeouts();
    setState("loading");
    const t1 = setTimeout(() => setState("success"), 1000);
    const t2 = setTimeout(() => setState("idle"), 2800);
    timeoutsRef.current.push(t1, t2);
  }, [isRunning, clearTimeouts]);

  const dims = DIMENSIONS[state];

  return (
    <div className="flex flex-col items-center gap-5">
      <motion.button
        onClick={trigger}
        disabled={isRunning}
        layout
        animate={{
          width: dims.width,
          height: dims.height,
        }}
        transition={SPRING}
        className="flex cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#1a1a1a] text-white disabled:cursor-default"
      >
        <AnimatePresence mode="wait">
          <ContentInner state={state} />
        </AnimatePresence>
      </motion.button>
      <span className="text-xs text-quaternary">{isRunning ? "\u00A0" : "Click the pill"}</span>
    </div>
  );
};
