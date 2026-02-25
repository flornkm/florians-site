import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const CELL = 48;
const SPRING = { stiffness: 180, damping: 22, mass: 1.2 };
const POP = { stiffness: 400, damping: 24, mass: 0.5 };
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function Drum({ digit, index }: { digit: number; index: number }) {
  const mv = useMotionValue(-digit * CELL);
  const spring = useSpring(mv, SPRING);

  useEffect(() => {
    mv.set(-digit * CELL);
  }, [digit, mv]);

  return (
    <motion.div
      className="relative overflow-hidden"
      style={{ height: CELL, width: 32 }}
      initial={{ opacity: 0, scaleY: 0, width: 0 }}
      animate={{ opacity: 1, scaleY: 1, width: 32 }}
      exit={{ opacity: 0, scaleY: 0, width: 0 }}
      transition={{ type: "spring", ...POP, delay: index * 0.04 }}
    >
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(to bottom, var(--bg-secondary) 0%, transparent 25%, transparent 75%, var(--bg-secondary) 100%)",
        }}
      />

      <motion.div className="absolute inset-x-0" style={{ y: spring }}>
        {DIGITS.map((d) => (
          <div key={d} className="flex items-center justify-center" style={{ height: CELL }}>
            <span className="text-lg font-semibold tabular-nums text-primary select-none">{d}</span>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}

function OdometerDisplay({ value }: { value: number }) {
  const abs = Math.abs(value);
  const digitArr = useMemo(() => {
    const str = String(abs);
    return str.split("").map(Number);
  }, [abs]);

  const places = digitArr.length;

  return (
    <div className="flex items-center">
      <AnimatePresence mode="popLayout">
        {value < 0 && (
          <motion.div
            key="neg"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 16 }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ type: "spring", ...POP }}
            className="flex items-center justify-center overflow-hidden"
          >
            <span className="text-lg font-semibold text-primary select-none">-</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex">
        <AnimatePresence mode="popLayout" initial={false}>
          {digitArr.map((d, i) => {
            const place = places - 1 - i;
            return (
              <motion.div key={`p${place}`} className="relative flex">
                {i > 0 && (
                  <div
                    className="absolute left-0 top-[15%] bottom-[15%] w-px z-20"
                    style={{ background: "var(--border-tertiary)", opacity: 0.4 }}
                  />
                )}
                <Drum digit={d} index={i} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

const PRESETS = [
  { label: "0", value: 0 },
  { label: "42", value: 42 },
  { label: "123", value: 123 },
  { label: "404", value: 404 },
  { label: "777", value: 777 },
  { label: "1,234", value: 1234 },
  { label: "9,999", value: 9999 },
];

function Sparkle({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <motion.div
      className="pointer-events-none absolute"
      style={{ left: x, top: y }}
      initial={{ opacity: 1, scale: 0 }}
      animate={{
        opacity: [1, 1, 0],
        scale: [0, 1.4, 0],
        y: [0, -30 - Math.random() * 40],
        x: [-20 + Math.random() * 40],
        rotate: [0, 120 + Math.random() * 240],
      }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
    >
      <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
        <path
          d="M5 0L6.12 3.88L10 5L6.12 6.12L5 10L3.88 6.12L0 5L3.88 3.88L5 0Z"
          fill="currentColor"
          className="text-quaternary"
        />
      </svg>
    </motion.div>
  );
}

export function NumberTickerDemo() {
  const [value, setValue] = useState(0);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; delay: number }[]>([]);
  const sid = useRef(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const dxStart = useRef(0);
  const dvStart = useRef(0);
  const prev = useRef(0);

  const pop = useCallback(() => {
    if (!wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    const batch = Array.from({ length: 8 }).map((_, i) => ({
      id: sid.current++,
      x: Math.random() * r.width,
      y: Math.random() * r.height * 0.6,
      delay: i * 0.035,
    }));
    setSparkles((s) => [...s, ...batch]);
    setTimeout(() => setSparkles((s) => s.filter((sp) => !batch.find((b) => b.id === sp.id))), 1200);
  }, []);

  const set = useCallback(
    (n: number) => {
      const c = Math.min(99999, Math.max(-9999, n));
      const ol = String(Math.abs(prev.current)).length;
      const nl = String(Math.abs(c)).length;
      if (nl > ol && nl > 1) pop();
      prev.current = c;
      setValue(c);
    },
    [pop],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      setDragging(true);
      dxStart.current = e.clientX;
      dvStart.current = value;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [value],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const delta = Math.round((e.clientX - dxStart.current) / 5);
      set(dvStart.current + delta);
    },
    [dragging, set],
  );

  const onPointerUp = useCallback(() => setDragging(false), []);

  useEffect(() => {
    if (!dragging) return;
    const up = () => setDragging(false);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [dragging]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "ArrowRight") {
        e.preventDefault();
        setValue((v) => {
          const n = Math.min(v + 1, 99999);
          prev.current = n;
          return n;
        });
      }
      if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
        e.preventDefault();
        setValue((v) => {
          const n = Math.max(v - 1, -9999);
          prev.current = n;
          return n;
        });
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  return (
    <div className="flex flex-col items-center gap-5 w-full h-full justify-center select-none">
      <div
        ref={wrapRef}
        className={cn(
          "relative flex items-center gap-2.5 rounded-xl border border-primary bg-primary p-2",
          dragging ? "cursor-grabbing" : "cursor-grab",
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{ touchAction: "none" }}
      >
        {sparkles.map((s) => (
          <Sparkle key={s.id} x={s.x} y={s.y} delay={s.delay} />
        ))}

        <div className="flex flex-col gap-1">
          <motion.button
            onClick={() => set(value + 1)}
            whileTap={{ scale: 0.82, y: -2 }}
            whileHover={{ scale: 1.08 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className="flex items-center justify-center w-7 h-7 rounded-lg bg-surface-tertiary hover:bg-interactive-active text-secondary transition-colors cursor-pointer"
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M3 9l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
          <motion.button
            onClick={() => set(value - 1)}
            whileTap={{ scale: 0.82, y: 2 }}
            whileHover={{ scale: 1.08 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className="flex items-center justify-center w-7 h-7 rounded-lg bg-surface-tertiary hover:bg-interactive-active text-secondary transition-colors cursor-pointer"
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
        </div>

        <div className="rounded-lg overflow-hidden border border-primary bg-secondary">
          <OdometerDisplay value={value} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-xs">
        {PRESETS.map((p) => (
          <motion.button
            key={p.value}
            onClick={() => set(p.value)}
            whileTap={{ scale: 0.9 }}
            whileHover={{ y: -1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className={cn(
              "rounded-full px-3 py-1 text-xs tabular-nums transition-colors cursor-pointer",
              value === p.value
                ? "bg-surface-tertiary text-primary font-medium"
                : "text-quaternary hover:text-secondary hover:bg-interactive-hover",
            )}
          >
            {p.label}
          </motion.button>
        ))}
        <motion.button
          onClick={() => set(Math.floor(Math.random() * 10000))}
          whileTap={{ scale: 0.88, rotate: 12 }}
          whileHover={{ y: -1 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          className="rounded-full px-3 py-1 text-xs text-quaternary hover:text-secondary hover:bg-interactive-hover transition-colors cursor-pointer"
        >
          Random
        </motion.button>
      </div>

      <p className="text-xs text-quaternary opacity-50">Drag to scrub, arrow keys to step, or pick a preset</p>
    </div>
  );
}
