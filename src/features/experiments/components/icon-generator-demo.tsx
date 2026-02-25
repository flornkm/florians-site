import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

function MusicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function PlaylistIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <path d="M21 16a3 3 0 11-6 0" />
      <path d="M3 6h.01M3 10h.01M3 14h.01" />
    </svg>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}

function CompassIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
    </svg>
  );
}

function ExploreIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
      <path d="M11 8v6M8 11h6" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 10 10-12h-9l1-10z" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

function SecureIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function CloudIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
    </svg>
  );
}

function DropIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
    </svg>
  );
}

function WeatherIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

function EqualIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M5 9h14M5 15h14" />
    </svg>
  );
}

const ALL_ICONS = [MusicIcon, HeartIcon, StarIcon, CameraIcon, GlobeIcon, CompassIcon, ShieldIcon, ZapIcon, SunIcon, CloudIcon, LockIcon, DropIcon];

const COMBINATIONS = [
  {
    inputs: [
      { name: "Music", icon: MusicIcon },
      { name: "Heart", icon: HeartIcon },
      { name: "Star", icon: StarIcon },
    ],
    output: { name: "Playlist", icon: PlaylistIcon },
  },
  {
    inputs: [
      { name: "Camera", icon: CameraIcon },
      { name: "Globe", icon: GlobeIcon },
      { name: "Compass", icon: CompassIcon },
    ],
    output: { name: "Explore", icon: ExploreIcon },
  },
  {
    inputs: [
      { name: "Shield", icon: ShieldIcon },
      { name: "Zap", icon: ZapIcon },
      { name: "Lock", icon: LockIcon },
    ],
    output: { name: "Secure", icon: SecureIcon },
  },
  {
    inputs: [
      { name: "Sun", icon: SunIcon },
      { name: "Cloud", icon: CloudIcon },
      { name: "Drop", icon: DropIcon },
    ],
    output: { name: "Weather", icon: WeatherIcon },
  },
];

type Phase = "idle" | "shuffling" | "landed" | "result";

function SlotCell({
  icon: Icon,
  shuffling,
  delay,
}: {
  icon: React.FC<{ className?: string }>;
  shuffling: boolean;
  delay: number;
}) {
  const [tick, setTick] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    if (shuffling) {
      const timeout = setTimeout(() => {
        intervalRef.current = setInterval(() => {
          setTick((t) => t + 1);
        }, 70);
      }, delay);
      return () => {
        clearTimeout(timeout);
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [shuffling, delay]);

  const ShuffleIcon = ALL_ICONS[tick % ALL_ICONS.length];

  return (
    <div className="size-14 rounded-[13px] bg-tertiary overflow-hidden relative">
      <AnimatePresence mode="wait">
        {shuffling ? (
          <motion.div
            key={`shuffle-${tick}`}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 0.35 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.06 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <ShuffleIcon className="size-6 text-primary" />
          </motion.div>
        ) : (
          <motion.div
            key="final"
            initial={{ scale: 1.5, opacity: 0, filter: "blur(8px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 18,
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Icon className="size-6 text-primary" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function IconGeneratorDemo() {
  const [comboIndex, setComboIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  const combo = COMBINATIONS[comboIndex];

  const clearTimeouts = () => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
  };

  const generate = useCallback(() => {
    if (phase === "shuffling") return;
    clearTimeouts();

    const nextIndex = phase === "result" ? (comboIndex + 1) % COMBINATIONS.length : comboIndex;

    if (phase === "result") {
      setPhase("idle");
      setComboIndex(nextIndex);
      const t = setTimeout(() => {
        setPhase("shuffling");
        const t2 = setTimeout(() => setPhase("landed"), 700);
        const t3 = setTimeout(() => setPhase("result"), 1100);
        timeouts.current.push(t2, t3);
      }, 50);
      timeouts.current.push(t);
    } else {
      setPhase("shuffling");
      const t1 = setTimeout(() => setPhase("landed"), 700);
      const t2 = setTimeout(() => setPhase("result"), 1100);
      timeouts.current.push(t1, t2);
    }
  }, [phase, comboIndex]);

  useEffect(() => {
    return () => clearTimeouts();
  }, []);

  const isShuffling = phase === "shuffling";
  const showResult = phase === "result";
  const OutputIcon = combo.output.icon;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-2">
        {combo.inputs.map((input, i) => (
          <div key={`${comboIndex}-${i}`} className="flex items-center gap-2">
            <motion.div
              animate={{
                scale: showResult ? 0.9 : 1,
                opacity: showResult ? 0.5 : 1,
              }}
              transition={{ type: "spring", stiffness: 500, damping: 28 }}
              className="flex flex-col items-center gap-1.5"
            >
              <SlotCell
                icon={input.icon}
                shuffling={isShuffling}
                delay={i * 60}
              />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: phase === "idle" ? 0 : 1 }}
                className="text-[10px] text-quaternary font-medium"
              >
                {input.name}
              </motion.span>
            </motion.div>
            {i < 2 && (
              <motion.div
                animate={{
                  opacity: showResult ? 0 : 0.2,
                  scale: showResult ? 0.5 : 1,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="text-quaternary text-xs font-medium mb-5"
              >
                +
              </motion.div>
            )}
          </div>
        ))}

        <AnimatePresence>
          {(phase === "landed" || showResult) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.2, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="mb-5"
            >
              <EqualIcon className="size-4 text-quaternary" />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ scale: 0, opacity: 0, filter: "blur(12px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              exit={{ scale: 0.8, opacity: 0, filter: "blur(8px)" }}
              transition={{ type: "spring", stiffness: 450, damping: 20 }}
              className="flex flex-col items-center gap-1.5"
            >
              <div className="size-14 rounded-[13px] bg-accent-primary flex items-center justify-center shadow-lg shadow-black/[.08]">
                <motion.div
                  initial={{ scale: 0, rotate: -120 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 16, delay: 0.1 }}
                >
                  <OutputIcon className="size-6 text-inverted" />
                </motion.div>
              </div>
              <motion.span
                initial={{ opacity: 0, y: 4, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.15 }}
                className="text-[10px] text-secondary font-medium"
              >
                {combo.output.name}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        onClick={generate}
        disabled={phase === "shuffling"}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
        className={cn(
          "h-8 px-4 rounded-full text-xs font-medium",
          "bg-accent-primary text-inverted",
          "disabled:opacity-40 disabled:cursor-not-allowed",
        )}
      >
        {phase === "idle" ? "Generate" : phase === "result" ? "Next" : "Mixing..."}
      </motion.button>
    </div>
  );
}
