import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

type NotifState = "idle" | "loading" | "success" | "reminder" | "error";

const SPRING = { type: "spring" as const, stiffness: 300, damping: 35, mass: 0.6 };

const DIMENSIONS: Record<NotifState, { width: number; height: number }> = {
  idle: { width: 44, height: 32 },
  loading: { width: 44, height: 32 },
  success: { width: 96, height: 32 },
  reminder: { width: 120, height: 32 },
  error: { width: 96, height: 32 },
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

function Bell() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none">
      <path
        d="M7 1.5C4.79 1.5 3 3.29 3 5.5V8L2 9.5H12L11 8V5.5C11 3.29 9.21 1.5 7 1.5Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5.5 9.5V10C5.5 10.83 6.17 11.5 7 11.5C7.83 11.5 8.5 10.83 8.5 10V9.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Cross() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none">
      <path
        d="M4 4L10 10M10 4L4 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
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
      className={`flex items-center justify-center gap-1.5 ${state === "error" ? "text-red-400" : "text-white"}`}
    >
      {state === "idle" && <span className="h-1.5 w-1.5 rounded-full bg-white/50" />}
      {state === "loading" && <Spinner />}
      {state === "success" && (
        <>
          <Check />
          <span className="text-xs font-medium">Sent</span>
        </>
      )}
      {state === "reminder" && (
        <>
          <Bell />
          <span className="text-xs font-medium">In 30 min</span>
        </>
      )}
      {state === "error" && (
        <>
          <Cross />
          <span className="text-xs font-medium">Failed</span>
        </>
      )}
    </motion.div>
  );
}

type SequenceTarget = "success" | "reminder" | "error";

export const DynamicNotificationDemo = () => {
  const [state, setState] = useState<NotifState>("idle");
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isRunning = state !== "idle";

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  useEffect(() => clearTimeouts, [clearTimeouts]);

  const trigger = useCallback(
    (target: SequenceTarget) => {
      if (isRunning) return;
      clearTimeouts();
      setState("loading");
      const t1 = setTimeout(() => setState(target), 1000);
      const t2 = setTimeout(() => setState("idle"), 2800);
      timeoutsRef.current.push(t1, t2);
    },
    [isRunning, clearTimeouts],
  );

  const dims = DIMENSIONS[state];

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        layout
        animate={{
          width: dims.width,
          height: dims.height,
        }}
        transition={SPRING}
        className="flex items-center justify-center overflow-hidden rounded-full bg-[#1a1a1a] text-white"
      >
        <AnimatePresence mode="wait">
          <ContentInner state={state} />
        </AnimatePresence>
      </motion.div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => trigger("success")}
          disabled={isRunning}
          className="text-xs text-tertiary transition-colors duration-150 hover:text-secondary disabled:pointer-events-none disabled:opacity-30"
        >
          Send
        </button>
        <button
          onClick={() => trigger("reminder")}
          disabled={isRunning}
          className="text-xs text-tertiary transition-colors duration-150 hover:text-secondary disabled:pointer-events-none disabled:opacity-30"
        >
          Remind
        </button>
        <button
          onClick={() => trigger("error")}
          disabled={isRunning}
          className="text-xs text-tertiary transition-colors duration-150 hover:text-secondary disabled:pointer-events-none disabled:opacity-30"
        >
          Error
        </button>
      </div>
    </div>
  );
};
