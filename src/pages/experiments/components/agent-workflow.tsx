import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

const HOLD_MS = 1400;

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    className={className}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3.5 8.5L6.5 11.5L12.5 4.5" />
  </svg>
);

const FolderIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 16 16" fill="none" className={className} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4.5V12a1 1 0 001 1h10a1 1 0 001-1V6a1 1 0 00-1-1H8L6.5 3.5H3A1 1 0 002 4.5z" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 16 16" fill="none" className={className} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="12" height="11" rx="1" />
    <path d="M5 2v2M11 2v2M2 7h12" />
  </svg>
);

const SpinnerDot = () => (
  <div className="flex gap-0.5 items-center h-3">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="w-1 h-1 rounded-full bg-quaternary"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
      />
    ))}
  </div>
);

type Phase =
  | "idle"
  | "message"
  | "form"
  | "holding"
  | "confirming"
  | "success"
  | "receipt"
  | "forking"
  | "parallel"
  | "merging"
  | "final";

const FILE_MESSAGES = [
  "Saving receipt.pdf to ~/Documents/Receipts/...",
  "Filed under Zara Home / February 2026",
  "Updated expense tracker spreadsheet",
];

const CAL_MESSAGES = [
  "Creating delivery event for Mar 2-5...",
  "Adding Zara Home order #ZH-29841 details",
  "Calendar invite sent to jane@cooper.com",
];

export const AgentWorkflow = () => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [holdProg, setHoldProg] = useState(0);
  const holdStart = useRef(0);
  const raf = useRef(0);
  const hasStarted = useRef(false);

  const [fileMessages, setFileMessages] = useState<number>(0);
  const [calMessages, setCalMessages] = useState<number>(0);
  const [fileLoading, setFileLoading] = useState(false);
  const [calLoading, setCalLoading] = useState(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    const t1 = setTimeout(() => setPhase("message"), 400);
    const t2 = setTimeout(() => setPhase("form"), 1600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (phase !== "receipt") return;
    const t = setTimeout(() => setPhase("forking"), 1400);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "forking") return;
    const t = setTimeout(() => {
      setPhase("parallel");
    }, 600);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "parallel") return;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const fileDelays = [400, 1800, 3400];
    const calDelays = [600, 2400, 4200];

    fileDelays.forEach((d, i) => {
      timers.push(setTimeout(() => setFileLoading(true), d - 300));
      timers.push(
        setTimeout(() => {
          setFileMessages(i + 1);
          setFileLoading(false);
        }, d)
      );
    });

    calDelays.forEach((d, i) => {
      timers.push(setTimeout(() => setCalLoading(true), d - 300));
      timers.push(
        setTimeout(() => {
          setCalMessages(i + 1);
          setCalLoading(false);
        }, d)
      );
    });

    const mergeDelay = Math.max(...fileDelays, ...calDelays) + 800;
    timers.push(setTimeout(() => setPhase("merging"), mergeDelay));
    timers.push(setTimeout(() => setPhase("final"), mergeDelay + 800));

    return () => timers.forEach(clearTimeout);
  }, [phase]);

  const reset = useCallback(() => {
    setPhase("idle");
    setHoldProg(0);
    setFileMessages(0);
    setCalMessages(0);
    setFileLoading(false);
    setCalLoading(false);
    hasStarted.current = false;
    setTimeout(() => {
      hasStarted.current = true;
      setPhase("message");
      setTimeout(() => setPhase("form"), 1200);
    }, 300);
  }, []);

  const onDown = useCallback(() => {
    if (phase !== "form") return;
    setPhase("holding");
    holdStart.current = Date.now();
    const tick = () => {
      const p = Math.min(1, (Date.now() - holdStart.current) / HOLD_MS);
      setHoldProg(p);
      if (p >= 1) {
        setPhase("confirming");
        setTimeout(() => setPhase("success"), 600);
        setTimeout(() => setPhase("receipt"), 1800);
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }, [phase]);

  const onUp = useCallback(() => {
    cancelAnimationFrame(raf.current);
    if (phase === "holding") {
      setHoldProg(0);
      setPhase("form");
    }
  }, [phase]);

  const showMessage = phase !== "idle";
  const showForm = ["form", "holding", "confirming", "success", "receipt", "forking", "parallel", "merging", "final"].includes(phase);
  const showSuccess = ["success", "receipt", "forking", "parallel", "merging", "final"].includes(phase);
  const showReceipt = ["receipt", "forking", "parallel", "merging", "final"].includes(phase);
  const formDone = ["confirming", "success", "receipt", "forking", "parallel", "merging", "final"].includes(phase);
  const receiptDone = ["forking", "parallel", "merging", "final"].includes(phase);
  const showFork = ["forking", "parallel", "merging", "final"].includes(phase);
  const showParallel = ["parallel", "merging", "final"].includes(phase);
  const showMerge = ["merging", "final"].includes(phase);
  const showFinal = phase === "final";

  return (
    <div className="flex flex-col items-center w-full h-full px-6 py-8 overflow-y-auto">
      <div className="w-full max-w-sm flex flex-col gap-4">
        <AnimatePresence>
          {showMessage && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="pl-5"
            >
              <p className="text-[13px] text-tertiary leading-relaxed">
                Please confirm you want to buy this chair from Zara Home:
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: formDone ? 0.45 : 1,
                y: 0,
                scale: formDone ? 0.98 : 1,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="rounded-2xl border border-black/[0.1] bg-primary p-5 flex flex-col gap-4"
              style={{
                boxShadow: "0 6px 32px -6px rgba(0,0,0,0.05), 0 2px 8px -2px rgba(0,0,0,0.02)",
                pointerEvents: formDone ? "none" : "auto",
              }}
            >
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-quaternary uppercase tracking-wider">
                    Card number
                  </label>
                  <div className="text-xs text-primary font-mono bg-surface-secondary rounded-lg px-2.5 py-1.5 border border-black/[0.08]">
                    4532 8720 1193 4467
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-[10px] text-quaternary uppercase tracking-wider">
                      Expiry
                    </label>
                    <div className="text-xs text-primary font-mono bg-surface-secondary rounded-lg px-2.5 py-1.5 border border-black/[0.08]">
                      09/28
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-[10px] text-quaternary uppercase tracking-wider">
                      CVV
                    </label>
                    <div className="text-xs text-primary font-mono bg-surface-secondary rounded-lg px-2.5 py-1.5 border border-black/[0.08] cursor-default">
                      817
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-quaternary uppercase tracking-wider">
                    Name on card
                  </label>
                  <div className="text-xs text-primary font-mono bg-surface-secondary rounded-lg px-2.5 py-1.5 border border-black/[0.08]">
                    Jane Cooper
                  </div>
                </div>
              </div>

              <div className="border-t border-black/[0.08] mt-2" />

              <div className="flex items-center justify-between pt-1">
                <div className="flex flex-col">
                  <span className="text-[10px] text-quaternary">Total</span>
                  <span className="text-sm font-semibold text-primary">
                    $249.00
                  </span>
                </div>

                <motion.button
                  onMouseDown={onDown}
                  onMouseUp={onUp}
                  onMouseLeave={onUp}
                  onTouchStart={onDown}
                  onTouchEnd={onUp}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="relative flex items-center justify-center rounded-full border border-black/10 bg-primary h-8 w-36 text-xs select-none cursor-pointer overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 rounded-full origin-left bg-emerald-500"
                    animate={{ scaleX: holdProg }}
                    transition={
                      holdProg === 0
                        ? { type: "spring", stiffness: 300, damping: 25 }
                        : { duration: 0 }
                    }
                  />
                  <span
                    className={`relative z-10 text-xs font-medium transition-colors duration-100 ${
                      holdProg > 0.35 ? "text-white" : "text-primary"
                    }`}
                  >
                    Hold to confirm
                  </span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex gap-2 items-center pl-5"
            >
              <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <CheckIcon className="w-2.5 h-2.5 text-white" />
              </div>
              <p className="text-[13px] text-tertiary leading-relaxed">
                Successfully purchased! Here is your receipt:
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showReceipt && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{
                opacity: receiptDone ? 0.45 : 1,
                y: 0,
                scale: receiptDone ? 0.98 : 1,
              }}
              transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}
              className="rounded-2xl border border-black/[0.1] bg-primary p-5 flex flex-col gap-3"
              style={{
                boxShadow: "0 6px 32px -6px rgba(0,0,0,0.05), 0 2px 8px -2px rgba(0,0,0,0.02)",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-quaternary uppercase tracking-wider">
                  Order confirmation
                </span>
                <span className="text-[10px] text-quaternary font-mono">
                  #ZH-29841
                </span>
              </div>
              <div className="border-t border-black/[0.08]" />
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-primary">
                    Linen Accent Chair
                  </span>
                  <span className="text-xs text-secondary font-mono">
                    $249.00
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-tertiary">Shipping</span>
                  <span className="text-xs text-tertiary font-mono">
                    Free
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-tertiary">Tax</span>
                  <span className="text-xs text-tertiary font-mono">
                    $20.42
                  </span>
                </div>
              </div>
              <div className="border-t border-black/[0.08]" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-primary">
                  Total
                </span>
                <span className="text-xs font-semibold text-primary font-mono">
                  $269.42
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-quaternary pt-1">
                <span>Visa ending 4467</span>
                <span>Est. delivery Mar 2-5</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showFork && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center gap-0 w-full"
            >
              <div className="flex items-start w-full relative">
                <svg
                  viewBox="0 0 360 32"
                  fill="none"
                  className="w-full h-8"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <line x1="180" y1="0" x2="180" y2="16" stroke="var(--border-secondary)" strokeWidth="1" />
                  <line x1="90" y1="16" x2="270" y2="16" stroke="var(--border-secondary)" strokeWidth="1" />
                  <line x1="90" y1="16" x2="90" y2="32" stroke="var(--border-secondary)" strokeWidth="1" />
                  <line x1="270" y1="16" x2="270" y2="32" stroke="var(--border-secondary)" strokeWidth="1" />
                </svg>
              </div>

              <div className="flex gap-3 w-full">
                <div className="flex-1 flex flex-col gap-0">
                  <div className="flex items-center gap-1.5 mb-2">
                    <FolderIcon className="w-3 h-3 text-quaternary" />
                    <span className="text-[9px] text-quaternary uppercase tracking-wider font-medium">File agent</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <AnimatePresence>
                      {showParallel && Array.from({ length: fileMessages }).map((_, i) => (
                        <motion.div
                          key={`file-${i}`}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="text-[11px] text-tertiary leading-snug"
                        >
                          {FILE_MESSAGES[i]}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {showParallel && fileLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <SpinnerDot />
                      </motion.div>
                    )}
                    {showParallel && fileMessages === FILE_MESSAGES.length && !fileLoading && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="flex items-center gap-1 mt-1"
                      >
                        <div className="w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center">
                          <CheckIcon className="w-2 h-2 text-white" />
                        </div>
                        <span className="text-[10px] text-quaternary">Done</span>
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="w-px bg-border-secondary flex-shrink-0" />

                <div className="flex-1 flex flex-col gap-0">
                  <div className="flex items-center gap-1.5 mb-2">
                    <CalendarIcon className="w-3 h-3 text-quaternary" />
                    <span className="text-[9px] text-quaternary uppercase tracking-wider font-medium">Calendar agent</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <AnimatePresence>
                      {showParallel && Array.from({ length: calMessages }).map((_, i) => (
                        <motion.div
                          key={`cal-${i}`}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="text-[11px] text-tertiary leading-snug"
                        >
                          {CAL_MESSAGES[i]}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {showParallel && calLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <SpinnerDot />
                      </motion.div>
                    )}
                    {showParallel && calMessages === CAL_MESSAGES.length && !calLoading && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="flex items-center gap-1 mt-1"
                      >
                        <div className="w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center">
                          <CheckIcon className="w-2 h-2 text-white" />
                        </div>
                        <span className="text-[10px] text-quaternary">Done</span>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>

              {showMerge && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="w-full mt-1"
                >
                  <svg
                    viewBox="0 0 360 32"
                    fill="none"
                    className="w-full h-8"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <line x1="90" y1="0" x2="90" y2="16" stroke="var(--border-secondary)" strokeWidth="1" />
                    <line x1="270" y1="0" x2="270" y2="16" stroke="var(--border-secondary)" strokeWidth="1" />
                    <line x1="90" y1="16" x2="270" y2="16" stroke="var(--border-secondary)" strokeWidth="1" />
                    <line x1="180" y1="16" x2="180" y2="32" stroke="var(--border-secondary)" strokeWidth="1" />
                  </svg>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showFinal && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="pl-5 flex flex-col gap-4"
            >
              <p className="text-[13px] text-tertiary leading-relaxed">
                All done. Your receipt is filed, and a delivery reminder has been added to your calendar. Is there anything else I can help you with?
              </p>
              <button
                onClick={reset}
                className="self-start rounded-full border border-black/10 bg-primary px-4 py-1.5 text-[11px] text-tertiary hover:text-secondary hover:bg-secondary transition-colors cursor-pointer"
              >
                Reset
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
