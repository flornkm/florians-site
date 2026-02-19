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

const CreditCardFront = () => (
  <div className="w-full h-full rounded-lg bg-gradient-to-br from-[#1c1c1e] to-[#2c2c2e] p-2.5 flex flex-col justify-between text-white">
    <div className="flex items-center justify-between">
      <div className="w-5 h-3.5 rounded-[3px] bg-gradient-to-br from-[#d4a944] to-[#c49a38] opacity-80" />
      <svg viewBox="0 0 24 16" className="w-5 h-3.5 opacity-40">
        <circle cx="8" cy="8" r="7" fill="#eb001b" opacity="0.8" />
        <circle cx="16" cy="8" r="7" fill="#f79e1b" opacity="0.8" />
      </svg>
    </div>
    <div className="space-y-1">
      <p className="text-[7px] tracking-[0.18em] opacity-35 font-mono">
        4532 8720 1193 4467
      </p>
      <div className="flex items-center justify-between">
        <p className="text-[6px] tracking-wider opacity-30 font-mono uppercase">
          Jane Cooper
        </p>
        <p className="text-[6px] opacity-30 font-mono">09/28</p>
      </div>
    </div>
  </div>
);

const CreditCardBack = () => (
  <div className="w-full h-full rounded-lg bg-gradient-to-br from-[#1c1c1e] to-[#2c2c2e] flex flex-col justify-between overflow-hidden">
    <div className="w-full h-4 bg-[#2a2a2a] mt-2.5" />
    <div className="px-2.5 pb-2.5 space-y-1">
      <div className="flex items-center gap-1.5">
        <div className="flex-1 h-3.5 bg-[#2a2a2a] rounded-sm" />
        <p className="text-[7px] text-white opacity-40 font-mono">817</p>
      </div>
      <p className="text-[5px] text-white opacity-20 font-mono">
        Authorized signature
      </p>
    </div>
  </div>
);

const MiniCreditCard = ({ flipped }: { flipped: boolean }) => (
  <motion.div
    className="w-[100px] h-[64px]"
    style={{ perspective: "400px" }}
    animate={{ rotate: flipped ? -2 : 1 }}
    transition={{ type: "spring", stiffness: 200, damping: 20 }}
  >
    <motion.div
      animate={{ rotateY: flipped ? 180 : 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative w-full h-full"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div
        className="absolute inset-0"
        style={{ backfaceVisibility: "hidden" }}
      >
        <CreditCardFront />
      </div>
      <div
        className="absolute inset-0"
        style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
      >
        <CreditCardBack />
      </div>
    </motion.div>
  </motion.div>
);

export const AgentWorkflow = () => {
  const [phase, setPhase] = useState<
    "idle" | "message" | "form" | "holding" | "confirming" | "success" | "receipt"
  >("idle");
  const [holdProg, setHoldProg] = useState(0);
  const [cvvFocused, setCvvFocused] = useState(false);
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
    setCvvFocused(false);
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
              className="rounded-xl border border-secondary bg-primary p-4 flex flex-col gap-4"
              style={{
                boxShadow: "0 4px 24px -4px rgba(0,0,0,0.06), 0 1px 4px -1px rgba(0,0,0,0.03)",
                pointerEvents: formDone ? "none" : "auto",
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-3 flex-1">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-quaternary uppercase tracking-wider">
                      Card number
                    </label>
                    <div className="text-xs text-primary font-mono bg-surface-secondary rounded-md px-2.5 py-1.5 border border-secondary">
                      4532 8720 1193 4467
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex flex-col gap-1 flex-1">
                      <label className="text-[10px] text-quaternary uppercase tracking-wider">
                        Expiry
                      </label>
                      <div className="text-xs text-primary font-mono bg-surface-secondary rounded-md px-2.5 py-1.5 border border-secondary">
                        09/28
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                      <label className="text-[10px] text-quaternary uppercase tracking-wider">
                        CVV
                      </label>
                      <div
                        onMouseEnter={() => setCvvFocused(true)}
                        onMouseLeave={() => setCvvFocused(false)}
                        className="text-xs text-primary font-mono bg-surface-secondary rounded-md px-2.5 py-1.5 border border-secondary cursor-default"
                      >
                        817
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-quaternary uppercase tracking-wider">
                      Name on card
                    </label>
                    <div className="text-xs text-primary font-mono bg-surface-secondary rounded-md px-2.5 py-1.5 border border-secondary">
                      Jane Cooper
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0 pt-1">
                  <MiniCreditCard flipped={cvvFocused} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-secondary">
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
                    className="relative z-10 text-xs font-medium transition-colors duration-200"
                    style={{
                      color:
                        holdProg > 0.45
                          ? "#ffffff"
                          : "var(--text-secondary)",
                    }}
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
              className="flex gap-2 items-center"
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
              className="rounded-xl border border-secondary bg-primary p-4 flex flex-col gap-3"
              style={{
                boxShadow: "0 4px 24px -4px rgba(0,0,0,0.06), 0 1px 4px -1px rgba(0,0,0,0.03)",
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
              <div className="border-t border-secondary" />
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
              <div className="border-t border-secondary" />
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
