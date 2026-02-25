import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useSpring, useTransform } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const DIGIT_HEIGHT = 40;
const SPRING_CONFIG = { stiffness: 300, damping: 30, mass: 0.8 };

function Digit({ value, place }: { value: number; place: number }) {
  const raw = useSpring(value, SPRING_CONFIG);

  useEffect(() => {
    raw.set(value);
  }, [value, raw]);

  const y = useTransform(raw, (v) => {
    const digit = Math.floor(v / Math.pow(10, place)) % 10;
    return -digit * DIGIT_HEIGHT;
  });

  return (
    <div
      className="relative overflow-hidden"
      style={{ height: DIGIT_HEIGHT, width: 24 }}
    >
      <motion.div className="absolute left-0 right-0" style={{ y }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-center tabular-nums"
            style={{ height: DIGIT_HEIGHT }}
          >
            <span className="text-lg font-semibold text-primary">{i}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function AnimatedNumber({ value }: { value: number }) {
  const absValue = Math.abs(value);
  const digits = useMemo(() => {
    const str = String(absValue);
    return str.length;
  }, [absValue]);

  return (
    <div className="flex items-center">
      <AnimatePresence mode="popLayout">
        {value < 0 && (
          <motion.span
            key="minus"
            initial={{ opacity: 0, width: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, width: 12, filter: "blur(0px)" }}
            exit={{ opacity: 0, width: 0, filter: "blur(4px)" }}
            transition={{ type: "spring", ...SPRING_CONFIG }}
            className="text-lg font-semibold text-primary overflow-hidden"
          >
            -
          </motion.span>
        )}
      </AnimatePresence>
      <div className="flex">
        <AnimatePresence mode="popLayout" initial={false}>
          {Array.from({ length: digits }).map((_, i) => {
            const place = digits - 1 - i;
            return (
              <motion.div
                key={`place-${place}`}
                initial={{ opacity: 0, scale: 0.5, filter: "blur(8px)", width: 0 }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)", width: 24 }}
                exit={{ opacity: 0, scale: 0.5, filter: "blur(8px)", width: 0 }}
                transition={{
                  type: "spring",
                  stiffness: SPRING_CONFIG.stiffness,
                  damping: SPRING_CONFIG.damping,
                  mass: SPRING_CONFIG.mass,
                  delay: i * 0.03,
                }}
                className="overflow-hidden"
              >
                <Digit value={absValue} place={place} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

const PRESETS = [0, 42, 100, 999, 1234, 9999] as const;

export function NumberTickerDemo() {
  const [value, setValue] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartValue = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const increment = useCallback(() => setValue((v) => Math.min(v + 1, 99999)), []);
  const decrement = useCallback(() => setValue((v) => Math.max(v - 1, -9999)), []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      setIsDragging(true);
      dragStartX.current = e.clientX;
      dragStartValue.current = value;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [value],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartX.current;
      const delta = Math.round(dx / 8);
      const next = Math.min(99999, Math.max(-9999, dragStartValue.current + delta));
      setValue(next);
    },
    [isDragging],
  );

  const onPointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const handleUp = () => setIsDragging(false);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    return () => {
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [isDragging]);

  return (
    <div className="flex flex-col items-center gap-8 w-full h-full justify-center select-none">
      <div
        ref={containerRef}
        className={cn(
          "flex items-center gap-3 rounded-2xl border border-primary bg-primary px-5 py-3",
          "transition-shadow duration-200",
          isDragging ? "cursor-grabbing shadow-lg" : "cursor-grab",
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{ touchAction: "none" }}
      >
        <motion.button
          onClick={decrement}
          whileTap={{ scale: 0.85 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-tertiary hover:bg-interactive-active text-secondary transition-colors cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </motion.button>

        <div className="min-w-[72px] flex justify-center">
          <AnimatedNumber value={value} />
        </div>

        <motion.button
          onClick={increment}
          whileTap={{ scale: 0.85 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-tertiary hover:bg-interactive-active text-secondary transition-colors cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 3v8M3 7h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </motion.button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {PRESETS.map((preset) => (
          <motion.button
            key={preset}
            onClick={() => setValue(preset)}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-mono transition-colors cursor-pointer",
              value === preset
                ? "bg-surface-tertiary text-primary"
                : "text-quaternary hover:text-secondary hover:bg-interactive-hover",
            )}
          >
            {preset.toLocaleString()}
          </motion.button>
        ))}
      </div>

      <p className="text-xs text-quaternary opacity-60">Click buttons or drag horizontally to change the value</p>
    </div>
  );
}
