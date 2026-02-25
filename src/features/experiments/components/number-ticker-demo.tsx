import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const CELL = 48;
const SPRING = { stiffness: 120, damping: 14, mass: 1.8 };
const POP = { stiffness: 400, damping: 20, mass: 0.5 };
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const CANDY = [
  "#ff6b6b",
  "#ff922b",
  "#ffd43b",
  "#51cf66",
  "#22b8cf",
  "#748ffc",
  "#cc5de8",
  "#f06595",
  "#20c997",
  "#ffa94d",
];

function digitColor(d: number, offset: number = 0) {
  return CANDY[(d + offset) % CANDY.length];
}

function Drum({ digit, index, total }: { digit: number; index: number; total: number }) {
  const mv = useMotionValue(-digit * CELL);
  const spring = useSpring(mv, SPRING);

  const hue = useTransform(spring, [-9 * CELL, 0], [0, 360]);
  const glowColor = useTransform(hue, (h) => `hsla(${h}, 80%, 60%, 0.08)`);

  useEffect(() => {
    mv.set(-digit * CELL);
  }, [digit, mv]);

  return (
    <motion.div
      className="relative overflow-hidden"
      style={{ height: CELL, width: 34 }}
      initial={{ opacity: 0, scaleY: 0, scaleX: 0.5, filter: "blur(8px)" }}
      animate={{ opacity: 1, scaleY: 1, scaleX: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scaleY: 0, scaleX: 0.5, filter: "blur(8px)" }}
      transition={{ type: "spring", ...POP, delay: index * 0.04 }}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 z-5 rounded-sm"
        style={{ background: glowColor }}
      />

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
            <span
              className="text-lg font-semibold tabular-nums select-none transition-colors duration-300"
              style={{
                color: d === digit ? digitColor(digit, index) : "var(--text-quaternary)",
                textShadow: d === digit ? `0 0 20px ${digitColor(digit, index)}33` : "none",
                opacity: d === digit ? 1 : 0.35,
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

  return (
    <div className="flex items-center">
      <AnimatePresence mode="popLayout">
        {value < 0 && (
          <motion.div
            key="neg"
            initial={{ opacity: 0, width: 0, rotate: -90 }}
            animate={{ opacity: 1, width: 16, rotate: 0 }}
            exit={{ opacity: 0, width: 0, rotate: 90 }}
            transition={{ type: "spring", ...POP }}
            className="flex items-center justify-center overflow-hidden"
          >
            <span className="text-lg font-semibold select-none" style={{ color: CANDY[0] }}>
              -
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex">
        <AnimatePresence mode="popLayout" initial={false}>
          {digitArr.map((d, i) => {
            const place = digitArr.length - 1 - i;
            return (
              <motion.div key={`p${place}`} className="relative flex">
                {i > 0 && (
                  <div
                    className="pointer-events-none absolute left-0 top-[15%] bottom-[15%] w-px z-20"
                    style={{
                      background: `linear-gradient(to bottom, transparent, ${digitColor(d, i)}30, transparent)`,
                    }}
                  />
                )}
                <Drum digit={d} index={i} total={digitArr.length} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

const PRESETS = [
  { label: "0", value: 0, emoji: "🫥" },
  { label: "42", value: 42, emoji: "🪐" },
  { label: "69", value: 69, emoji: "😏" },
  { label: "404", value: 404, emoji: "🫠" },
  { label: "777", value: 777, emoji: "🎰" },
  { label: "1,234", value: 1234, emoji: "📈" },
  { label: "9,999", value: 9999, emoji: "🤯" },
];

function Particle({ x, y, delay, color, size }: { x: number; y: number; delay: number; color: string; size: number }) {
  const shape = useMemo(() => Math.random() > 0.5, []);
  return (
    <motion.div
      className="pointer-events-none absolute"
      style={{ left: "50%", top: "50%" }}
      initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
      animate={{
        opacity: [1, 1, 0],
        scale: [0, 1.8, 0],
        x: x,
        y: y,
        rotate: [0, 200 + Math.random() * 400],
      }}
      transition={{ duration: 1, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {shape ? (
        <svg width={size} height={size} viewBox="0 0 10 10" fill="none">
          <path d="M5 0L6.12 3.88L10 5L6.12 6.12L5 10L3.88 6.12L0 5L3.88 3.88L5 0Z" fill={color} />
        </svg>
      ) : (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            background: color,
          }}
        />
      )}
    </motion.div>
  );
}

function Burst({ id }: { id: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, i) => {
        const angle = (i / 24) * Math.PI * 2 + Math.random() * 0.5;
        const dist = 50 + Math.random() * 80;
        return {
          id: i,
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist - 30,
          delay: Math.random() * 0.12,
          color: CANDY[Math.floor(Math.random() * CANDY.length)],
          size: 4 + Math.random() * 6,
        };
      }),
    [],
  );

  return (
    <>
      {particles.map((p) => (
        <Particle key={`${id}-${p.id}`} {...p} />
      ))}
    </>
  );
}

function FloatingEmoji({ emoji, id }: { emoji: string; id: number }) {
  const x = useMemo(() => -60 + Math.random() * 120, []);
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-1/2 text-lg"
      initial={{ opacity: 1, y: 0, x: 0, scale: 0, rotate: 0 }}
      animate={{
        opacity: [1, 1, 0],
        y: -80 - Math.random() * 60,
        x: x,
        scale: [0, 1.4, 0.8],
        rotate: [-20 + Math.random() * 40],
      }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
    >
      {emoji}
    </motion.div>
  );
}

export function NumberTickerDemo() {
  const [value, setValue] = useState(1234);
  const [burstId, setBurstId] = useState(0);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; emoji: string }[]>([]);
  const emojiId = useRef(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const dxStart = useRef(0);
  const dvStart = useRef(0);
  const prev = useRef(1234);
  const [tilt, setTilt] = useState(0);
  const [squeeze, setSqueeze] = useState(false);

  const triggerBurst = useCallback(() => {
    setBurstId((b) => b + 1);
  }, []);

  const spawnEmoji = useCallback((emoji: string) => {
    const id = emojiId.current++;
    setFloatingEmojis((e) => [...e, { id, emoji }]);
    setTimeout(() => setFloatingEmojis((e) => e.filter((em) => em.id !== id)), 1400);
  }, []);

  const set = useCallback(
    (n: number) => {
      const c = Math.min(99999, Math.max(-9999, n));
      const diff = c - prev.current;
      const ol = String(Math.abs(prev.current)).length;
      const nl = String(Math.abs(c)).length;

      setTilt(Math.max(-12, Math.min(12, diff * 0.8)));
      setTimeout(() => setTilt(0), 200);

      if (nl > ol && nl > 1) {
        triggerBurst();
        spawnEmoji(["🎉", "🔥", "✨", "💥", "🚀"][Math.floor(Math.random() * 5)]);
      }

      if (c === 69) spawnEmoji("😏");
      if (c === 420) spawnEmoji("🌿");
      if (c === 777) spawnEmoji("🍀");
      if (c === 404) spawnEmoji("👻");
      if (c === 1337) spawnEmoji("🧠");
      if (c === 9999) {
        triggerBurst();
        spawnEmoji("🤯");
      }

      if (Math.abs(diff) > 100) {
        setSqueeze(true);
        setTimeout(() => setSqueeze(false), 300);
      }

      prev.current = c;
      setValue(c);
    },
    [triggerBurst, spawnEmoji],
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

  const heldRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startHold = useCallback(
    (dir: 1 | -1) => {
      set(value + dir);
      let speed = 150;
      let acc = 1;
      const tick = () => {
        acc = Math.min(acc + 1, 50);
        set(value + dir * acc);
        heldRef.current = setTimeout(tick, Math.max(30, speed - acc * 3)) as unknown as ReturnType<typeof setInterval>;
      };
      heldRef.current = setTimeout(tick, 400) as unknown as ReturnType<typeof setInterval>;
    },
    [value, set],
  );

  const stopHold = useCallback(() => {
    if (heldRef.current) {
      clearTimeout(heldRef.current);
      heldRef.current = null;
    }
  }, []);

  const activeColor = useMemo(() => {
    const digits = String(Math.abs(value)).split("").map(Number);
    return digitColor(digits[0] ?? 0, 0);
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-5 w-full h-full justify-center select-none">
      <motion.div
        ref={wrapRef}
        className={cn(
          "relative flex items-center gap-2 rounded-2xl border border-primary bg-primary p-2",
          dragging ? "cursor-grabbing" : "cursor-grab",
        )}
        animate={{
          rotate: tilt,
          scaleX: squeeze ? 1.06 : 1,
          scaleY: squeeze ? 0.94 : 1,
        }}
        transition={{ type: "spring", stiffness: 600, damping: 20 }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          touchAction: "none",
          boxShadow: `0 1px 3px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.03), 0 0 0 1px ${activeColor}08`,
        }}
      >
        <AnimatePresence>
          {burstId > 0 && <Burst key={burstId} id={burstId} />}
        </AnimatePresence>
        <AnimatePresence>
          {floatingEmojis.map((e) => (
            <FloatingEmoji key={e.id} id={e.id} emoji={e.emoji} />
          ))}
        </AnimatePresence>

        <motion.button
          onPointerDown={() => startHold(-1)}
          onPointerUp={stopHold}
          onPointerLeave={stopHold}
          onClick={(e) => e.preventDefault()}
          whileTap={{ scale: 0.75, rotate: -8 }}
          whileHover={{ scale: 1.12, y: -1 }}
          transition={{ type: "spring", stiffness: 500, damping: 14 }}
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-surface-tertiary hover:bg-interactive-active text-secondary transition-colors cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </motion.button>

        <div
          className="rounded-xl overflow-hidden bg-secondary px-0.5"
          style={{
            boxShadow: `inset 0 1px 4px rgba(0,0,0,0.06), inset 0 0 0 0.5px ${activeColor}15`,
          }}
        >
          <OdometerDisplay value={value} />
        </div>

        <motion.button
          onPointerDown={() => startHold(1)}
          onPointerUp={stopHold}
          onPointerLeave={stopHold}
          onClick={(e) => e.preventDefault()}
          whileTap={{ scale: 0.75, rotate: 8 }}
          whileHover={{ scale: 1.12, y: -1 }}
          transition={{ type: "spring", stiffness: 500, damping: 14 }}
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-surface-tertiary hover:bg-interactive-active text-secondary transition-colors cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 3v8M3 7h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </motion.button>
      </motion.div>

      <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-sm">
        {PRESETS.map((p) => (
          <motion.button
            key={p.value}
            onClick={() => set(p.value)}
            whileTap={{ scale: 0.85, y: 2 }}
            whileHover={{ y: -3, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs tabular-nums transition-all duration-200 cursor-pointer flex items-center gap-1",
              value === p.value
                ? "font-medium shadow-sm"
                : "text-quaternary hover:text-secondary hover:bg-interactive-hover",
            )}
            style={
              value === p.value
                ? {
                    background: digitColor(String(p.value).split("").map(Number)[0] ?? 0, 0),
                    color: "#fff",
                  }
                : undefined
            }
          >
            <span className="text-[10px] leading-none">{p.emoji}</span>
            {p.label}
          </motion.button>
        ))}
        <motion.button
          onClick={() => set(Math.floor(Math.random() * 10000))}
          whileTap={{ scale: 0.7, rotate: 360 }}
          whileHover={{ y: -3, rotate: 15 }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
          className="rounded-full px-2.5 py-1 text-xs text-quaternary hover:text-secondary hover:bg-interactive-hover transition-all duration-200 cursor-pointer flex items-center gap-1"
        >
          <span className="text-[10px] leading-none">🎲</span>
          Shuffle
        </motion.button>
      </div>

      <p className="text-[11px] text-quaternary">drag / hold buttons / arrow keys / hit 69</p>
    </div>
  );
}
