import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

function Sun({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function Cloud({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 19H9.5A7.5 7.5 0 0 1 9.5 4a7.46 7.46 0 0 1 5.25 2.15A5.5 5.5 0 1 1 17.5 19z" />
    </svg>
  );
}

function Drop({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  );
}

function Heart({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function Music({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function Star({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function Zap({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function Shield({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function Sparkle({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z" />
    </svg>
  );
}

function Playlist({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15V6M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
      <path d="M2 8h12M2 12h8M2 16h6" />
    </svg>
  );
}

function RainCloud({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 17H9.5A7.5 7.5 0 0 1 9.5 2a7.46 7.46 0 0 1 5.25 2.15A5.5 5.5 0 1 1 17.5 17z" />
      <path d="M8 19v2M12 19v2M16 19v2" />
    </svg>
  );
}

function Trophy({ size = 24 }: { size?: number }) {
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

const transition = { type: "spring" as const, stiffness: 400, damping: 26 };

function Tile({
  children,
  dark,
  delay = 0,
  id,
}: {
  children: React.ReactNode;
  dark?: boolean;
  delay?: number;
  id: string;
}) {
  return (
    <div
      className={`flex size-12 items-center justify-center rounded-[14px] ${dark ? "bg-primary text-inverted" : "bg-tertiary text-primary"}`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={id}
          initial={{ opacity: 0, scale: 0.6, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.6, filter: "blur(4px)" }}
          transition={{ ...transition, delay }}
          className="flex items-center justify-center"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function IconGeneratorDemo() {
  const [index, setIndex] = useState(0);
  const combo = COMBINATIONS[index];

  const next = () => {
    setIndex((i) => (i + 1) % COMBINATIONS.length);
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <motion.div
        className="flex cursor-pointer items-center gap-2"
        onClick={next}
        whileTap={{ scale: 0.97 }}
        transition={transition}
      >
        {combo.inputs.map((Icon, i) => (
          <Tile key={i} delay={i * 0.04} id={`${index}-${i}`}>
            <Icon size={22} />
          </Tile>
        ))}

        <span className="px-1 text-xs font-medium text-quaternary">=</span>

        <Tile dark delay={0.14} id={`result-${index}`}>
          <combo.output size={22} />
        </Tile>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 4, filter: "blur(3px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -4, filter: "blur(3px)" }}
          transition={{ duration: 0.15 }}
          className="text-xs text-tertiary"
        >
          {combo.label}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
