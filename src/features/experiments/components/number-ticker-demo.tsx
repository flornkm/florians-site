import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const CELL = 52;
const SPRING = { stiffness: 140, damping: 18, mass: 1.6 };
const POP = { stiffness: 380, damping: 22, mass: 0.6 };
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const COLORS = [
  "#f87171",
  "#fb923c",
  "#facc15",
  "#4ade80",
  "#22d3ee",
  "#818cf8",
  "#c084fc",
  "#f472b6",
];

function Drum({ digit, index, flash }: { digit: number; index: number; flash: boolean }) {
  const mv = useMotionValue(-digit * CELL);
  const spring = useSpring(mv, SPRING);

  useEffect(() => {
    mv.set(-digit * CELL);
  }, [digit, mv]);

  return (
    <motion.div
      className="relative overflow-hidden"
      style={{ height: CELL, width: 36 }}
      initial={{ opacity: 0, scaleY: 0.3, width: 0, filter: "blur(4px)" }}
      animate={{ opacity: 1, scaleY: 1, width: 36, filter: "blur(0px)" }}
      exit={{ opacity: 0, scaleY: 0.3, width: 0, filter: "blur(4px)" }}
      transition={{ type: "spring", ...POP, delay: index * 0.05 }}
    >
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(to bottom, var(--bg-primary) 0%, transparent 30%, transparent 70%, var(--bg-primary) 100%)",
        }}
      />

      <AnimatePresence>
        {flash && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-5 rounded-sm"
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              background: `radial-gradient(circle, ${COLORS[digit % COLORS.length]}20 0%, transparent 70%)`,
            }}
          />
        )}
      </AnimatePresence>

      <motion.div className="absolute inset-x-0" style={{ y: spring }}>
        {DIGITS.map((d) => (
          <div key={d} className="flex items-center justify-center" style={{ height: CELL }}>
            <span
              className="text-xl font-semibold tabular-nums select-none"
              style={{
                color: d === digit ? "var(--text-primary)" : "var(--text-quaternary)",
              }}
            >
              {d}
            </span>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}

function OdometerDisplay({ value }: { value: number }) {
  const abs = Math.abs(value);
  const digitArr = useMemo(() => String(abs).split("").map(Number), [abs]);
  const prevDigits = useRef<number[]>(digitArr);
  const [flashMap, setFlashMap] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const newFlash: Record<number, boolean> = {};
    digitArr.forEach((d, i) => {
      const place = digitArr.length - 1 - i;
      if (prevDigits.current[i] !== d) {
        newFlash[place] = true;
      }
    });
    prevDigits.current = digitArr;
    setFlashMap(newFlash);
    const t = setTimeout(() => setFlashMap({}), 600);
    return () => clearTimeout(t);
  }, [digitArr]);

  const places = digitArr.length;

  return (
    <div className="flex items-center">
      <AnimatePresence mode="popLayout">
        {value < 0 && (
          <motion.div
            key="neg"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 18 }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ type: "spring", ...POP }}
            className="flex items-center justify-center overflow-hidden"
          >
            <span className="text-xl font-semibold text-primary select-none">-</span>
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
                    className="pointer-events-none absolute left-0 top-[20%] bottom-[20%] w-px z-20"
                    style={{ background: "var(--border-primary)", opacity: 0.25 }}
                  />
                )}
                <Drum digit={d} index={i} flash={!!flashMap[place]} />
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

function Sparkle({ x, y, delay, color }: { x: number; y: number; delay: number; color: string }) {
  return (
    <motion.div
      className="pointer-events-none absolute"
      style={{ left: x, top: y }}
      initial={{ opacity: 1, scale: 0 }}
      animate={{
        opacity: [1, 1, 0],
        scale: [0, 1.6, 0],
        y: [0, -40 - Math.random() * 50],
        x: [-30 + Math.random() * 60],
        rotate: [0, 180 + Math.random() * 360],
      }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path
          d="M5 0L6.12 3.88L10 5L6.12 6.12L5 10L3.88 6.12L0 5L3.88 3.88L5 0Z"
          fill={color}
        />
      </svg>
    </motion.div>
  );
}

function ConfettiBurst({ count }: { count: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: Math.random() * 100 - 50,
        y: Math.random() * -60 - 20,
        rotate: Math.random() * 360,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        scale: 0.5 + Math.random() * 0.8,
        delay: i * 0.02,
      })),
    [count],
  );

  return (
    <>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="pointer-events-none absolute left-1/2 top-1/2"
          initial={{ opacity: 1, x: 0, y: 0, scale: 0, rotate: 0 }}
          animate={{
            opacity: [1, 1, 0],
            x: p.x,
            y: p.y,
            scale: [0, p.scale, 0],
            rotate: p.rotate,
          }}
          transition={{ duration: 0.9, delay: p.delay, ease: "easeOut" }}
        >
          <div
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: p.color }}
          />
        </motion.div>
      ))}
    </>
  );
}

export function NumberTickerDemo() {
  const [value, setValue] = useState(1234);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; delay: number; color: string }[]>([]);
  const [confettiBurst, setConfettiBurst] = useState(0);
  const sid = useRef(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const dxStart = useRef(0);
  const dvStart = useRef(0);
  const prev = useRef(1234);

  const pop = useCallback(() => {
    if (!wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    const batch = Array.from({ length: 10 }).map((_, i) => ({
      id: sid.current++,
      x: Math.random() * r.width,
      y: Math.random() * r.height * 0.5,
      delay: i * 0.03,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
    setSparkles((s) => [...s, ...batch]);
    setTimeout(() => setSparkles((s) => s.filter((sp) => !batch.find((b) => b.id === sp.id))), 1400);
  }, []);

  const set = useCallback(
    (n: number) => {
      const c = Math.min(99999, Math.max(-9999, n));
      const ol = String(Math.abs(prev.current)).length;
      const nl = String(Math.abs(c)).length;
      if (nl > ol && nl > 1) {
        pop();
        setConfettiBurst((b) => b + 1);
      }
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
      const delta = Math.round((e.clientX - dxStart.current) / 4);
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
    <div className="flex flex-col items-center gap-6 w-full h-full justify-center select-none">
      <div
        ref={wrapRef}
        className={cn(
          "relative flex items-center gap-3 rounded-2xl border border-primary bg-primary p-2.5",
          "shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)]",
          dragging ? "cursor-grabbing" : "cursor-grab",
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{ touchAction: "none" }}
      >
        {sparkles.map((s) => (
          <Sparkle key={s.id} x={s.x} y={s.y} delay={s.delay} color={s.color} />
        ))}
        <AnimatePresence>
          {confettiBurst > 0 && <ConfettiBurst key={confettiBurst} count={16} />}
        </AnimatePresence>

        <motion.button
          onClick={() => set(value - 1)}
          whileTap={{ scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 500, damping: 16 }}
          className="flex items-center justify-center w-8 h-8 rounded-xl bg-surface-tertiary hover:bg-interactive-active text-secondary transition-colors cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </motion.button>

        <div className="rounded-xl overflow-hidden border border-primary bg-primary px-0.5">
          <OdometerDisplay value={value} />
        </div>

        <motion.button
          onClick={() => set(value + 1)}
          whileTap={{ scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 500, damping: 16 }}
          className="flex items-center justify-center w-8 h-8 rounded-xl bg-surface-tertiary hover:bg-interactive-active text-secondary transition-colors cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 3v8M3 7h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </motion.button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-sm">
        {PRESETS.map((p) => (
          <motion.button
            key={p.value}
            onClick={() => set(p.value)}
            whileTap={{ scale: 0.88 }}
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            className={cn(
              "rounded-full px-3 py-1 text-xs tabular-nums transition-all duration-200 cursor-pointer",
              value === p.value
                ? "bg-accent-primary text-inverted font-medium shadow-sm"
                : "text-quaternary hover:text-secondary hover:bg-interactive-hover",
            )}
          >
            {p.label}
          </motion.button>
        ))}
        <motion.button
          onClick={() => set(Math.floor(Math.random() * 10000))}
          whileTap={{ scale: 0.82, rotate: 180 }}
          whileHover={{ y: -2, rotate: 20 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="rounded-full px-3 py-1 text-xs text-quaternary hover:text-secondary hover:bg-interactive-hover transition-all duration-200 cursor-pointer"
        >
          Shuffle
        </motion.button>
      </div>

      <p className="text-xs text-quaternary">drag to scrub / arrow keys / presets</p>
    </div>
  );
}
