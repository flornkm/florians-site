import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useMotionValue, animate } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

const X = 24;
const ROW_H = 52;
const DOT_R = 5;
const STROKE_W = 1.5;
const Y_START = 32;

function nodeY(i: number): number {
  return Y_START + i * ROW_H;
}

interface Step {
  id: string;
  label: string;
  sublabel?: string;
  agent: "main" | "sub";
}

const STEPS: Step[] = [
  { id: "s0", label: "Initialize task", agent: "main" },
  { id: "s1", label: "Parse request", agent: "main" },
  { id: "s2", label: "Plan execution", agent: "main" },
  { id: "s3", label: "Memory recall", sublabel: "Loading context + history", agent: "sub" },
  { id: "s4", label: "Web research", sublabel: "Searching + validating sources", agent: "sub" },
  { id: "s5", label: "Deep thinking", sublabel: "Analyzing tradeoffs", agent: "sub" },
  { id: "s6", label: "Merge results", agent: "main" },
  { id: "s7", label: "Compose response", agent: "main" },
  { id: "s8", label: "Deliver output", agent: "main" },
];

const HOLD_STEP_INDEX = 7;
const HOLD_DURATION = 1200;
const STEP_DELAY = 700;
const VIEWPORT_H = 380;
const CANVAS_W = 280;
const CANVAS_H = nodeY(STEPS.length) + 20;

export const AgentWorkflow = () => {
  const [playing, setPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [waiting, setWaiting] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [holdComplete, setHoldComplete] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(true);
  const [key, setKey] = useState(0);

  const scrollY = useMotionValue(0);
  const holdStartRef = useRef<number>(0);
  const holdRafRef = useRef<number>(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const trigger = useCallback(() => {
    setButtonVisible(false);
    setTimeout(() => {
      setActiveStep(-1);
      setWaiting(false);
      setHoldProgress(0);
      setHoldComplete(false);
      setPlaying(false);
      setKey((k) => k + 1);
      requestAnimationFrame(() => {
        setPlaying(true);
      });
    }, 200);
  }, []);

  useEffect(() => {
    if (!playing) {
      scrollY.set(0);
      return;
    }

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    timeoutsRef.current = timeouts;

    for (let s = 0; s < STEPS.length; s++) {
      if (s >= HOLD_STEP_INDEX) break;

      const t = setTimeout(() => {
        setActiveStep(s);
        const targetScroll = Math.max(0, nodeY(s) - VIEWPORT_H + 140);
        animate(scrollY, -targetScroll, { duration: 0.4, ease: "easeInOut" });

        if (s === HOLD_STEP_INDEX - 1) {
          setTimeout(() => setWaiting(true), 400);
        }
      }, s * STEP_DELAY + 100);
      timeouts.push(t);
    }

    return () => timeouts.forEach(clearTimeout);
  }, [playing, key, scrollY]);

  const continueAfterHold = useCallback(() => {
    setHoldComplete(true);
    setWaiting(false);

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    for (let s = HOLD_STEP_INDEX; s < STEPS.length; s++) {
      const delay = (s - HOLD_STEP_INDEX) * STEP_DELAY + 300;
      const t = setTimeout(() => {
        setActiveStep(s);
        const targetScroll = Math.max(0, nodeY(s) - VIEWPORT_H + 140);
        animate(scrollY, -targetScroll, { duration: 0.4, ease: "easeInOut" });
      }, delay);
      timeouts.push(t);
    }

    const resetT = setTimeout(() => {
      setButtonVisible(true);
    }, (STEPS.length - HOLD_STEP_INDEX) * STEP_DELAY + 800);
    timeouts.push(resetT);

    timeoutsRef.current = timeouts;
    return () => timeouts.forEach(clearTimeout);
  }, [scrollY]);

  const onHoldStart = useCallback(() => {
    if (!waiting || holdComplete) return;
    holdStartRef.current = Date.now();

    const tick = () => {
      const elapsed = Date.now() - holdStartRef.current;
      const p = Math.min(1, elapsed / HOLD_DURATION);
      setHoldProgress(p);
      if (p >= 1) {
        continueAfterHold();
        return;
      }
      holdRafRef.current = requestAnimationFrame(tick);
    };
    holdRafRef.current = requestAnimationFrame(tick);
  }, [waiting, holdComplete, continueAfterHold]);

  const onHoldEnd = useCallback(() => {
    cancelAnimationFrame(holdRafRef.current);
    if (holdProgress < 1) {
      setHoldProgress(0);
    }
  }, [holdProgress]);

  return (
    <div className="flex flex-col items-start gap-5 w-full h-full px-8 py-6">
      <AnimatePresence>
        {buttonVisible && (
          <motion.button
            onClick={trigger}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="rounded-full border border-secondary bg-primary px-5 py-2 text-sm font-medium text-primary shadow-sm transition-colors hover:bg-secondary"
          >
            Trigger
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {playing && (
          <motion.div
            key={key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full overflow-hidden relative"
            style={{ height: VIEWPORT_H }}
          >
            <motion.div style={{ y: scrollY }}>
              <svg
                width={CANVAS_W}
                height={CANVAS_H}
                viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
                className="overflow-visible"
              >
                {STEPS.map((step, i) => {
                  if (i === 0) return null;
                  const visible = activeStep >= i;
                  const y1 = nodeY(i - 1);
                  const y2 = nodeY(i);

                  return (
                    <motion.line
                      key={`line-${key}-${i}`}
                      x1={X}
                      y1={y1}
                      x2={X}
                      y2={y2}
                      stroke="var(--border-secondary)"
                      strokeWidth={STROKE_W}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={
                        visible
                          ? { pathLength: 1, opacity: 1 }
                          : { pathLength: 0, opacity: 0 }
                      }
                      transition={{ duration: 0.35, ease: "easeOut" }}
                    />
                  );
                })}

                {STEPS.map((step, i) => {
                  const isActive = activeStep === i;
                  const isComplete = activeStep > i;
                  const isVisible = activeStep >= i;
                  const y = nodeY(i);
                  const isMain = step.agent === "main";

                  return (
                    <g key={`node-${key}-${step.id}`}>
                      <motion.circle
                        cx={X}
                        cy={y}
                        r={DOT_R}
                        fill={isVisible ? (isMain ? "var(--text-primary)" : "var(--text-tertiary)") : "transparent"}
                        stroke="var(--bg-primary)"
                        strokeWidth={2}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={
                          isVisible
                            ? { scale: 1, opacity: 1 }
                            : { scale: 0, opacity: 0 }
                        }
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      />

                      <motion.text
                        x={X + 18}
                        y={y + 1}
                        textAnchor="start"
                        dominantBaseline="middle"
                        fill="currentColor"
                        className={cn(
                          "text-[11px] font-medium",
                          isMain ? "text-primary" : "text-tertiary",
                        )}
                        initial={{ opacity: 0, x: X + 12 }}
                        animate={
                          isVisible
                            ? { opacity: isActive ? 1 : 0.5, x: X + 18 }
                            : { opacity: 0, x: X + 12 }
                        }
                        transition={{ duration: 0.25 }}
                      >
                        {step.label}
                      </motion.text>

                      {step.sublabel && (
                        <motion.text
                          x={X + 18}
                          y={y + 14}
                          textAnchor="start"
                          dominantBaseline="middle"
                          fill="currentColor"
                          className="text-[9px] text-quaternary"
                          initial={{ opacity: 0 }}
                          animate={
                            isVisible
                              ? { opacity: isActive ? 0.5 : 0.25 }
                              : { opacity: 0 }
                          }
                          transition={{ duration: 0.25 }}
                        >
                          {step.sublabel}
                        </motion.text>
                      )}

                      {isActive && !waiting && !holdComplete && i < STEPS.length - 1 && (
                        <motion.circle
                          cx={X}
                          cy={y}
                          r={DOT_R + 4}
                          fill="none"
                          stroke={isMain ? "var(--text-primary)" : "var(--text-tertiary)"}
                          strokeWidth={0.5}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 0.4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        />
                      )}
                    </g>
                  );
                })}
              </svg>

              <AnimatePresence>
                {waiting && !holdComplete && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.25 }}
                    className="absolute"
                    style={{
                      left: X + 18,
                      top: nodeY(HOLD_STEP_INDEX - 1) + 28,
                    }}
                  >
                    <button
                      onMouseDown={onHoldStart}
                      onMouseUp={onHoldEnd}
                      onMouseLeave={onHoldEnd}
                      onTouchStart={onHoldStart}
                      onTouchEnd={onHoldEnd}
                      className="relative flex items-center gap-2 rounded-full border border-secondary bg-primary pl-3 pr-4 py-1.5 text-[11px] font-medium text-secondary shadow-sm select-none cursor-pointer overflow-hidden"
                    >
                      <div
                        className="absolute inset-0 bg-tertiary origin-left rounded-full"
                        style={{
                          transform: `scaleX(${holdProgress})`,
                          opacity: 0.08,
                          transition: holdProgress === 0 ? "transform 0.15s ease-out" : "none",
                        }}
                      />
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="relative z-10">
                        <circle
                          cx="7"
                          cy="7"
                          r="5.5"
                          stroke="currentColor"
                          strokeWidth="1"
                          strokeDasharray={`${Math.PI * 11}`}
                          strokeDashoffset={`${Math.PI * 11 * (1 - holdProgress)}`}
                          strokeLinecap="round"
                          className="text-tertiary"
                          style={{
                            transition: holdProgress === 0 ? "stroke-dashoffset 0.15s ease-out" : "none",
                            transform: "rotate(-90deg)",
                            transformOrigin: "center",
                          }}
                        />
                      </svg>
                      <span className="relative z-10">Hold to confirm</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
