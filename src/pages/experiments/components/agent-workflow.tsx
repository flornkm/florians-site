import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";

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
  <div className="w-full h-full rounded-lg bg-[#1a1a1a] p-3 flex flex-col justify-between text-white">
    <div className="flex items-center justify-between">
      <div className="w-6 h-4 rounded-sm bg-[#c4a44a]" />
      <svg viewBox="0 0 24 16" className="w-6 h-4 opacity-60">
        <circle cx="8" cy="8" r="7" fill="#eb001b" opacity="0.8" />
        <circle cx="16" cy="8" r="7" fill="#f79e1b" opacity="0.8" />
      </svg>
    </div>
    <div className="space-y-1.5">
      <p className="text-[8px] tracking-[0.2em] opacity-50 font-mono">
        4532 8720 1193 4467
      </p>
      <div className="flex items-center justify-between">
        <p className="text-[7px] tracking-wider opacity-40 font-mono uppercase">
          Jane Cooper
        </p>
        <p className="text-[7px] opacity-40 font-mono">09/28</p>
      </div>
    </div>
  </div>
);

const CreditCardBack = () => (
  <div className="w-full h-full rounded-lg bg-[#1a1a1a] flex flex-col justify-between overflow-hidden">
    <div className="w-full h-5 bg-[#2a2a2a] mt-3" />
    <div className="px-3 pb-3 space-y-1.5">
      <div className="flex items-center gap-1.5">
        <div className="flex-1 h-4 bg-[#2a2a2a] rounded-sm" />
        <p className="text-[8px] text-white opacity-50 font-mono">817</p>
      </div>
      <p className="text-[6px] text-white opacity-30 font-mono">
        Authorized signature
      </p>
    </div>
  </div>
);

const MiniCreditCard = ({ flipped }: { flipped: boolean }) => (
  <div className="w-[120px] h-[76px]" style={{ perspective: "400px" }}>
    <motion.div
      animate={{ rotateY: flipped ? 180 : 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
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
  </div>
);

export const AgentWorkflow = () => {
  const [phase, setPhase] = useState<
    "idle" | "message" | "form" | "holding" | "confirming" | "success" | "receipt"
  >("idle");
  const [holdProg, setHoldProg] = useState(0);
  const [cvvFocused, setCvvFocused] = useState(false);
  const holdStart = useRef(0);
  const raf = useRef(0);

  const start = useCallback(() => {
    setPhase("idle");
    setHoldProg(0);
    setCvvFocused(false);

    setTimeout(() => setPhase("message"), 100);
    setTimeout(() => setPhase("form"), 1200);
  }, []);

  const reset = useCallback(() => {
    setPhase("idle");
    setHoldProg(0);
    setCvvFocused(false);
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
      <AnimatePresence>
        {phase === "idle" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col items-center justify-center flex-1"
          >
            <button
              onClick={start}
              className="rounded-full border border-secondary bg-primary px-5 py-1.5 text-xs font-medium text-primary shadow-sm hover:bg-secondary transition-colors cursor-pointer"
            >
              Trigger
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {phase !== "idle" && (
        <div className="w-full max-w-sm flex flex-col gap-4">
          <AnimatePresence>
            {showMessage && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex gap-2.5 items-start"
              >
                <div className="w-5 h-5 rounded-full bg-accent-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg
                    viewBox="0 0 12 12"
                    className="w-2.5 h-2.5 text-accent-foreground"
                    fill="currentColor"
                  >
                    <path d="M6 1.5a1 1 0 0 1 1 1v2h2a1 1 0 1 1 0 1.5H7v2a1 1 0 1 1-1.5 0v-2h-2a1 1 0 0 1 0-1.5h2v-2a1 1 0 0 1 1-1z" />
                  </svg>
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs font-medium text-primary">Agent</p>
                  <p className="text-sm text-secondary leading-relaxed">
                    Please confirm you want to buy this chair from Zara Home:
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: formDone ? 0.5 : 1, y: 0, scale: formDone ? 0.98 : 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="rounded-xl border border-secondary bg-primary shadow-sm p-4 flex flex-col gap-4"
                style={{ pointerEvents: formDone ? "none" : "auto" }}
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
                          onFocus={() => setCvvFocused(true)}
                          onBlur={() => setCvvFocused(false)}
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

                  <div className="flex-shrink-0 pt-2">
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

                  <button
                    onMouseDown={onDown}
                    onMouseUp={onUp}
                    onMouseLeave={onUp}
                    onTouchStart={onDown}
                    onTouchEnd={onUp}
                    className="relative flex items-center justify-center rounded-full border border-secondary bg-primary h-8 w-36 text-xs text-secondary select-none cursor-pointer overflow-hidden"
                  >
                    <div
                      className="absolute inset-0 bg-accent-primary rounded-full origin-left"
                      style={{
                        transform: `scaleX(${holdProg})`,
                        transition:
                          holdProg === 0
                            ? "transform 0.15s ease-out"
                            : "none",
                      }}
                    />
                    <span
                      className="relative z-10 text-xs font-medium transition-colors duration-150"
                      style={{
                        color:
                          holdProg > 0.5
                            ? "var(--accent-foreground)"
                            : "var(--text-secondary)",
                      }}
                    >
                      Hold to confirm
                    </span>
                  </button>
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
                className="flex gap-2.5 items-start"
              >
                <div className="w-5 h-5 rounded-full bg-accent-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckIcon className="w-2.5 h-2.5 text-accent-foreground" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs font-medium text-primary">Agent</p>
                  <p className="text-sm text-secondary leading-relaxed">
                    Successfully purchased! Here is your receipt:
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showReceipt && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}
                className="rounded-xl border border-secondary bg-primary shadow-sm p-4 flex flex-col gap-3"
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
                    className="rounded-full border border-secondary bg-primary px-4 py-1 text-[10px] text-tertiary hover:text-secondary hover:bg-secondary transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
