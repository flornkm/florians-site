import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const CELL = 56;
const SPRING = { stiffness: 60, damping: 8, mass: 2.8 };
const POP = { stiffness: 500, damping: 18, mass: 0.4 };
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const CANDY = [
  "#ff4757", "#ff6348", "#ffa502", "#2ed573", "#1e90ff",
  "#5352ed", "#e056fd", "#ff6b81", "#7bed9f", "#70a1ff",
];

const NEON = [
  "#ff0080", "#ff00ff", "#8000ff", "#0080ff", "#00ffff",
  "#00ff80", "#80ff00", "#ffff00", "#ff8000", "#ff0040",
];

function digitColor(d: number, offset: number = 0) {
  return CANDY[(d + offset) % CANDY.length];
}

function neonColor(i: number) {
  return NEON[i % NEON.length];
}

function MatrixRain() {
  const cols = 60;
  const items = useMemo(
    () =>
      Array.from({ length: cols }).map((_, i) => ({
        id: i,
        left: (i / cols) * 100,
        delay: Math.random() * 8,
        duration: 2 + Math.random() * 4,
        char: Math.floor(Math.random() * 10),
        size: 8 + Math.random() * 6,
        color: neonColor(Math.floor(Math.random() * NEON.length)),
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-2xl">
      {items.map((item) => (
        <motion.div
          key={item.id}
          className="absolute font-mono font-bold"
          style={{
            left: `${item.left}%`,
            fontSize: item.size,
            color: item.color,
            textShadow: `0 0 8px ${item.color}88`,
            opacity: 0.15,
          }}
          animate={{ y: ["-10%", "110%"] }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {item.char}
        </motion.div>
      ))}
    </div>
  );
}

function DigitFlash({ digit, prevDigit }: { digit: number; prevDigit: number }) {
  const changed = digit !== prevDigit;
  return (
    <AnimatePresence>
      {changed && (
        <motion.div
          key={`${digit}-${Date.now()}`}
          className="pointer-events-none absolute inset-0 z-5 rounded-sm"
          initial={{ opacity: 0.9, scale: 0.5 }}
          animate={{ opacity: 0, scale: 3.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            background: `radial-gradient(circle, ${digitColor(digit)}88 0%, transparent 70%)`,
          }}
        />
      )}
    </AnimatePresence>
  );
}

function RollingSpark({ digit, springY }: { digit: number; springY: ReturnType<typeof useSpring> }) {
  const velocity = useTransform(springY, () => Math.abs(springY.getVelocity()));
  const sparkOpacity = useTransform(velocity, [0, 500, 3000], [0, 0.5, 1]);
  const sparkScale = useTransform(velocity, [0, 500, 3000], [0.5, 1.5, 3]);
  const sparkColor = digitColor(digit, 2);

  return (
    <>
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-1.5"
        style={{
          opacity: sparkOpacity,
          scaleX: sparkScale,
          background: `linear-gradient(90deg, transparent, ${sparkColor}, transparent)`,
          filter: "blur(2px)",
        }}
      />
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-1.5"
        style={{
          opacity: sparkOpacity,
          scaleX: sparkScale,
          background: `linear-gradient(90deg, transparent, ${sparkColor}88, transparent)`,
          filter: "blur(2px)",
        }}
      />
    </>
  );
}

function DrunkDigit({
  d,
  isActive,
  color,
  changeTick,
}: {
  d: number;
  isActive: boolean;
  color: string;
  changeTick: number;
}) {
  return (
    <div className="flex items-center justify-center" style={{ height: CELL }}>
      <motion.span
        className="text-2xl font-black tabular-nums select-none"
        animate={
          isActive
            ? {
                scale: [1, 1.5, 1],
                rotate: [0, (Math.random() - 0.5) * 30, 0],
                y: [0, -3, 0],
              }
            : {}
        }
        transition={{ duration: 0.4, ease: "easeOut" }}
        key={`${d}-${changeTick}`}
        style={{
          color: isActive ? color : "var(--text-quaternary)",
          textShadow: isActive
            ? `0 0 30px ${color}, 0 0 60px ${color}66, 0 0 90px ${color}33`
            : "none",
          opacity: isActive ? 1 : 0.15,
        }}
      >
        {d}
      </motion.span>
    </div>
  );
}

function DigitGhost({ digit, color, id }: { digit: number; color: string; id: number }) {
  const angle = Math.random() * Math.PI * 2;
  const dist = 60 + Math.random() * 120;
  return (
    <motion.div
      key={id}
      className="pointer-events-none absolute z-50 text-2xl font-black tabular-nums select-none"
      style={{ left: "50%", top: "50%", color, textShadow: `0 0 20px ${color}` }}
      initial={{ opacity: 0.8, scale: 1, x: 0, y: 0 }}
      animate={{
        opacity: 0,
        scale: [1, 2.5],
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        rotate: (Math.random() - 0.5) * 720,
      }}
      transition={{ duration: 0.9, ease: "easeOut" }}
    >
      {digit}
    </motion.div>
  );
}

function Drum({
  digit,
  index,
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
  const glowColor = useTransform(hue, (h) => `hsla(${h}, 100%, 55%, 0.2)`);

  useEffect(() => {
    mv.set(-digit * CELL);
  }, [digit, mv]);

  const drumColor = digitColor(digit, index);

  return (
    <motion.div
      className="relative overflow-hidden"
      style={{ height: CELL, width: 42 }}
      initial={{ opacity: 0, scaleY: 0, scaleX: 0.2, filter: "blur(16px)", rotate: -30 }}
      animate={{
        opacity: 1,
        scaleY: 1,
        scaleX: 1,
        filter: "blur(0px)",
        rotate: 0,
        skewX: [0, (Math.random() - 0.5) * 8, 0],
      }}
      exit={{ opacity: 0, scaleY: 0, scaleX: 0.2, filter: "blur(16px)", rotate: 30 }}
      transition={{ type: "spring", ...POP, delay: index * 0.04 }}
    >
      <DigitFlash digit={digit} prevDigit={prevDigit} />
      <RollingSpark digit={digit} springY={spring} />

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
          <DrunkDigit
            key={d}
            d={d}
            isActive={d === digit}
            color={drumColor}
            changeTick={changeTick}
          />
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
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        style={{ opacity: 0.8 }}
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
            animate={{ opacity: 1, width: 20, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, width: 0, rotate: 180, scale: 0 }}
            transition={{ type: "spring", ...POP }}
            className="flex items-center justify-center overflow-hidden"
          >
            <span className="text-2xl font-black select-none" style={{ color: CANDY[0] }}>
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
                    className="pointer-events-none absolute left-0 top-[8%] bottom-[8%] w-px z-20"
                    style={{
                      background: `linear-gradient(to bottom, transparent, ${digitColor(d, i)}66, transparent)`,
                    }}
                  />
                )}
                <Drum
                  digit={d}
                  index={i}
                  total={digitArr.length}
                  prevDigit={pd}
                  changeTick={changeTick}
                />
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
  x, y, delay, color, size, shape,
}: {
  x: number; y: number; delay: number; color: string; size: number;
  shape: "circle" | "star" | "square" | "ring";
}) {
  return (
    <motion.div
      className="pointer-events-none absolute"
      style={{ left: "50%", top: "50%" }}
      initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
      animate={{
        opacity: [1, 0.9, 0],
        scale: [0, 2, 0.3],
        x,
        y: [y * 0.3, y, y + 40],
        rotate: [0, 360 + Math.random() * 720],
      }}
      transition={{ duration: 1.4, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
        {shape === "circle" && <circle cx="6" cy="6" r="5" fill={color} />}
        {shape === "star" && (
          <path d="M6 0L7.4 4.1L12 4.6L8.5 7.7L9.5 12L6 9.7L2.5 12L3.5 7.7L0 4.6L4.6 4.1Z" fill={color} />
        )}
        {shape === "square" && <rect x="1" y="1" width="10" height="10" rx="2" fill={color} />}
        {shape === "ring" && <circle cx="6" cy="6" r="4" stroke={color} strokeWidth="2" fill="none" />}
      </svg>
    </motion.div>
  );
}

function Burst({ id, intensity }: { id: number; intensity: number }) {
  const count = Math.min(48, 12 + intensity * 6);
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
        const dist = 40 + Math.random() * (70 + intensity * 25);
        const shapes = ["circle", "star", "square", "ring"] as const;
        return {
          id: i,
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist - 20,
          delay: Math.random() * 0.15,
          color: NEON[Math.floor(Math.random() * NEON.length)],
          size: 4 + Math.random() * 8,
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

function Confetti({ id, count }: { id: number; count: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 300,
        color: NEON[Math.floor(Math.random() * NEON.length)],
        size: 3 + Math.random() * 5,
        delay: Math.random() * 0.3,
        rotation: Math.random() * 1080,
        shape: Math.random() > 0.5 ? ("circle" as const) : ("square" as const),
      })),
    [count],
  );

  return (
    <>
      {pieces.map((p) => (
        <motion.div
          key={`${id}-c-${p.id}`}
          className="pointer-events-none absolute"
          style={{ left: "50%", top: "50%" }}
          initial={{ opacity: 1, scale: 0, x: 0, y: 0, rotate: 0 }}
          animate={{
            opacity: [1, 1, 0],
            scale: [0, 1.5, 0.5],
            x: p.x,
            y: [-80 - Math.random() * 60, 120 + Math.random() * 80],
            rotate: p.rotation,
          }}
          transition={{ duration: 1.8, delay: p.delay, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            style={{
              width: p.size,
              height: p.size,
              background: p.color,
              borderRadius: p.shape === "circle" ? "50%" : 1,
              boxShadow: `0 0 6px ${p.color}`,
            }}
          />
        </motion.div>
      ))}
    </>
  );
}

function Lightning({ id }: { id: number }) {
  const bolts = useMemo(
    () =>
      Array.from({ length: 3 + Math.floor(Math.random() * 4) }).map((_, i) => {
        const points: string[] = [];
        let x = -20 + Math.random() * 40;
        let y = -30;
        for (let j = 0; j < 6; j++) {
          points.push(`${x},${y}`);
          x += (Math.random() - 0.5) * 30;
          y += 10 + Math.random() * 8;
        }
        return {
          id: i,
          d: `M${points.join(" L")}`,
          color: neonColor(Math.floor(Math.random() * NEON.length)),
          delay: Math.random() * 0.15,
        };
      }),
    [],
  );

  return (
    <>
      {bolts.map((b) => (
        <motion.svg
          key={`${id}-l-${b.id}`}
          className="pointer-events-none absolute z-50"
          style={{ left: "50%", top: "50%", overflow: "visible" }}
          width="1"
          height="1"
          viewBox="0 0 1 1"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.3, 0.9, 0] }}
          transition={{ duration: 0.3, delay: b.delay }}
        >
          <path
            d={b.d}
            stroke={b.color}
            strokeWidth="2"
            fill="none"
            filter={`drop-shadow(0 0 6px ${b.color})`}
          />
        </motion.svg>
      ))}
    </>
  );
}

function Firework({ id, startX }: { id: number; startX: number }) {
  const color = neonColor(Math.floor(Math.random() * NEON.length));
  const sparks = useMemo(
    () =>
      Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const dist = 30 + Math.random() * 50;
        return {
          id: i,
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          color: neonColor(Math.floor(Math.random() * NEON.length)),
        };
      }),
    [],
  );

  return (
    <motion.div
      className="pointer-events-none absolute z-50"
      style={{ left: "50%", top: "50%" }}
      initial={{ x: startX, y: 0, opacity: 1 }}
      animate={{ y: -140 - Math.random() * 80, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.div
        style={{ width: 4, height: 4, borderRadius: "50%", background: color, boxShadow: `0 0 8px ${color}` }}
        initial={{ scale: 1 }}
        animate={{ scale: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      />
      {sparks.map((s) => (
        <motion.div
          key={`${id}-fw-${s.id}`}
          className="absolute"
          style={{ left: 0, top: 0 }}
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            x: s.x,
            y: [0, s.y, s.y + 30],
          }}
          transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
        >
          <div
            style={{
              width: 3,
              height: 3,
              borderRadius: "50%",
              background: s.color,
              boxShadow: `0 0 8px ${s.color}`,
            }}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

function ShockwaveRing({ id, color }: { id: number; color: string }) {
  return (
    <motion.div
      key={id}
      className="pointer-events-none absolute z-40 rounded-full"
      style={{
        left: "50%",
        top: "50%",
        width: 80,
        height: 80,
        marginLeft: -40,
        marginTop: -40,
        border: `2px solid ${color}`,
        boxShadow: `0 0 20px ${color}66, inset 0 0 20px ${color}33`,
      }}
      initial={{ opacity: 0.9, scale: 0.3 }}
      animate={{ opacity: 0, scale: 5 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    />
  );
}

function SoundWaves({ id }: { id: number }) {
  const waves = useMemo(
    () =>
      Array.from({ length: 5 }).map((_, i) => ({
        id: i,
        color: neonColor(Math.floor(Math.random() * NEON.length)),
        delay: i * 0.08,
        scale: 3 + i * 1.5,
      })),
    [],
  );

  return (
    <>
      {waves.map((w) => (
        <motion.div
          key={`${id}-sw-${w.id}`}
          className="pointer-events-none absolute z-30 rounded-full"
          style={{
            left: "50%",
            top: "50%",
            width: 40,
            height: 40,
            marginLeft: -20,
            marginTop: -20,
            border: `1px solid ${w.color}`,
          }}
          initial={{ opacity: 0.6, scale: 0.5 }}
          animate={{ opacity: 0, scale: w.scale }}
          transition={{ duration: 0.7, delay: w.delay, ease: "easeOut" }}
        />
      ))}
    </>
  );
}

function Tornado({ active }: { active: boolean }) {
  const orbiters = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, i) => ({
        id: i,
        color: neonColor(i),
        size: 2 + Math.random() * 4,
        offset: (i / 24) * 360,
        radiusX: 80 + Math.random() * 40,
        radiusY: 40 + Math.random() * 20,
        speed: 2 + Math.random() * 3,
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute -inset-8 z-5">
      {orbiters.map((o) => (
        <motion.div
          key={o.id}
          className="absolute rounded-full"
          style={{
            width: o.size,
            height: o.size,
            background: o.color,
            boxShadow: `0 0 8px ${o.color}`,
            left: "50%",
            top: "50%",
          }}
          animate={{
            x: [
              Math.cos((o.offset * Math.PI) / 180) * o.radiusX,
              Math.cos(((o.offset + 180) * Math.PI) / 180) * o.radiusX,
              Math.cos((o.offset * Math.PI) / 180) * o.radiusX,
            ],
            y: [
              Math.sin((o.offset * Math.PI) / 180) * o.radiusY,
              Math.sin(((o.offset + 180) * Math.PI) / 180) * o.radiusY,
              Math.sin((o.offset * Math.PI) / 180) * o.radiusY,
            ],
            opacity: active ? [0.3, 1, 0.3] : 0.2,
            scale: active ? [1, 1.8, 1] : 1,
          }}
          transition={{
            duration: o.speed,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

function Laser({ id }: { id: number }) {
  const y = (Math.random() - 0.5) * 60;
  const color = neonColor(Math.floor(Math.random() * NEON.length));
  const fromLeft = Math.random() > 0.5;

  return (
    <motion.div
      key={id}
      className="pointer-events-none absolute z-50"
      style={{
        left: fromLeft ? "-100%" : "100%",
        top: "50%",
        width: "400%",
        height: 2,
        marginTop: y,
        background: `linear-gradient(${fromLeft ? "90deg" : "270deg"}, transparent, ${color}, ${color}, transparent)`,
        boxShadow: `0 0 12px ${color}, 0 0 24px ${color}66`,
      }}
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: [0, 1, 1, 0], scaleX: [0, 1, 1, 0] }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    />
  );
}

function NuclearFlash({ id, color }: { id: number; color: string }) {
  return (
    <motion.div
      key={id}
      className="pointer-events-none absolute -inset-12 z-60 rounded-3xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0.8, 1, 0.5, 0] }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{
        background: `radial-gradient(circle at 50% 50%, white 0%, ${color}cc 30%, ${color}44 60%, transparent 80%)`,
        filter: "blur(4px)",
      }}
    />
  );
}

function MouseTrail({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const [trail, setTrail] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handle = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setTrail((t) => [
        ...t.slice(-40),
        { id: idRef.current++, x, y, color: neonColor(idRef.current % NEON.length) },
      ]);
    };
    el.addEventListener("pointermove", handle);
    return () => el.removeEventListener("pointermove", handle);
  }, [containerRef]);

  return (
    <>
      {trail.map((dot) => (
        <motion.div
          key={dot.id}
          className="pointer-events-none absolute z-30 rounded-full"
          style={{
            left: dot.x,
            top: dot.y,
            width: 6,
            height: 6,
            background: dot.color,
            boxShadow: `0 0 12px ${dot.color}`,
          }}
          initial={{ opacity: 0.9, scale: 1.5 }}
          animate={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      ))}
    </>
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
      className="pointer-events-none absolute -inset-6 z-0 rounded-3xl"
      animate={{
        background: [
          `radial-gradient(ellipse at 20% 50%, ${c1}30 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, ${c3}30 0%, transparent 50%)`,
          `radial-gradient(ellipse at 50% 20%, ${c2}35 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, ${c1}35 0%, transparent 50%)`,
          `radial-gradient(ellipse at 80% 50%, ${c3}30 0%, transparent 50%), radial-gradient(ellipse at 20% 50%, ${c2}30 0%, transparent 50%)`,
        ],
      }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      style={{ filter: "blur(16px)" }}
    />
  );
}

function RainbowBar() {
  return (
    <motion.div
      className="absolute bottom-0 left-2 right-2 h-0.5 z-30 rounded-full"
      animate={{
        background: [
          `linear-gradient(90deg, ${NEON[0]}, ${NEON[2]}, ${NEON[4]}, ${NEON[6]}, ${NEON[8]})`,
          `linear-gradient(90deg, ${NEON[5]}, ${NEON[7]}, ${NEON[9]}, ${NEON[1]}, ${NEON[3]})`,
          `linear-gradient(90deg, ${NEON[0]}, ${NEON[2]}, ${NEON[4]}, ${NEON[6]}, ${NEON[8]})`,
        ],
      }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      style={{ opacity: 0.7 }}
    />
  );
}

function PulseRing({ id, color }: { id: number; color: string }) {
  return (
    <motion.div
      key={id}
      className="pointer-events-none absolute -inset-1 z-20 rounded-xl"
      initial={{ opacity: 0.6, scale: 1 }}
      animate={{ opacity: 0, scale: 1.4 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{
        border: `1.5px solid ${color}`,
        boxShadow: `0 0 16px ${color}44`,
      }}
    />
  );
}

function ScreenShake({ intensity, children }: { intensity: number; children: React.ReactNode }) {
  const [shake, setShake] = useState({ x: 0, y: 0, r: 0 });

  useEffect(() => {
    if (intensity === 0) return;
    const shakes = intensity > 3 ? 8 : 5;
    let i = 0;
    const interval = setInterval(() => {
      if (i >= shakes) {
        setShake({ x: 0, y: 0, r: 0 });
        clearInterval(interval);
        return;
      }
      const mag = intensity * (1 - i / shakes);
      setShake({
        x: (Math.random() - 0.5) * mag * 6,
        y: (Math.random() - 0.5) * mag * 4,
        r: (Math.random() - 0.5) * mag * 2,
      });
      i++;
    }, 35);
    return () => clearInterval(interval);
  }, [intensity]);

  return (
    <motion.div
      animate={{ x: shake.x, y: shake.y, rotate: shake.r }}
      transition={{ duration: 0.04, ease: "linear" }}
    >
      {children}
    </motion.div>
  );
}

export function NumberTickerDemo() {
  const [value, setValue] = useState(1234);
  const [burstId, setBurstId] = useState(0);
  const [burstIntensity, setBurstIntensity] = useState(1);
  const [changeTick, setChangeTick] = useState(0);
  const [prevDigits, setPrevDigits] = useState<number[]>([1, 2, 3, 4]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const dxStart = useRef(0);
  const dvStart = useRef(0);
  const prev = useRef(1234);
  const [tilt, setTilt] = useState(0);
  const [squeeze, setSqueeze] = useState(false);
  const [wobble, setWobble] = useState({ x: 0, y: 0 });
  const [shakeIntensity, setShakeIntensity] = useState(0);
  const shakeCounter = useRef(0);
  const [pulseId, setPulseId] = useState(0);
  const [confettiId, setConfettiId] = useState(0);
  const [confettiCount, setConfettiCount] = useState(0);
  const [lightningId, setLightningId] = useState(0);
  const [fireworks, setFireworks] = useState<{ id: number; x: number }[]>([]);
  const fwIdRef = useRef(0);
  const [shockwaves, setShockwaves] = useState<{ id: number; color: string }[]>([]);
  const swIdRef = useRef(0);
  const [soundWaveId, setSoundWaveId] = useState(0);
  const [lasers, setLasers] = useState<number[]>([]);
  const laserIdRef = useRef(0);
  const [nuclearId, setNuclearId] = useState(0);
  const [ghosts, setGhosts] = useState<{ id: number; digit: number; color: string }[]>([]);
  const ghostIdRef = useRef(0);
  const [barrelRoll, setBarrelRoll] = useState(0);
  const [tornadoActive, setTornadoActive] = useState(false);
  const [bassDrop, setBassDrop] = useState(false);

  const set = useCallback((n: number) => {
    const c = Math.min(99999, Math.max(-9999, n));
    const diff = c - prev.current;
    const absDiff = Math.abs(diff);
    const ol = String(Math.abs(prev.current)).length;
    const nl = String(Math.abs(c)).length;

    setPrevDigits(String(Math.abs(prev.current)).split("").map(Number));
    setChangeTick((t) => t + 1);
    setPulseId((p) => p + 1);

    const prevDigitArr = String(Math.abs(prev.current)).split("").map(Number);
    const newGhosts = prevDigitArr.map((d, i) => ({
      id: ghostIdRef.current++,
      digit: d,
      color: digitColor(d, i),
    }));
    setGhosts((g) => [...g.slice(-30), ...newGhosts]);

    setShakeIntensity(0);
    shakeCounter.current++;
    const shakeMag = Math.min(8, Math.ceil(absDiff / 15));
    if (shakeMag > 0) {
      requestAnimationFrame(() => setShakeIntensity(shakeMag));
    }

    const tiltAmount = Math.max(-25, Math.min(25, diff * 1.5));
    setTilt(tiltAmount);
    setTimeout(() => setTilt(0), 160);

    setWobble({
      x: (Math.random() - 0.5) * Math.min(10, absDiff * 0.4),
      y: (Math.random() - 0.5) * Math.min(8, absDiff * 0.3),
    });
    setTimeout(() => setWobble({ x: 0, y: 0 }), 180);

    if (nl !== ol && nl > 1) {
      setBurstIntensity(Math.min(8, Math.abs(nl - ol) * 3));
      setBurstId((b) => b + 1);
    } else if (absDiff > 30) {
      setBurstIntensity(Math.min(8, Math.ceil(absDiff / 60)));
      setBurstId((b) => b + 1);
    }

    if (absDiff > 10) {
      setSqueeze(true);
      setTimeout(() => setSqueeze(false), 220);
    }

    if (absDiff > 5) {
      setConfettiCount(Math.min(50, 6 + absDiff * 2));
      setConfettiId((ci) => ci + 1);
    }

    if (absDiff > 15) {
      setLightningId((l) => l + 1);
    }

    if (absDiff > 20) {
      setSoundWaveId((s) => s + 1);
    }

    if (absDiff > 40) {
      const fwCount = Math.min(5, Math.ceil(absDiff / 80));
      const newFw = Array.from({ length: fwCount }).map(() => ({
        id: fwIdRef.current++,
        x: (Math.random() - 0.5) * 100,
      }));
      setFireworks((fw) => [...fw.slice(-8), ...newFw]);
    }

    if (absDiff > 25) {
      const newSw = {
        id: swIdRef.current++,
        color: neonColor(Math.floor(Math.random() * NEON.length)),
      };
      setShockwaves((sw) => [...sw.slice(-6), newSw]);
    }

    if (absDiff > 30 && Math.random() < 0.5) {
      setLasers((l) => [...l.slice(-4), laserIdRef.current++]);
    }

    setTornadoActive(true);
    setTimeout(() => setTornadoActive(false), 600);

    if (c % 10 === 0 && c !== 0) {
      setBassDrop(true);
      setTimeout(() => setBassDrop(false), 250);
    }

    if (c % 1000 === 0 && c !== 0) {
      setNuclearId((ni) => ni + 1);
      setShakeIntensity(10);
      setBurstIntensity(8);
      setBurstId((b) => b + 1);
      setConfettiCount(60);
      setConfettiId((ci) => ci + 1);
    }

    if (absDiff > 200) {
      setBarrelRoll((r) => r + 360);
    }

    prev.current = c;
    setValue(c);
  }, []);

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
        set(prev.current + 1);
      }
      if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
        e.preventDefault();
        set(prev.current - 1);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [set]);

  const heldRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heldValue = useRef(value);
  heldValue.current = value;

  const startHold = useCallback(
    (dir: 1 | -1) => {
      set(heldValue.current + dir);
      let acc = 1;
      const tick = () => {
        acc = Math.min(acc + 3, 100);
        set(heldValue.current + dir * acc);
        heldRef.current = setTimeout(tick, Math.max(15, 100 - acc * 2));
      };
      heldRef.current = setTimeout(tick, 300);
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
    <div
      ref={outerRef}
      className="relative flex flex-col items-center gap-5 w-full h-full justify-center select-none overflow-hidden"
    >
      <MatrixRain />

      <ScreenShake intensity={shakeIntensity} key={shakeCounter.current}>
        <div className="relative">
          <AuraGlow value={value} activeColor={activeColor} />
          <Tornado active={tornadoActive} />

          <MouseTrail containerRef={outerRef} />

          <motion.div
            animate={{ rotateX: barrelRoll }}
            transition={{ type: "spring", stiffness: 80, damping: 12 }}
            style={{ perspective: 800 }}
          >
            <motion.div
              ref={wrapRef}
              className={cn(
                "relative flex items-center gap-2.5 rounded-xl border border-primary bg-primary p-2",
                dragging ? "cursor-grabbing" : "cursor-grab",
              )}
              animate={{
                rotate: tilt,
                scaleX: squeeze ? (bassDrop ? 1.15 : 1.1) : bassDrop ? 1.08 : 1,
                scaleY: squeeze ? (bassDrop ? 0.85 : 0.9) : bassDrop ? 0.92 : 1,
                x: wobble.x,
                y: wobble.y,
              }}
              transition={{ type: "spring", stiffness: 500, damping: 14 }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              style={{
                touchAction: "none",
                boxShadow: `0 0 20px ${activeColor}22, 0 4px 16px rgba(0,0,0,0.06)`,
              }}
            >
              <AnimatePresence>
                {nuclearId > 0 && <NuclearFlash key={nuclearId} id={nuclearId} color={activeColor} />}
              </AnimatePresence>

              <AnimatePresence>
                {burstId > 0 && <Burst key={burstId} id={burstId} intensity={burstIntensity} />}
              </AnimatePresence>

              <AnimatePresence>
                {confettiId > 0 && <Confetti key={confettiId} id={confettiId} count={confettiCount} />}
              </AnimatePresence>

              <AnimatePresence>
                {lightningId > 0 && <Lightning key={lightningId} id={lightningId} />}
              </AnimatePresence>

              <AnimatePresence>
                {fireworks.map((fw) => (
                  <Firework key={fw.id} id={fw.id} startX={fw.x} />
                ))}
              </AnimatePresence>

              <AnimatePresence>
                {shockwaves.map((sw) => (
                  <ShockwaveRing key={sw.id} id={sw.id} color={sw.color} />
                ))}
              </AnimatePresence>

              <AnimatePresence>
                {soundWaveId > 0 && <SoundWaves key={soundWaveId} id={soundWaveId} />}
              </AnimatePresence>

              <AnimatePresence>
                {lasers.map((lid) => (
                  <Laser key={lid} id={lid} />
                ))}
              </AnimatePresence>

              <AnimatePresence>
                {ghosts.slice(-15).map((g) => (
                  <DigitGhost key={g.id} id={g.id} digit={g.digit} color={g.color} />
                ))}
              </AnimatePresence>

              <AnimatePresence>
                {pulseId > 0 && <PulseRing key={pulseId} id={pulseId} color={activeColor} />}
              </AnimatePresence>

              <RainbowBar />

              <motion.button
                onPointerDown={() => startHold(-1)}
                onPointerUp={stopHold}
                onPointerLeave={stopHold}
                onClick={(e) => e.preventDefault()}
                whileTap={{ scale: 0.6, rotate: -18, y: 3 }}
                whileHover={{ scale: 1.15, rotate: -5 }}
                transition={{ type: "spring", stiffness: 600, damping: 10 }}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-surface-tertiary hover:bg-interactive-active text-secondary transition-colors cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </motion.button>

              <div
                className="relative rounded-lg overflow-hidden bg-secondary"
                style={{
                  boxShadow: `inset 0 2px 8px rgba(0,0,0,0.08), inset 0 0 0 0.5px rgba(0,0,0,0.05), 0 0 30px ${activeColor}15`,
                }}
              >
                <OdometerDisplay value={value} changeTick={changeTick} prevDigits={prevDigits} />
              </div>

              <motion.button
                onPointerDown={() => startHold(1)}
                onPointerUp={stopHold}
                onPointerLeave={stopHold}
                onClick={(e) => e.preventDefault()}
                whileTap={{ scale: 0.6, rotate: 18, y: 3 }}
                whileHover={{ scale: 1.15, rotate: 5 }}
                transition={{ type: "spring", stiffness: 600, damping: 10 }}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-surface-tertiary hover:bg-interactive-active text-secondary transition-colors cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </ScreenShake>

      <div className="flex flex-wrap items-center justify-center gap-1.5 z-10">
        {PRESETS.map((p) => {
          const isActive = value === p;
          const pColor = digitColor(String(p).split("").map(Number)[0] ?? 0, 0);
          return (
            <motion.button
              key={p}
              onClick={() => set(p)}
              whileTap={{ scale: 0.75, rotate: Math.random() > 0.5 ? 8 : -8 }}
              whileHover={{ y: -4, scale: 1.12 }}
              transition={{ type: "spring", stiffness: 500, damping: 14 }}
              className={cn(
                "rounded-full px-3 py-1 text-xs tabular-nums transition-all duration-200 cursor-pointer font-medium",
                isActive ? "text-inverted" : "text-quaternary hover:text-secondary hover:bg-interactive-hover",
              )}
              style={
                isActive
                  ? {
                      background: pColor,
                      boxShadow: `0 2px 16px ${pColor}55`,
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
          whileTap={{ scale: 0.5, rotate: 360 }}
          whileHover={{ y: -4, scale: 1.12 }}
          transition={{ type: "spring", stiffness: 400, damping: 14 }}
          className="rounded-full px-3 py-1 text-xs text-quaternary hover:text-secondary hover:bg-interactive-hover transition-all duration-200 cursor-pointer font-medium"
        >
          Random
        </motion.button>
      </div>
    </div>
  );
}
