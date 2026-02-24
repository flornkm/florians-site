import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

const HOLD_MS = 420;
const SP = { stiffness: 400, damping: 28, mass: 0.7 };
const SP_POP = { stiffness: 280, damping: 19, mass: 0.55 };

const ITEMS = [
  { label: "Copy", icon: "copy" },
  { label: "Share", icon: "share" },
  { label: "Delete", icon: "trash" },
] as const;

function Icon({ name }: { name: string }) {
  const sw = 1.35;
  if (name === "copy")
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="5" y="1.5" width="8.5" height="8.5" rx="2" stroke="currentColor" strokeWidth={sw} />
        <path d="M2.5 6v6a2 2 0 002 2h6" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
      </svg>
    );
  if (name === "share")
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2v8" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
        <path d="M5.5 4.5L8 2l2.5 2.5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 9.5v3a2 2 0 002 2h6a2 2 0 002-2v-3" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
      </svg>
    );
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 4h10" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
      <path d="M5.5 4l.3-1.3a1 1 0 01.97-.7h2.46a1 1 0 01.97.7L10.5 4" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 4v8.5a1.5 1.5 0 001.5 1.5h5a1.5 1.5 0 001.5-1.5V4" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
      <path d="M6.5 7v3.5M9.5 7v3.5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
    </svg>
  );
}

type Phase = "idle" | "pressing" | "menu";

export function IosContextMenuDemo() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [hovered, setHovered] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const btnEl = useRef<HTMLDivElement>(null);

  const relX = useMotionValue(0.5);
  const relY = useMotionValue(0.5);
  const sX = useSpring(relX, { stiffness: 220, damping: 26 });
  const sY = useSpring(relY, { stiffness: 220, damping: 26 });
  const shimmer = useTransform(
    [sX, sY],
    ([x, y]: number[]) =>
      `radial-gradient(circle 34px at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.045) 0%, transparent 100%)`,
  );

  const nX = useMotionValue(0);
  const nY = useMotionValue(0);
  const snX = useSpring(nX, { stiffness: 420, damping: 28 });
  const snY = useSpring(nY, { stiffness: 420, damping: 28 });

  const sc = useSpring(1, SP);
  const lft = useSpring(0, SP);

  const bShadow = useTransform(lft, (v: number) => {
    const y1 = (1 + v * 20).toFixed(1);
    const b1 = (2 + v * 36).toFixed(1);
    const a1 = (0.035 + v * 0.09).toFixed(4);
    const y2 = (0 + v * 7).toFixed(1);
    const b2 = (1 + v * 12).toFixed(1);
    const a2 = (0.02 + v * 0.05).toFixed(4);
    return `0 ${y1}px ${b1}px rgba(0,0,0,${a1}), 0 ${y2}px ${b2}px rgba(0,0,0,${a2})`;
  });

  const clr = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const down = useCallback(() => {
    if (phase === "menu") return;
    setPhase("pressing");
    sc.set(0.92);
    clr();
    timer.current = setTimeout(() => {
      setPhase("menu");
      sc.set(1.04);
      lft.set(1);
    }, HOLD_MS);
  }, [phase, sc, lft, clr]);

  const up = useCallback(() => {
    if (phase === "pressing") {
      clr();
      setPhase("idle");
      sc.set(1);
      lft.set(0);
    }
  }, [phase, clr, sc, lft]);

  const close = useCallback(() => {
    setPhase("idle");
    setHovered(null);
    sc.set(1);
    lft.set(0);
    nX.set(0);
    nY.set(0);
  }, [sc, lft, nX, nY]);

  const areaMove = useCallback(
    (e: React.MouseEvent) => {
      if (phase !== "menu" || !btnEl.current) return;
      const r = btnEl.current.getBoundingClientRect();
      nX.set((e.clientX - (r.left + r.width / 2)) * 0.015);
      nY.set((e.clientY - (r.top - 60)) * 0.01);
    },
    [phase, nX, nY],
  );

  const btnMove = useCallback(
    (e: React.MouseEvent) => {
      if (!btnEl.current || phase === "menu") return;
      const r = btnEl.current.getBoundingClientRect();
      relX.set((e.clientX - r.left) / r.width);
      relY.set((e.clientY - r.top) / r.height);
    },
    [relX, relY, phase],
  );

  useEffect(() => clr, [clr]);

  const open = phase === "menu";

  return (
    <div className="relative flex items-center justify-center select-none" onMouseMove={areaMove}>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-10 bg-black/20 backdrop-blur-[2px]"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      <div className="relative z-20">
        <AnimatePresence>
          {open && (
            <motion.div
              className="absolute bottom-full left-1/2 mb-2.5 flex gap-1.5"
              style={{ x: snX, y: snY, translateX: "-50%" }}
              initial={{ opacity: 0, scale: 0.3, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.55, y: 14 }}
              transition={{ type: "spring", ...SP_POP }}
            >
              {ITEMS.map((item, i) => (
                <motion.button
                  key={item.label}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 rounded-[14px] min-w-[64px] px-3.5 py-2.5",
                    "border backdrop-blur-2xl backdrop-saturate-150",
                    "transition-[background,border-color,box-shadow] duration-75",
                    hovered === i
                      ? "bg-surface-tertiary/95 border-secondary/40 text-primary"
                      : "bg-surface/55 border-primary/15 text-secondary",
                  )}
                  style={{
                    boxShadow:
                      hovered === i
                        ? "0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.12)"
                        : "0 1px 3px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.06)",
                  }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    close();
                  }}
                  initial={{ opacity: 0, y: 14, scale: 0.55 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    type: "spring",
                    ...SP_POP,
                    delay: 0.02 + i * 0.035,
                  }}
                  whileHover={{ scale: 1.06, y: -1.5 }}
                  whileTap={{ scale: 0.92 }}
                >
                  <Icon name={item.icon} />
                  <span className="text-[10px] font-medium leading-none mt-0.5">{item.label}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          ref={btnEl}
          className={cn(
            "relative w-[60px] h-[60px] rounded-[16px] bg-surface border border-primary overflow-hidden touch-none",
            open ? "cursor-default" : "cursor-pointer",
          )}
          style={{ scale: sc, boxShadow: bShadow }}
          onPointerDown={down}
          onPointerUp={up}
          onPointerLeave={() => {
            if (phase === "pressing") up();
          }}
          onPointerCancel={up}
          onMouseMove={btnMove}
        >
          <div className="absolute inset-0 flex items-center justify-center text-quaternary">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="3" width="14" height="14" rx="3.5" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="7.2" cy="10" r="0.85" fill="currentColor" />
              <circle cx="10" cy="10" r="0.85" fill="currentColor" />
              <circle cx="12.8" cy="10" r="0.85" fill="currentColor" />
            </svg>
          </div>
          <motion.div className="pointer-events-none absolute inset-0" style={{ background: shimmer }} />
        </motion.div>
      </div>
    </div>
  );
}
