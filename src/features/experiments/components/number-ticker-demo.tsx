import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const CELL = 52;
const SPRING = { stiffness: 80, damping: 10, mass: 2.2 };
const POP = { stiffness: 500, damping: 18, mass: 0.4 };
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const CANDY = [
  "#ff4757",
  "#ff6348",
  "#ffa502",
  "#2ed573",
  "#1e90ff",
  "#5352ed",
  "#e056fd",
  "#ff6b81",
  "#7bed9f",
  "#70a1ff",
];

const NEON = [
  "#ff0080",
  "#ff00ff",
  "#8000ff",
  "#0080ff",
  "#00ffff",
  "#00ff80",
  "#80ff00",
  "#ffff00",
  "#ff8000",
  "#ff0040",
];

function digitColor(d: number, offset: number = 0) {
  return CANDY[(d + offset) % CANDY.length];
}

function neonColor(i: number) {
  return NEON[i % NEON.length];
}

function DigitFlash({ digit, prevDigit }: { digit: number; prevDigit: number }) {
  const changed = digit !== prevDigit;
  return (
    <AnimatePresence>
      {changed && (
        <motion.div
          key={`${digit}-${Date.now()}`}
          className="pointer-events-none absolute inset-0 z-5 rounded-sm"
          initial={{ opacity: 0.7, scale: 0.8 }}
          animate={{ opacity: 0, scale: 2.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            background: `radial-gradient(circle, ${digitColor(digit)}55 0%, transparent 70%)`,
          }}
        />
      )}
    </AnimatePresence>
  );
}

function RollingSpark({ digit, springY }: { digit: number; springY: ReturnType<typeof useSpring> }) {
  const velocity = useTransform(springY, (latest) => {
    const v = springY.getVelocity();
    return Math.abs(v);
  });

  const sparkOpacity = useTransform(velocity, [0, 500, 3000], [0, 0.3, 1]);
  const sparkScale = useTransform(velocity, [0, 500, 3000], [0.5, 1, 1.8]);
  const sparkColor = digitColor(digit, 2);

  return (
    <motion.div
      className="pointer-events-none absolute inset-x-0 top-0 z-20 h-1"
      style={{
        opacity: sparkOpacity,
        scaleX: sparkScale,
        background: `linear-gradient(90deg, transparent, ${sparkColor}, transparent)`,
        filter: `blur(1px)`,
      }}
    />
  );
}

function Drum({
  digit,
  index,
  total,
  prevDigit,
  changeTick,
}: {
  digit: number;
  index: number;
  total: number;
  prevDigit: number;
  changeTick: number;
}) {
  const mv = useMotionValue(-digit * CELL);
  const spring = useSpring(mv, SPRING);

  const hue = useTransform(spring, [-9 * CELL, 0], [0, 360]);
  const glowColor = useTransform(hue, (h) => `hsla(${h}, 90%, 55%, 0.12)`);
  const borderGlow = useTransform(hue, (h) => `hsla(${h}, 90%, 55%, 0.25)`);

  useEffect(() => {
    mv.set(-digit * CELL);
  }, [digit, mv]);

  const drumColor = digitColor(digit, index);

  return (
    <motion.div
      className="relative overflow-hidden"
      style={{ height: CELL, width: 38 }}
      initial={{ opacity: 0, scaleY: 0, scaleX: 0.3, filter: "blur(12px)", rotate: -20 }}
      animate={{ opacity: 1, scaleY: 1, scaleX: 1, filter: "blur(0px)", rotate: 0 }}
      exit={{ opacity: 0, scaleY: 0, scaleX: 0.3, filter: "blur(12px)", rotate: 20 }}
      transition={{ type: "spring", ...POP, delay: index * 0.05 }}
    >
      <DigitFlash digit={digit} prevDigit={prevDigit} />
      <RollingSpark digit={digit} springY={spring} />

      <motion.div
        className="pointer-events-none absolute inset-0 z-5 rounded-sm"
        style={{ background: glowColor, boxShadow: useTransform(borderGlow, (c) => `inset 0 0 12px ${c}`) }}
      />

      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(to bottom, var(--bg-secondary) 0%, transparent 20%, transparent 80%, var(--bg-secondary) 100%)",
        }}
      />

      <motion.div className="absolute inset-x-0" style={{ y: spring }}>
        {DIGITS.map((d) => (
          <div key={d} className="flex items-center justify-center" style={{ height: CELL }}>
            <motion.span
              className="text-xl font-bold tabular-nums select-none"
              animate={
                d === digit
                  ? {
                      scale: [1, 1.3, 1],
                      rotate: [0, Math.random() > 0.5 ? 8 : -8, 0],
                    }
                  : {}
              }
              transition={{ duration: 0.35, ease: "easeOut" }}
              key={`${d}-${changeTick}`}
              style={{
                color: d === digit ? drumColor : "var(--text-quaternary)",
                textShadow:
                  d === digit
                    ? `0 0 20px ${drumColor}66, 0 0 40px ${drumColor}33, 0 2px 4px rgba(0,0,0,0.1)`
                    : "none",
                opacity: d === digit ? 1 : 0.2,
              }}
            >
              {d}
            </motion.span>
          </div>
        ))}
      </motion.div>

      <motion.div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-15 h-0.5"
        animate={{
          background: [
            `linear-gradient(90deg, ${neonColor(index)}, ${neonColor(index + 3)})`,
            `linear-gradient(90deg, ${neonColor(index + 5)}, ${neonColor(index + 8)})`,
            `linear-gradient(90deg, ${neonColor(index)}, ${neonColor(index + 3)})`,
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        style={{ opacity: 0.6 }}
      />
    </motion.div>
  );
}

function OdometerDisplay({
  value,
  changeTick,
  prevDigits,
}: {
  value: number;
  changeTick: number;
  prevDigits: number[];
}) {
  const abs = Math.abs(value);
  const digitArr = useMemo(() => String(abs).split("").map(Number), [abs]);

  return (
    <div className="flex items-center">
      <AnimatePresence mode="popLayout">
        {value < 0 && (
          <motion.div
            key="neg"
            initial={{ opacity: 0, width: 0, rotate: -180, scale: 0 }}
            animate={{ opacity: 1, width: 18, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, width: 0, rotate: 180, scale: 0 }}
            transition={{ type: "spring", ...POP }}
            className="flex items-center justify-center overflow-hidden"
          >
            <span className="text-xl font-bold select-none" style={{ color: CANDY[0] }}>
              -
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex">
        <AnimatePresence mode="popLayout" initial={false}>
          {digitArr.map((d, i) => {
            const place = digitArr.length - 1 - i;
            const pd = prevDigits[prevDigits.length - digitArr.length + i] ?? d;
            return (
              <motion.div key={`p${place}`} className="relative flex">
                {i > 0 && (
                  <div
                    className="pointer-events-none absolute left-0 top-[10%] bottom-[10%] w-px z-20"
                    style={{
                      background: `linear-gradient(to bottom, transparent, ${digitColor(d, i)}50, transparent)`,
                    }}
                  />
                )}
                <Drum digit={d} index={i} total={digitArr.length} prevDigit={pd} changeTick={changeTick} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

const PRESETS = [0, 42, 100, 404, 777, 1234, 9999];

function Particle({
  x,
  y,
  delay,
  color,
  size,
  shape,
}: {
  x: number;
  y: number;
  delay: number;
  color: string;
  size: number;
  shape: "circle" | "star" | "square" | "ring";
}) {
  return (
    <motion.div
      className="pointer-events-none absolute"
      style={{ left: "50%", top: "50%" }}
      initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
      animate={{
        opacity: [1, 0.9, 0],
        scale: [0, 1.5, 0.2],
        x: x,
        y: y,
        rotate: [0, 180 + Math.random() * 360],
      }}
      transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
        {shape === "circle" && <circle cx="6" cy="6" r="5" fill={color} />}
        {shape === "star" && (
          <path
            d="M6 0L7.4 4.1L12 4.6L8.5 7.7L9.5 12L6 9.7L2.5 12L3.5 7.7L0 4.6L4.6 4.1Z"
            fill={color}
          />
        )}
        {shape === "square" && <rect x="1" y="1" width="10" height="10" rx="2" fill={color} />}
        {shape === "ring" && <circle cx="6" cy="6" r="4" stroke={color} strokeWidth="2" fill="none" />}
      </svg>
    </motion.div>
  );
}

function Burst({ id, intensity }: { id: number; intensity: number }) {
  const count = Math.min(36, 8 + intensity * 4);
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
        const dist = 30 + Math.random() * (50 + intensity * 15);
        const shapes = ["circle", "star", "square", "ring"] as const;
        return {
          id: i,
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist - 15,
          delay: Math.random() * 0.12,
          color: NEON[Math.floor(Math.random() * NEON.length)],
          size: 3 + Math.random() * 6,
          shape: shapes[Math.floor(Math.random() * shapes.length)],
        };
      }),
    [count, intensity],
  );

  return (
    <>
      {particles.map((p) => (
        <Particle key={`${id}-${p.id}`} {...p} />
      ))}
    </>
  );
}

function MiniSpark({ color, id }: { color: string; id: number }) {
  const angle = Math.random() * Math.PI * 2;
  const dist = 15 + Math.random() * 25;
  return (
    <motion.div
      key={id}
      className="pointer-events-none absolute"
      style={{ left: "50%", top: "50%" }}
      initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
      animate={{
        opacity: [1, 0],
        scale: [0, 1],
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
      }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="rounded-full" style={{ width: 3, height: 3, background: color }} />
    </motion.div>
  );
}

function AuraGlow({ value, activeColor }: { value: number; activeColor: string }) {
  const digits = String(Math.abs(value)).split("").map(Number);
  const colors = digits.map((d, i) => digitColor(d, i));
  const c1 = colors[0] ?? activeColor;
  const c2 = colors[Math.floor(colors.length / 2)] ?? activeColor;
  const c3 = colors[colors.length - 1] ?? activeColor;

  return (
    <motion.div
      className="pointer-events-none absolute -inset-3 z-0 rounded-2xl"
      animate={{
        background: [
          `radial-gradient(ellipse at 20% 50%, ${c1}20 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, ${c3}20 0%, transparent 50%)`,
          `radial-gradient(ellipse at 50% 20%, ${c2}25 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, ${c1}25 0%, transparent 50%)`,
          `radial-gradient(ellipse at 80% 50%, ${c3}20 0%, transparent 50%), radial-gradient(ellipse at 20% 50%, ${c2}20 0%, transparent 50%)`,
        ],
      }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      style={{ filter: "blur(12px)" }}
    />
  );
}

function RainbowBar() {
  return (
    <motion.div
      className="absolute bottom-0 left-2 right-2 h-px z-30 rounded-full"
      animate={{
        background: [
          `linear-gradient(90deg, ${NEON[0]}, ${NEON[2]}, ${NEON[4]}, ${NEON[6]}, ${NEON[8]})`,
          `linear-gradient(90deg, ${NEON[5]}, ${NEON[7]}, ${NEON[9]}, ${NEON[1]}, ${NEON[3]})`,
          `linear-gradient(90deg, ${NEON[0]}, ${NEON[2]}, ${NEON[4]}, ${NEON[6]}, ${NEON[8]})`,
        ],
      }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      style={{ opacity: 0.5 }}
    />
  );
}

export function NumberTickerDemo() {
  const [value, setValue] = useState(1234);
  const [burstId, setBurstId] = useState(0);
  const [burstIntensity, setBurstIntensity] = useState(1);
  const [sparkTrail, setSparkTrail] = useState<{ id: number; color: string }[]>([]);
  const sparkIdRef = useRef(0);
  const [changeTick, setChangeTick] = useState(0);
  const [prevDigits, setPrevDigits] = useState<number[]>([1, 2, 3, 4]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const dxStart = useRef(0);
  const dvStart = useRef(0);
  const prev = useRef(1234);
  const [tilt, setTilt] = useState(0);
  const [squeeze, setSqueeze] = useState(false);
  const [wobble, setWobble] = useState({ x: 0, y: 0 });

  const set = useCallback(
    (n: number) => {
      const c = Math.min(99999, Math.max(-9999, n));
      const diff = c - prev.current;
      const absDiff = Math.abs(diff);
      const ol = String(Math.abs(prev.current)).length;
      const nl = String(Math.abs(c)).length;

      setPrevDigits(String(Math.abs(prev.current)).split("").map(Number));
      setChangeTick((t) => t + 1);

      const tiltAmount = Math.max(-20, Math.min(20, diff * 1.2));
      setTilt(tiltAmount);
      setTimeout(() => setTilt(0), 180);

      setWobble({
        x: (Math.random() - 0.5) * Math.min(6, absDiff * 0.3),
        y: (Math.random() - 0.5) * Math.min(4, absDiff * 0.2),
      });
      setTimeout(() => setWobble({ x: 0, y: 0 }), 200);

      if (absDiff > 0) {
        const newSparks = Array.from({ length: Math.min(4, Math.ceil(absDiff / 10)) }).map(() => ({
          id: sparkIdRef.current++,
          color: NEON[Math.floor(Math.random() * NEON.length)],
        }));
        setSparkTrail((s) => [...s.slice(-20), ...newSparks]);
      }

      if (nl !== ol && nl > 1) {
        setBurstIntensity(Math.min(6, Math.abs(nl - ol) * 2));
        setBurstId((b) => b + 1);
      } else if (absDiff > 50) {
        setBurstIntensity(Math.min(6, Math.ceil(absDiff / 100)));
        setBurstId((b) => b + 1);
      }

      if (absDiff > 20) {
        setSqueeze(true);
        setTimeout(() => setSqueeze(false), 250);
      }

      prev.current = c;
      setValue(c);
    },
    [],
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
      const delta = Math.round((e.clientX - dxStart.current) / 3);
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
          setChangeTick((t) => t + 1);
          return n;
        });
      }
      if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
        e.preventDefault();
        setValue((v) => {
          const n = Math.max(v - 1, -9999);
          prev.current = n;
          setChangeTick((t) => t + 1);
          return n;
        });
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const heldRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heldValue = useRef(value);
  heldValue.current = value;

  const startHold = useCallback(
    (dir: 1 | -1) => {
      set(heldValue.current + dir);
      let acc = 1;
      const tick = () => {
        acc = Math.min(acc + 2, 80);
        set(heldValue.current + dir * acc);
        heldRef.current = setTimeout(tick, Math.max(20, 120 - acc * 2)) as unknown as ReturnType<typeof setInterval>;
      };
      heldRef.current = setTimeout(tick, 350) as unknown as ReturnType<typeof setInterval>;
    },
    [set],
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
      <div className="relative">
        <AuraGlow value={value} activeColor={activeColor} />

        <motion.div
          ref={wrapRef}
          className={cn(
            "relative flex items-center gap-2 rounded-xl border border-primary bg-primary p-2",
            dragging ? "cursor-grabbing" : "cursor-grab",
          )}
          animate={{
            rotate: tilt,
            scaleX: squeeze ? 1.1 : 1,
            scaleY: squeeze ? 0.9 : 1,
            x: wobble.x,
            y: wobble.y,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 16 }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          style={{
            touchAction: "none",
            boxShadow: `0 2px 8px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.03)`,
          }}
        >
          <AnimatePresence>
            {burstId > 0 && <Burst key={burstId} id={burstId} intensity={burstIntensity} />}
          </AnimatePresence>

          <AnimatePresence>
            {sparkTrail.slice(-12).map((s) => (
              <MiniSpark key={s.id} id={s.id} color={s.color} />
            ))}
          </AnimatePresence>

          <RainbowBar />

          <motion.button
            onPointerDown={() => startHold(-1)}
            onPointerUp={stopHold}
            onPointerLeave={stopHold}
            onClick={(e) => e.preventDefault()}
            whileTap={{ scale: 0.65, rotate: -15, y: 2 }}
            whileHover={{ scale: 1.12, rotate: -3 }}
            transition={{ type: "spring", stiffness: 600, damping: 12 }}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-surface-tertiary hover:bg-interactive-active text-secondary transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </motion.button>

          <div
            className="rounded-lg overflow-hidden bg-secondary"
            style={{
              boxShadow: `inset 0 2px 6px rgba(0,0,0,0.06), inset 0 0 0 0.5px rgba(0,0,0,0.04)`,
            }}
          >
            <OdometerDisplay value={value} changeTick={changeTick} prevDigits={prevDigits} />
          </div>

          <motion.button
            onPointerDown={() => startHold(1)}
            onPointerUp={stopHold}
            onPointerLeave={stopHold}
            onClick={(e) => e.preventDefault()}
            whileTap={{ scale: 0.65, rotate: 15, y: 2 }}
            whileHover={{ scale: 1.12, rotate: 3 }}
            transition={{ type: "spring", stiffness: 600, damping: 12 }}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-surface-tertiary hover:bg-interactive-active text-secondary transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 3v8M3 7h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </motion.button>
        </motion.div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {PRESETS.map((p) => {
          const isActive = value === p;
          const pColor = digitColor(String(p).split("").map(Number)[0] ?? 0, 0);
          return (
            <motion.button
              key={p}
              onClick={() => set(p)}
              whileTap={{ scale: 0.8, rotate: Math.random() > 0.5 ? 5 : -5 }}
              whileHover={{ y: -3, scale: 1.08 }}
              transition={{ type: "spring", stiffness: 500, damping: 16 }}
              className={cn(
                "rounded-full px-3 py-1 text-xs tabular-nums transition-all duration-200 cursor-pointer font-medium",
                isActive ? "text-inverted" : "text-quaternary hover:text-secondary hover:bg-interactive-hover",
              )}
              style={
                isActive
                  ? {
                      background: pColor,
                      boxShadow: `0 2px 12px ${pColor}44`,
                    }
                  : undefined
              }
            >
              {p.toLocaleString()}
            </motion.button>
          );
        })}
        <motion.button
          onClick={() => set(Math.floor(Math.random() * 10000))}
          whileTap={{ scale: 0.6, rotate: 360 }}
          whileHover={{ y: -3, scale: 1.08 }}
          transition={{ type: "spring", stiffness: 400, damping: 16 }}
          className="rounded-full px-3 py-1 text-xs text-quaternary hover:text-secondary hover:bg-interactive-hover transition-all duration-200 cursor-pointer font-medium"
        >
          Random
        </motion.button>
      </div>
    </div>
  );
}
