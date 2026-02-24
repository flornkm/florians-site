import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

const HOLD_MS = 400;
const SP = { stiffness: 420, damping: 30, mass: 0.65 };
const SP_MENU = { stiffness: 340, damping: 26, mass: 0.6 };

const ITEMS = [
  { label: "Remove App", icon: "remove", destructive: true },
  { sep: true } as const,
  { label: "Require Face ID", icon: "faceid" },
  { label: "Edit Home Screen", icon: "edit" },
  { sep: true } as const,
  { label: "Share App", icon: "share" },
  { label: "Search", icon: "search" },
] as const;

function Icon({ name, size = 16 }: { name: string; size?: number }) {
  const sw = 1.5;
  const props = { width: size, height: size, viewBox: "0 0 18 18", fill: "none" as const };
  if (name === "remove")
    return (
      <svg {...props}>
        <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth={sw} />
        <path d="M6.5 9h5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
      </svg>
    );
  if (name === "faceid")
    return (
      <svg {...props}>
        <path d="M2.5 6V4a1.5 1.5 0 011.5-1.5h2M12 2.5h2A1.5 1.5 0 0115.5 4v2M15.5 12v2a1.5 1.5 0 01-1.5 1.5h-2M6 15.5H4A1.5 1.5 0 012.5 14v-2" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
        <circle cx="6.8" cy="7" r="0.7" fill="currentColor" />
        <circle cx="11.2" cy="7" r="0.7" fill="currentColor" />
        <path d="M7 11.5a2.5 2.5 0 004 0" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" />
      </svg>
    );
  if (name === "edit")
    return (
      <svg {...props}>
        <rect x="2.5" y="2.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth={sw} />
        <rect x="10.5" y="2.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth={sw} />
        <rect x="2.5" y="10.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth={sw} />
        <rect x="10.5" y="10.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth={sw} />
      </svg>
    );
  if (name === "share")
    return (
      <svg {...props}>
        <path d="M9 2.5v8" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
        <path d="M6.5 5L9 2.5 11.5 5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3.5 10.5v4a1.5 1.5 0 001.5 1.5h8a1.5 1.5 0 001.5-1.5v-4" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
      </svg>
    );
  if (name === "search")
    return (
      <svg {...props}>
        <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth={sw} />
        <path d="M12 12l3.5 3.5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
      </svg>
    );
  return (
    <svg {...props}>
      <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth={sw} />
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
  const sX = useSpring(relX, { stiffness: 200, damping: 24 });
  const sY = useSpring(relY, { stiffness: 200, damping: 24 });
  const shimmer = useTransform(
    [sX, sY],
    ([x, y]: number[]) =>
      `radial-gradient(circle 30px at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.06) 0%, transparent 100%)`,
  );

  const nudgeX = useMotionValue(0);
  const nudgeY = useMotionValue(0);
  const snX = useSpring(nudgeX, { stiffness: 400, damping: 30 });
  const snY = useSpring(nudgeY, { stiffness: 400, damping: 30 });

  const sc = useSpring(1, SP);
  const lft = useSpring(0, SP);
  const darkOverlay = useSpring(0, { stiffness: 300, damping: 30 });

  const bShadow = useTransform(lft, (v: number) => {
    const y1 = (1 + v * 22).toFixed(1);
    const b1 = (2 + v * 40).toFixed(1);
    const a1 = (0.04 + v * 0.1).toFixed(4);
    const y2 = (0 + v * 8).toFixed(1);
    const b2 = (1 + v * 14).toFixed(1);
    const a2 = (0.02 + v * 0.06).toFixed(4);
    return `0 ${y1}px ${b1}px rgba(0,0,0,${a1}), 0 ${y2}px ${b2}px rgba(0,0,0,${a2})`;
  });

  const iconDarken = useTransform(
    darkOverlay,
    (v: number) => `rgba(0,0,0,${(v * 0.35).toFixed(3)})`,
  );

  const clr = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const down = useCallback(() => {
    if (phase === "menu") return;
    setPhase("pressing");
    sc.set(0.9);
    darkOverlay.set(1);
    clr();
    timer.current = setTimeout(() => {
      setPhase("menu");
      sc.set(1.05);
      lft.set(1);
      darkOverlay.set(0.6);
    }, HOLD_MS);
  }, [phase, sc, lft, darkOverlay, clr]);

  const up = useCallback(() => {
    if (phase === "pressing") {
      clr();
      setPhase("idle");
      sc.set(1);
      lft.set(0);
      darkOverlay.set(0);
    }
  }, [phase, clr, sc, lft, darkOverlay]);

  const close = useCallback(() => {
    setPhase("idle");
    setHovered(null);
    sc.set(1);
    lft.set(0);
    darkOverlay.set(0);
    nudgeX.set(0);
    nudgeY.set(0);
  }, [sc, lft, darkOverlay, nudgeX, nudgeY]);

  const areaMove = useCallback(
    (e: React.MouseEvent) => {
      if (phase !== "menu" || !btnEl.current) return;
      const r = btnEl.current.getBoundingClientRect();
      nudgeX.set((e.clientX - (r.left + r.width / 2)) * 0.01);
      nudgeY.set((e.clientY - (r.top - 80)) * 0.006);
    },
    [phase, nudgeX, nudgeY],
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

  const groups: { label: string; icon: string; destructive?: boolean }[][] = [];
  let current: { label: string; icon: string; destructive?: boolean }[] = [];
  for (const item of ITEMS) {
    if ("sep" in item) {
      if (current.length) groups.push(current);
      current = [];
    } else {
      current.push(item as { label: string; icon: string; destructive?: boolean });
    }
  }
  if (current.length) groups.push(current);

  let globalIdx = 0;

  return (
    <div className="relative flex items-center justify-center select-none" onMouseMove={areaMove}>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-10 backdrop-blur-md"
            style={{ backgroundColor: "rgba(0,0,0,0.22)" }}
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      <div className="relative z-20">
        <AnimatePresence>
          {open && (
            <motion.div
              className="absolute bottom-full left-1/2 mb-3"
              style={{
                x: snX,
                y: snY,
                translateX: "-50%",
                transformOrigin: "bottom center",
              }}
              initial={{ opacity: 0, scale: 0.35, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.35, y: 16, filter: "blur(6px)" }}
              transition={{ type: "spring", ...SP_MENU }}
            >
              <div
                className={cn(
                  "overflow-hidden rounded-[14px] min-w-[220px]",
                  "bg-surface/75 dark:bg-surface-secondary/80",
                  "backdrop-blur-2xl backdrop-saturate-[1.8]",
                  "border border-primary/[0.06]",
                  "shadow-[0_12px_48px_rgba(0,0,0,0.14),0_2px_10px_rgba(0,0,0,0.06)]",
                )}
              >
                {groups.map((group, gi) => (
                  <div key={gi}>
                    {gi > 0 && <div className="h-px bg-primary/[0.08]" />}
                    {group.map((item, ii) => {
                      const idx = globalIdx++;
                      return (
                        <motion.button
                          key={item.label}
                          className={cn(
                            "flex w-full items-center gap-3 px-4 py-[9px]",
                            "text-[15px] font-normal tracking-[-0.01em]",
                            "transition-colors duration-[40ms] ease-out",
                            ii < group.length - 1 && "border-b border-primary/[0.06]",
                            item.destructive ? "text-destructive" : "text-primary",
                            hovered === idx && !item.destructive && "bg-primary/[0.08] dark:bg-white/[0.08]",
                            hovered === idx && item.destructive && "bg-primary/[0.08] dark:bg-white/[0.08]",
                          )}
                          onMouseEnter={() => setHovered(idx)}
                          onMouseLeave={() => setHovered(null)}
                          onClick={(e) => {
                            e.stopPropagation();
                            close();
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.1, delay: 0.015 * idx }}
                        >
                          <span className="flex-shrink-0 opacity-80">
                            <Icon name={item.icon} />
                          </span>
                          <span className="flex-1 text-left">{item.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          ref={btnEl}
          className={cn(
            "relative overflow-hidden touch-none",
            "w-[60px] h-[60px] rounded-[14px]",
            "bg-gradient-to-b from-blue-400 to-blue-600",
            "dark:from-blue-500 dark:to-blue-700",
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
          <div className="absolute inset-0 flex items-center justify-center text-white/90">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path
                d="M14 6v16M6 14h16"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{ background: shimmer }}
          />
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{ backgroundColor: iconDarken }}
          />
        </motion.div>
      </div>
    </div>
  );
}
