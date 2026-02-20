import { IconCalendar1 } from "central-icons/IconCalendar1";
import { IconCheckmark2Small } from "central-icons/IconCheckmark2Small";
import { IconFolder1 } from "central-icons/IconFolder1";
import { IconLoader } from "central-icons/IconLoader";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { TextShimmer } from "../text-shimmer";

const HOLD_MS = 1400;

type Phase =
  | "idle"
  | "message"
  | "form"
  | "holding"
  | "confirming"
  | "success"
  | "loading"
  | "receipt"
  | "forking"
  | "parallel"
  | "merging"
  | "final";

const FILE_MESSAGES = [
  "Downloading receipt.pdf...",
  "Saved to ~/Documents/",
  "Updated February expense tracker",
  "Linked to order #ZH-29841 in records",
];

const CAL_MESSAGES = [
  "Creating delivery window event...",
  "Set for March 2-5, 2026",
  "Attached order details to event",
  "Sent reminder to jane@cooper.com",
  "Added 15-min prep reminder for Mar 2",
];

export const AgentWorkflow = () => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [holdProg, setHoldProg] = useState(0);
  const holdStart = useRef(0);
  const raf = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [fileStep, setFileStep] = useState(0);
  const [calStep, setCalStep] = useState(0);
  const [fileDone, setFileDone] = useState(false);
  const [calDone, setCalDone] = useState(false);

  const [splitPct, setSplitPct] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const onSeparatorDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onSeparatorMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setSplitPct(Math.min(70, Math.max(30, pct)));
  }, []);

  const onSeparatorUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, []);

  const abortableDelay = useCallback(async (ms: number, signal: AbortSignal) => {
    await new Promise<void>((resolve, reject) => {
      const t = setTimeout(resolve, ms);
      signal.addEventListener("abort", () => {
        clearTimeout(t);
        reject(new DOMException("Aborted", "AbortError"));
      });
    });
  }, []);

  const runParallelAgents = useCallback(
    async (signal: AbortSignal) => {
      const fileDelays = [500, 1600, 2800, 3800];
      const calDelays = [700, 2000, 3200, 4600, 5800];

      const runFile = async () => {
        for (let i = 0; i < fileDelays.length; i++) {
          await abortableDelay(i === 0 ? fileDelays[0] : fileDelays[i] - fileDelays[i - 1], signal);
          setFileStep(i + 1);
          scrollToBottom();
        }
        await abortableDelay(500, signal);
        setFileDone(true);
        scrollToBottom();
      };

      const runCal = async () => {
        for (let i = 0; i < calDelays.length; i++) {
          await abortableDelay(i === 0 ? calDelays[0] : calDelays[i] - calDelays[i - 1], signal);
          setCalStep(i + 1);
          scrollToBottom();
        }
        await abortableDelay(500, signal);
        setCalDone(true);
        scrollToBottom();
      };

      await Promise.all([runFile(), runCal()]);
    },
    [abortableDelay, scrollToBottom],
  );

  const runSequence = useCallback(
    async (signal: AbortSignal) => {
      try {
        await abortableDelay(400, signal);
        setPhase("message");
        scrollToBottom();

        await abortableDelay(1200, signal);
        setPhase("form");
        scrollToBottom();
      } catch {
        /* aborted */
      }
    },
    [abortableDelay, scrollToBottom],
  );

  const runPostConfirm = useCallback(
    async (signal: AbortSignal) => {
      try {
        setPhase("confirming");
        scrollToBottom();

        await abortableDelay(600, signal);
        setPhase("success");
        scrollToBottom();

        await abortableDelay(1200, signal);
        setPhase("loading");
        scrollToBottom();

        await abortableDelay(2000, signal);
        setPhase("receipt");
        scrollToBottom();

        await abortableDelay(1400, signal);
        setPhase("forking");
        scrollToBottom();

        await abortableDelay(600, signal);
        setPhase("parallel");
        scrollToBottom();

        await runParallelAgents(signal);

        await abortableDelay(600, signal);
        setPhase("merging");
        scrollToBottom();

        await abortableDelay(800, signal);
        setPhase("final");
        scrollToBottom();
      } catch {
        /* aborted */
      }
    },
    [abortableDelay, scrollToBottom, runParallelAgents],
  );

  const startSequence = useCallback(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    runSequence(controller.signal);
  }, [runSequence]);

  // Auto-start on mount
  const hasStarted = useRef(false);
  if (!hasStarted.current) {
    hasStarted.current = true;
    // Schedule start after first render
    queueMicrotask(() => startSequence());
  }

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setPhase("idle");
    setHoldProg(0);
    setFileStep(0);
    setCalStep(0);
    setFileDone(false);
    setCalDone(false);
    setSplitPct(50);
    hasStarted.current = false;

    const controller = new AbortController();
    abortRef.current = controller;
    setTimeout(() => {
      hasStarted.current = true;
      runSequence(controller.signal);
    }, 300);
  }, [runSequence]);

  const onDown = useCallback(() => {
    if (phase !== "form") return;
    setPhase("holding");
    holdStart.current = Date.now();
    const tick = () => {
      const p = Math.min(1, (Date.now() - holdStart.current) / HOLD_MS);
      setHoldProg(p);
      if (p >= 1) {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        runPostConfirm(controller.signal);
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }, [phase, runPostConfirm]);

  const onUp = useCallback(() => {
    cancelAnimationFrame(raf.current);
    if (phase === "holding") {
      setHoldProg(0);
      setPhase("form");
    }
  }, [phase]);

  const showMessage = phase !== "idle";
  const showForm = phase !== "idle" && phase !== "message";
  const showLoading = phase === "loading";
  const showReceipt = !["idle", "message", "form", "holding", "confirming", "success", "loading"].includes(phase);
  const showSuccess = showReceipt;
  const formDone = !["idle", "message", "form", "holding"].includes(phase);
  const showFork = !["idle", "message", "form", "holding", "confirming", "success", "loading", "receipt"].includes(
    phase,
  );
  const showParallel = ![
    "idle",
    "message",
    "form",
    "holding",
    "confirming",
    "success",
    "loading",
    "receipt",
    "forking",
  ].includes(phase);
  const showFinal = phase === "final";

  return (
    <div
      ref={scrollRef}
      className="flex flex-col items-center w-full h-full px-6 py-8 overflow-y-auto"
      style={{ maxHeight: "100%" }}
    >
      <div className="w-full max-w-md flex flex-col gap-4 items-center">
        <AnimatePresence>
          {showMessage && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="pl-5 w-full max-w-sm"
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
              className="rounded-2xl border border-primary bg-primary p-5 flex flex-col gap-4 w-full max-w-sm shadow-sm"
              style={{
                pointerEvents: formDone ? "none" : "auto",
              }}
            >
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-quaternary uppercase tracking-wider">Card number</label>
                  <div className="text-xs text-primary font-mono bg-surface-secondary rounded-lg px-2.5 py-1.5 border border-primary">
                    4532 8720 1193 4467
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-[10px] text-quaternary uppercase tracking-wider">Expiry</label>
                    <div className="text-xs text-primary font-mono bg-surface-secondary rounded-lg px-2.5 py-1.5 border border-primary">
                      09/28
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-[10px] text-quaternary uppercase tracking-wider">CVV</label>
                    <div className="text-xs text-primary font-mono bg-surface-secondary rounded-lg px-2.5 py-1.5 border border-primary">
                      817
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-quaternary uppercase tracking-wider">Name on card</label>
                  <div className="text-xs text-primary font-mono bg-surface-secondary rounded-lg px-2.5 py-1.5 border border-primary">
                    Jane Cooper
                  </div>
                </div>
              </div>

              <div className="border-t border-primary mt-2" />

              <div className="flex items-center justify-between pt-1">
                <div className="flex flex-col">
                  <span className="text-[10px] text-quaternary">Total</span>
                  <span className="text-sm font-semibold text-primary">$249.00</span>
                </div>

                <motion.button
                  onMouseDown={onDown}
                  onMouseUp={onUp}
                  onMouseLeave={onUp}
                  onTouchStart={onDown}
                  onTouchEnd={onUp}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="relative flex items-center justify-center rounded-full -outline-offset-1 outline outline-primary bg-primary h-8 w-28 text-xs select-none cursor-pointer overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 rounded-full origin-left bg-success"
                    animate={{ scaleX: holdProg }}
                    transition={holdProg === 0 ? { type: "spring", stiffness: 300, damping: 25 } : { duration: 0 }}
                  />
                  <span className="relative z-10 flex items-center justify-center w-full h-full">
                    <AnimatePresence mode="wait">
                      {holdProg < 0.35 ? (
                        <motion.span
                          key="hold"
                          initial={{ opacity: 1, filter: "blur(0px)" }}
                          exit={{ opacity: 0, filter: "blur(4px)" }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="text-xs font-medium text-primary"
                        >
                          Hold to confirm
                        </motion.span>
                      ) : (
                        <motion.span
                          key="confirmed"
                          initial={{ opacity: 0, filter: "blur(4px)" }}
                          animate={{ opacity: 1, filter: "blur(0px)" }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="text-xs font-medium text-white"
                        >
                          Confirmed
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {showLoading && !showReceipt && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="flex items-center gap-3 pl-5 w-full max-w-sm"
            >
              <IconLoader className="w-4 h-4 text-tertiary animate-spin" />
              <TextShimmer className="text-[13px]" duration={1.5}>
                Processing payment...
              </TextShimmer>
            </motion.div>
          )}
          {showReceipt && (
            <motion.div
              key="receipt-group"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex flex-col gap-4 w-full items-center"
            >
              <div className="flex gap-2 items-center pl-5 w-full max-w-sm">
                <div className="w-4 h-4 rounded-full bg-success flex items-center justify-center flex-shrink-0">
                  <IconCheckmark2Small className="w-2.5 h-2.5 text-white" />
                </div>
                <p className="text-[13px] text-tertiary leading-relaxed">
                  Successfully purchased! Here is your receipt:
                </p>
              </div>
              <div className="rounded-2xl border border-primary bg-primary p-5 flex flex-col gap-3 w-full max-w-sm shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-quaternary uppercase tracking-wider">Order confirmation</span>
                  <span className="text-[10px] text-quaternary font-mono">#ZH-29841</span>
                </div>
                <div className="border-t border-primary" />
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-primary">Linen Accent Chair</span>
                    <span className="text-xs text-secondary font-mono">$249.00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-tertiary">Shipping</span>
                    <span className="text-xs text-tertiary font-mono">Free</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-tertiary">Tax</span>
                    <span className="text-xs text-tertiary font-mono">$20.42</span>
                  </div>
                </div>
                <div className="border-t border-primary" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary">Total</span>
                  <span className="text-xs font-semibold text-primary font-mono">$269.42</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-quaternary pt-1">
                  <span>Visa ending 4467</span>
                  <span>Est. delivery Mar 2-5</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showFork && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="pl-5 w-full max-w-sm"
            >
              <p className="text-[13px] text-tertiary leading-relaxed">Orchestrating 2 sub-agents...</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showFork && (
            <motion.div
              ref={containerRef}
              layout
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              transition={{
                layout: { duration: 0.3, ease: "easeOut" },
                height: { duration: 0.4, ease: "easeOut" },
                opacity: { duration: 0.3, delay: 0.1 },
              }}
              className="w-full overflow-hidden"
            >
              <motion.div layout="position">
                <div className="flex w-full">
                  <div
                    className="flex flex-col gap-2.5 overflow-hidden bg-tertiary p-4 rounded-r-lg rounded-2xl"
                    style={{ width: `${splitPct}%` }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full border border-primary bg-primary pl-1.5 pr-2 py-0.5 shadow-sm">
                        <IconFolder1 className="w-2.5 h-2.5 text-tertiary" />
                        <span className="text-[10px] text-secondary font-medium">File agent</span>
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 pr-3">
                      <AnimatePresence>
                        {showParallel &&
                          Array.from({ length: fileStep }).map((_, i) => {
                            const isLatest = i === fileStep - 1 && !fileDone;
                            return (
                              <motion.div
                                key={`file-${i}`}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                              >
                                {isLatest ? (
                                  <TextShimmer className="text-[13px] leading-relaxed" duration={1.5}>
                                    {FILE_MESSAGES[i]}
                                  </TextShimmer>
                                ) : (
                                  <p className="text-[13px] text-tertiary leading-relaxed">{FILE_MESSAGES[i]}</p>
                                )}
                              </motion.div>
                            );
                          })}
                      </AnimatePresence>
                      {fileDone && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className="flex items-center gap-1.5 pt-0.5"
                        >
                          <div className="w-3.5 h-3.5 rounded-full bg-success flex items-center justify-center">
                            <IconCheckmark2Small className="w-2.5 h-2.5 text-white" />
                          </div>
                          <span className="text-[11px] text-tertiary">Done</span>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <div
                    className="w-3 shrink-0 group flex items-center justify-center cursor-col-resize group select-none touch-none"
                    onPointerDown={onSeparatorDown}
                    onPointerMove={onSeparatorMove}
                    onPointerUp={onSeparatorUp}
                    onPointerCancel={onSeparatorUp}
                  >
                    <div className="w-1 h-4 rounded-full transition-all group-hover:h-5 group-active:h-7 bg-quaternary group-hover:bg-interactive-active" />
                  </div>

                  <div className="flex-1 flex flex-col gap-2.5 overflow-hidden min-w-0 bg-tertiary p-4 rounded-2xl rounded-l-lg">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full border border-primary bg-primary pl-1.5 pr-2 py-0.5 shadow-sm">
                        <IconCalendar1 className="w-2.5 h-2.5 text-tertiary" />
                        <span className="text-[10px] text-secondary font-medium">Calendar agent</span>
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 pl-3">
                      <AnimatePresence>
                        {showParallel &&
                          Array.from({ length: calStep }).map((_, i) => {
                            const isLatest = i === calStep - 1 && !calDone;
                            return (
                              <motion.div
                                key={`cal-${i}`}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                              >
                                {isLatest ? (
                                  <TextShimmer className="text-[13px] leading-relaxed" duration={1.5}>
                                    {CAL_MESSAGES[i]}
                                  </TextShimmer>
                                ) : (
                                  <p className="text-[13px] text-tertiary leading-relaxed">{CAL_MESSAGES[i]}</p>
                                )}
                              </motion.div>
                            );
                          })}
                      </AnimatePresence>
                      {calDone && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className="flex items-center gap-1.5 pt-0.5"
                        >
                          <div className="w-3.5 h-3.5 rounded-full bg-success flex items-center justify-center">
                            <IconCheckmark2Small className="w-2.5 h-2.5 text-white" />
                          </div>
                          <span className="text-[11px] text-tertiary">Done</span>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showFinal && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="pl-5 flex flex-col gap-3 pb-4 w-full max-w-sm"
            >
              <p className="text-[13px] text-tertiary leading-relaxed">
                Everything is properly done. Your receipt has been filed and a delivery reminder is on your calendar.
                What would you like to do next?
              </p>
              <button
                onClick={reset}
                className="self-start rounded-full border border-primary bg-primary px-4 py-1.5 text-[11px] text-tertiary hover:text-secondary hover:bg-secondary transition-colors cursor-pointer"
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
