import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";

interface Step {
  label: string;
  sub?: boolean;
}

const STEPS: Step[] = [
  { label: "Initialize task" },
  { label: "Parse request" },
  { label: "Plan execution" },
  { label: "Memory recall", sub: true },
  { label: "Web research", sub: true },
  { label: "Deep thinking", sub: true },
  { label: "Merge results" },
  { label: "Compose response" },
  { label: "Deliver output" },
];

const HOLD_INDEX = 7;
const HOLD_MS = 1200;
const STEP_MS = 600;

export const AgentWorkflow = () => {
  const [active, setActive] = useState(-1);
  const [showBtn, setShowBtn] = useState(true);
  const [waiting, setWaiting] = useState(false);
  const [holdDone, setHoldDone] = useState(false);
  const [holdProg, setHoldProg] = useState(0);
  const [started, setStarted] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const holdStart = useRef(0);
  const raf = useRef(0);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    cancelAnimationFrame(raf.current);
  };

  const trigger = useCallback(() => {
    clear();
    setShowBtn(false);
    setActive(-1);
    setWaiting(false);
    setHoldDone(false);
    setHoldProg(0);
    setRunKey((k) => k + 1);

    setTimeout(() => {
      setStarted(true);
      for (let i = 0; i < STEPS.length; i++) {
        if (i >= HOLD_INDEX) break;
        const t = setTimeout(() => {
          setActive(i);
          if (i === HOLD_INDEX - 1) {
            setTimeout(() => setWaiting(true), 350);
          }
        }, i * STEP_MS + 80);
        timers.current.push(t);
      }
    }, 250);
  }, []);

  const afterHold = useCallback(() => {
    setHoldDone(true);
    setWaiting(false);
    for (let i = HOLD_INDEX; i < STEPS.length; i++) {
      const t = setTimeout(() => {
        setActive(i);
        if (i === STEPS.length - 1) {
          setTimeout(() => {
            setShowBtn(true);
            setStarted(false);
          }, 800);
        }
      }, (i - HOLD_INDEX) * STEP_MS + 200);
      timers.current.push(t);
    }
  }, []);

  const onDown = useCallback(() => {
    if (!waiting || holdDone) return;
    holdStart.current = Date.now();
    const tick = () => {
      const p = Math.min(1, (Date.now() - holdStart.current) / HOLD_MS);
      setHoldProg(p);
      if (p >= 1) {
        afterHold();
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }, [waiting, holdDone, afterHold]);

  const onUp = useCallback(() => {
    cancelAnimationFrame(raf.current);
    if (holdProg < 1) setHoldProg(0);
  }, [holdProg]);

  return (
    <div className="flex flex-col items-start w-full h-full px-8 py-6 gap-4">
      <AnimatePresence>
        {showBtn && (
          <motion.button
            onClick={trigger}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="rounded-full border border-secondary bg-primary px-5 py-1.5 text-xs font-medium text-primary shadow-sm hover:bg-secondary transition-colors"
          >
            Trigger
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {started && (
          <motion.div
            key={runKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="relative pl-4"
          >
            <div className="absolute left-[5px] top-[6px] bottom-[6px] w-px bg-border-secondary" />

            <div className="flex flex-col gap-0">
              {STEPS.map((step, i) => {
                const visible = active >= i;
                const isCurrent = active === i;

                return (
                  <div key={`${runKey}-${i}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={
                        visible
                          ? { opacity: 1, y: 0 }
                          : { opacity: 0, y: 4 }
                      }
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="flex items-center gap-3 relative"
                      style={{ height: 32 }}
                    >
                      <div
                        className="absolute -left-4 w-[11px] h-[11px] rounded-full border-[2px] border-bg-primary flex-shrink-0"
                        style={{
                          backgroundColor: visible
                            ? step.sub
                              ? "var(--text-quaternary)"
                              : "var(--text-primary)"
                            : "transparent",
                          borderColor: "var(--bg-primary)",
                          boxShadow: visible ? "0 0 0 1px var(--border-secondary)" : "none",
                        }}
                      />
                      <span
                        className="text-xs select-none transition-opacity duration-200"
                        style={{
                          color: step.sub
                            ? "var(--text-tertiary)"
                            : "var(--text-primary)",
                          opacity: isCurrent ? 1 : visible ? 0.45 : 0,
                          fontWeight: step.sub ? 400 : 500,
                        }}
                      >
                        {step.label}
                      </span>
                    </motion.div>

                    {i === HOLD_INDEX - 1 && (
                      <AnimatePresence>
                        {waiting && !holdDone && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="py-2 pl-1">
                              <button
                                onMouseDown={onDown}
                                onMouseUp={onUp}
                                onMouseLeave={onUp}
                                onTouchStart={onDown}
                                onTouchEnd={onUp}
                                className="relative flex items-center gap-1.5 rounded-full border border-secondary bg-primary px-3 py-1 text-[10px] text-tertiary select-none cursor-pointer overflow-hidden"
                              >
                                <div
                                  className="absolute inset-0 bg-fill-secondary rounded-full origin-left"
                                  style={{
                                    transform: `scaleX(${holdProg})`,
                                    transition:
                                      holdProg === 0
                                        ? "transform 0.12s ease-out"
                                        : "none",
                                  }}
                                />
                                <svg
                                  width="10"
                                  height="10"
                                  viewBox="0 0 10 10"
                                  className="relative z-10"
                                >
                                  <circle
                                    cx="5"
                                    cy="5"
                                    r="3.5"
                                    fill="none"
                                    stroke="var(--border-secondary)"
                                    strokeWidth="1"
                                  />
                                  <circle
                                    cx="5"
                                    cy="5"
                                    r="3.5"
                                    fill="none"
                                    stroke="var(--text-tertiary)"
                                    strokeWidth="1"
                                    strokeDasharray={`${Math.PI * 7}`}
                                    strokeDashoffset={`${Math.PI * 7 * (1 - holdProg)}`}
                                    strokeLinecap="round"
                                    style={{
                                      transition:
                                        holdProg === 0
                                          ? "stroke-dashoffset 0.12s ease-out"
                                          : "none",
                                      transform: "rotate(-90deg)",
                                      transformOrigin: "center",
                                    }}
                                  />
                                </svg>
                                <span className="relative z-10">
                                  Hold to confirm
                                </span>
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
