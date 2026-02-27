import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

type NotifState = "idle" | "loading" | "success" | "error" | "remind";

const SPRING = { stiffness: 400, damping: 30, mass: 0.8 };
const CONTENT_TRANSITION = { duration: 0.15, ease: "easeOut" as const };

const STATE_DIMENSIONS: Record<NotifState, { width: number; height: number; radius: number }> = {
  idle: { width: 120, height: 36, radius: 18 },
  loading: { width: 160, height: 40, radius: 20 },
  success: { width: 200, height: 44, radius: 22 },
  error: { width: 190, height: 44, radius: 22 },
  remind: { width: 240, height: 44, radius: 22 },
};

function SpinnerIcon() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.25" />
      <path d="M8 1.5A6.5 6.5 0 0114.5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
      <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
      <path d="M4.5 4.5L11.5 11.5M11.5 4.5L4.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
      <path
        d="M6 13a2 2 0 004 0M8 1.5a4.5 4.5 0 00-4.5 4.5c0 2.5-1 3.5-1.5 4h12c-.5-.5-1.5-1.5-1.5-4A4.5 4.5 0 008 1.5z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DotIcon() {
  return (
    <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="3" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

function NotifContent({ state }: { state: NotifState }) {
  return (
    <motion.div
      key={state}
      initial={{ opacity: 0, scale: 0.85, filter: "blur(4px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.85, filter: "blur(4px)" }}
      transition={CONTENT_TRANSITION}
      className="flex items-center justify-center gap-2"
    >
      {state === "idle" && (
        <>
          <DotIcon />
          <span className="text-xs font-medium opacity-60">Notification</span>
        </>
      )}
      {state === "loading" && (
        <>
          <SpinnerIcon />
          <span className="text-xs font-medium">Sending...</span>
        </>
      )}
      {state === "success" && (
        <>
          <CheckIcon />
          <span className="text-xs font-medium">Sent!</span>
        </>
      )}
      {state === "error" && (
        <>
          <XIcon />
          <span className="text-xs font-medium">Failed</span>
        </>
      )}
      {state === "remind" && (
        <>
          <BellIcon />
          <span className="text-xs font-medium">Reminder set for 3pm</span>
        </>
      )}
    </motion.div>
  );
}

export const DynamicNotificationDemo = () => {
  const [state, setState] = useState<NotifState>("idle");
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isRunning = state !== "idle";

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearAllTimeouts();
  }, [clearAllTimeouts]);

  const schedule = useCallback(
    (fn: () => void, ms: number) => {
      const id = setTimeout(fn, ms);
      timeoutsRef.current.push(id);
      return id;
    },
    [],
  );

  const triggerSend = useCallback(() => {
    if (isRunning) return;
    clearAllTimeouts();
    setState("loading");
    schedule(() => setState("success"), 1200);
    schedule(() => setState("idle"), 3700);
  }, [isRunning, clearAllTimeouts, schedule]);

  const triggerError = useCallback(() => {
    if (isRunning) return;
    clearAllTimeouts();
    setState("loading");
    schedule(() => setState("error"), 800);
    schedule(() => setState("idle"), 3300);
  }, [isRunning, clearAllTimeouts, schedule]);

  const triggerRemind = useCallback(() => {
    if (isRunning) return;
    clearAllTimeouts();
    setState("remind");
    schedule(() => setState("idle"), 2500);
  }, [isRunning, clearAllTimeouts, schedule]);

  const dims = STATE_DIMENSIONS[state];

  return (
    <div className="flex flex-col items-center gap-8">
      <motion.div
        layout
        animate={{
          width: dims.width,
          height: dims.height,
          borderRadius: dims.radius,
        }}
        transition={{ layout: SPRING, ...SPRING }}
        className="flex items-center justify-center overflow-hidden bg-[#1a1a1a] text-white shadow-lg shadow-black/20"
        style={{ willChange: "width, height, border-radius" }}
      >
        <AnimatePresence mode="wait">
          <NotifContent state={state} />
        </AnimatePresence>
      </motion.div>

      <div className="flex items-center gap-2">
        <button
          onClick={triggerSend}
          disabled={isRunning}
          className="rounded-md px-3 py-1.5 text-xs text-tertiary transition-colors duration-150 hover:bg-interactive-hover hover:text-secondary disabled:pointer-events-none disabled:opacity-40"
        >
          Send
        </button>
        <button
          onClick={triggerError}
          disabled={isRunning}
          className="rounded-md px-3 py-1.5 text-xs text-tertiary transition-colors duration-150 hover:bg-interactive-hover hover:text-secondary disabled:pointer-events-none disabled:opacity-40"
        >
          Error
        </button>
        <button
          onClick={triggerRemind}
          disabled={isRunning}
          className="rounded-md px-3 py-1.5 text-xs text-tertiary transition-colors duration-150 hover:bg-interactive-hover hover:text-secondary disabled:pointer-events-none disabled:opacity-40"
        >
          Remind
        </button>
      </div>
    </div>
  );
};
