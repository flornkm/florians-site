import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

const spring = { type: "spring" as const, stiffness: 500, damping: 28 };
const softSpring = { type: "spring" as const, stiffness: 300, damping: 24 };

function Sun({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function Cloud({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 19H9.5A7.5 7.5 0 0 1 9.5 4a7.46 7.46 0 0 1 5.25 2.15A5.5 5.5 0 1 1 17.5 19z" />
    </svg>
  );
}

function Drop({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  );
}

function Umbrella({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v1M12 15v5a2 2 0 0 0 4 0" />
      <path d="M22 13a10 10 0 0 0-20 0z" />
    </svg>
  );
}

function Heart({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function Music({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function Star({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function Sparkle({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z" />
    </svg>
  );
}

function Zap({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function Shield({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function Playlist({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15V6M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
      <path d="M2 8h12M2 12h8M2 16h6" />
    </svg>
  );
}

function RainCloud({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 17H9.5A7.5 7.5 0 0 1 9.5 2a7.46 7.46 0 0 1 5.25 2.15A5.5 5.5 0 1 1 17.5 17z" />
      <path d="M8 19v2M12 19v2M16 19v2" />
    </svg>
  );
}

function Trophy({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2" />
      <path d="M6 3h12v6a6 6 0 0 1-12 0V3zM12 15v3M8 21h8M10 18h4" />
    </svg>
  );
}

const COMBINATIONS = [
  { inputs: [Sun, Cloud, Drop], output: RainCloud, label: "weather" },
  { inputs: [Heart, Music, Star], output: Playlist, label: "playlist" },
  { inputs: [Zap, Shield, Sparkle], output: Trophy, label: "achievement" },
];

export default function IconGeneratorDemo() {
  const [combo, setCombo] = useState(0);
  const [phase, setPhase] = useState<"idle" | "shuffling" | "result">("idle");
  const [shuffleIcons, setShuffleIcons] = useState<number[]>([0, 0, 0]);
  const shuffleRef = useRef<ReturnType<typeof setInterval>[]>([]);
  const current = COMBINATIONS[combo];

  const allIcons = [Sun, Cloud, Drop, Heart, Music, Star, Zap, Shield, Sparkle, Umbrella];

  const clearIntervals = useCallback(() => {
    shuffleRef.current.forEach(clearInterval);
    shuffleRef.current = [];
  }, []);

  useEffect(() => {
    return clearIntervals;
  }, [clearIntervals]);

  const generate = useCallback(() => {
    if (phase === "shuffling") return;
    setPhase("shuffling");

    const nextCombo = (combo + 1) % COMBINATIONS.length;
    setShuffleIcons([0, 0, 0]);

    [0, 1, 2].forEach((slot) => {
      let tick = 0;
      const interval = setInterval(() => {
        tick++;
        setShuffleIcons((prev) => {
          const next = [...prev];
          next[slot] = (next[slot] + 1) % allIcons.length;
          return next;
        });
      }, 60 + slot * 15);

      shuffleRef.current.push(interval);

      setTimeout(() => {
        clearInterval(interval);
      }, 600 + slot * 200);
    });

    setTimeout(() => {
      setCombo(nextCombo);
      setPhase("result");
    }, 1300);
  }, [phase, combo, allIcons.length, clearIntervals]);

  const InputIcon = useCallback(
    ({ index }: { index: number }) => {
      if (phase === "shuffling") {
        const Icon = allIcons[shuffleIcons[index]];
        return <Icon size={20} />;
      }
      const Icon = current.inputs[index];
      return <Icon size={20} />;
    },
    [phase, shuffleIcons, current, allIcons],
  );

  const ResultIcon = current.output;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="relative flex size-14 items-center justify-center overflow-hidden rounded-[14px] bg-tertiary text-primary"
            animate={
              phase === "shuffling"
                ? { scale: [1, 0.92, 1], y: [0, -2, 0] }
                : { scale: 1, y: 0 }
            }
            transition={
              phase === "shuffling"
                ? { duration: 0.3, repeat: 3, delay: i * 0.1 }
                : softSpring
            }
          >
            <AnimatePresence mode="popLayout">
              <motion.div
                key={phase === "shuffling" ? `shuffle-${shuffleIcons[i]}` : `input-${combo}-${i}`}
                initial={{ y: 8, opacity: 0, filter: "blur(4px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ y: -8, opacity: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.12 }}
                className="flex items-center justify-center"
              >
                <InputIcon index={i} />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-3">
        <motion.div
          className="flex size-24 items-center justify-center rounded-[22px] bg-primary text-inverted"
          layout
          transition={spring}
        >
          <AnimatePresence mode="wait">
            {phase === "result" ? (
              <motion.div
                key={`result-${combo}`}
                initial={{ scale: 0.5, opacity: 0, filter: "blur(8px)", rotate: -30 }}
                animate={{ scale: 1, opacity: 1, filter: "blur(0px)", rotate: 0 }}
                exit={{ scale: 0.5, opacity: 0, filter: "blur(8px)" }}
                transition={softSpring}
                className="flex items-center justify-center"
              >
                <ResultIcon size={36} />
              </motion.div>
            ) : phase === "shuffling" ? (
              <motion.div
                key="generating"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.85, 1, 0.85] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="flex items-center justify-center"
              >
                <Sparkle size={36} />
              </motion.div>
            ) : (
              <motion.div
                key={`idle-result-${combo}`}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={softSpring}
                className="flex items-center justify-center"
              >
                <ResultIcon size={36} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.span
            key={`label-${combo}-${phase}`}
            initial={{ opacity: 0, y: 4, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -4, filter: "blur(4px)" }}
            transition={{ duration: 0.2 }}
            className="text-sm text-tertiary"
          >
            {phase === "shuffling" ? "generating..." : current.label}
          </motion.span>
        </AnimatePresence>
      </div>

      <motion.button
        onClick={generate}
        disabled={phase === "shuffling"}
        className="rounded-full bg-tertiary px-5 py-2 text-sm font-medium text-primary transition-colors hover:bg-quaternary disabled:opacity-40"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        transition={spring}
      >
        Generate
      </motion.button>
    </div>
  );
}
