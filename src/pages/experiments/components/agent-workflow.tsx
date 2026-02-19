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

export const AgentWorkflow = () => {
  const [phase, setPhase] = useState<
    "idle" | "message" | "form" | "holding" | "confirming" | "success" | "receipt"
  >("idle");
  const [holdProg, setHoldProg] = useState(0);
  const holdStart = useRef(0);
  const raf = useRef(0);
  const hasStarted = useRef(false);

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

  const reset = useCallback(() => {
    setPhase("idle");
    setHoldProg(0);
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
  const showForm =
    phase === "form" ||
    phase === "holding" ||
    phase === "confirming" ||
    phase === "success" ||
    phase === "receipt";
  const showSuccess = phase === "success" || phase === "receipt";
  const showReceipt = phase === "receipt";
  const formDone = phase === "confirming" || phase === "success" || phase === "receipt";

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
              transition={{
                duration: 0.4,
                ease: "easeOut",
              }}
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
              animate={{ opacity: 1, y: 0 }}
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

              <div className="pt-2">
                <button
                  onClick={reset}
                  className="rounded-full border border-black/10 bg-primary px-4 py-1 text-[10px] text-tertiary hover:text-secondary hover:bg-secondary transition-colors cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
