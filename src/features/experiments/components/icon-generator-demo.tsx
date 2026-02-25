import { cn } from "@/lib/utils";
import { IconArrowUp } from "central-icons/IconArrowUp";
import { animate, AnimatePresence, motion, useMotionValue, useTransform } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

const ICONS: {
  name: string;
  prompt: string;
  bg: string;
  fg: string;
  paths: string[];
  fills: boolean[];
}[] = [
  {
    name: "Weather",
    prompt: "a weather app icon",
    bg: "#3B82F6",
    fg: "#ffffff",
    paths: [
      "M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.95l-.71.71M21 12h1M2 12h1m15.66 7.66l-.71-.71M4.05 4.05l-.71-.71",
      "M12 8a4 4 0 100 8 4 4 0 000-8z",
    ],
    fills: [false, false],
  },
  {
    name: "Camera",
    prompt: "a camera app icon",
    bg: "#1F1F1F",
    fg: "#ffffff",
    paths: [
      "M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z",
      "M12 17a4 4 0 100-8 4 4 0 000 8z",
    ],
    fills: [false, false],
  },
  {
    name: "Music",
    prompt: "a music app icon",
    bg: "#EC4899",
    fg: "#ffffff",
    paths: ["M9 18V5l12-2v13", "M9 18a3 3 0 11-6 0 3 3 0 016 0z", "M21 16a3 3 0 11-6 0 3 3 0 016 0z"],
    fills: [false, false, false],
  },
  {
    name: "Compass",
    prompt: "a compass icon",
    bg: "#F97316",
    fg: "#ffffff",
    paths: [
      "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z",
      "M16.5 7.5l-3 6-6 3 3-6 6-3z",
    ],
    fills: [false, true],
  },
  {
    name: "Heart",
    prompt: "a health app icon",
    bg: "#EF4444",
    fg: "#ffffff",
    paths: [
      "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z",
    ],
    fills: [false],
  },
  {
    name: "Shield",
    prompt: "a security app icon",
    bg: "#10B981",
    fg: "#ffffff",
    paths: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", "M9 12l2 2 4-4"],
    fills: [false, false],
  },
  {
    name: "Zap",
    prompt: "a power app icon",
    bg: "#F59E0B",
    fg: "#ffffff",
    paths: ["M13 2L3 14h9l-1 10 10-12h-9l1-10z"],
    fills: [false],
  },
  {
    name: "Globe",
    prompt: "a browser app icon",
    bg: "#6366F1",
    fg: "#ffffff",
    paths: [
      "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z",
      "M2 12h20",
      "M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z",
    ],
    fills: [false, false, false],
  },
];

function DrawingPath({
  d,
  delay,
  filled,
  drawing,
  color,
}: {
  d: string;
  delay: number;
  filled: boolean;
  drawing: boolean;
  color: string;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const progress = useMotionValue(0);
  const [length, setLength] = useState(0);

  useEffect(() => {
    if (pathRef.current) {
      setLength(pathRef.current.getTotalLength());
    }
  }, [d]);

  const dashOffset = useTransform(progress, [0, 1], [length, 0]);
  const fillOpacity = useTransform(progress, [0.6, 1], [0, filled ? 0.15 : 0]);

  useEffect(() => {
    if (drawing && length > 0) {
      progress.set(0);
      animate(progress, 1, {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
        delay,
      });
    }
  }, [drawing, length, delay, progress]);

  return (
    <motion.path
      ref={pathRef}
      d={d}
      fill={color}
      fillOpacity={fillOpacity}
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={length}
      strokeDashoffset={dashOffset}
    />
  );
}

export default function IconGeneratorDemo() {
  const [index, setIndex] = useState(0);
  const [drawing, setDrawing] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [displayPrompt, setDisplayPrompt] = useState(ICONS[0].prompt);
  const inputRef = useRef<HTMLInputElement>(null);
  const icon = ICONS[index];

  const generate = useCallback(() => {
    if (generating) return;
    setGenerating(true);
    setDrawing(false);

    const nextIndex = (index + 1) % ICONS.length;
    const nextIcon = ICONS[nextIndex];

    setDisplayPrompt(inputValue || nextIcon.prompt);

    setTimeout(() => {
      setIndex(nextIndex);
      setDrawing(true);
      setInputValue("");
      setTimeout(() => setGenerating(false), 700);
    }, 350);
  }, [generating, index, inputValue]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      generate();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={icon.name}
          initial={{ opacity: 0, scale: 0.92, filter: "blur(8px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="relative flex flex-col items-center"
        >
          <div
            className="size-48 rounded-[40px] flex items-center justify-center shadow-xl relative overflow-hidden"
            style={{
              backgroundColor: icon.bg,
              boxShadow: `0 8px 40px ${icon.bg}33, 0 2px 8px ${icon.bg}22`,
            }}
          >
            <svg width={80} height={80} viewBox="0 0 24 24" fill="none">
              {icon.paths.map((d, i) => (
                <DrawingPath
                  key={`${icon.name}-${i}`}
                  d={d}
                  delay={i * 0.15}
                  filled={icon.fills[i]}
                  drawing={drawing}
                  color={icon.fg}
                />
              ))}
            </svg>
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.p
          key={displayPrompt}
          initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="text-xs text-quaternary"
        >
          {displayPrompt}
        </motion.p>
      </AnimatePresence>

      <div className="w-64 relative">
        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe an icon..."
          className={cn(
            "w-full h-10 rounded-full bg-tertiary text-primary text-sm",
            "pl-4 pr-10 outline-none placeholder:text-quaternary",
            "border border-primary",
            "transition-all duration-150",
            "focus:border-secondary",
          )}
        />
        <motion.button
          onClick={generate}
          disabled={generating}
          initial={false}
          animate={{
            scale: generating ? 0.85 : 1,
            opacity: generating ? 0.5 : 1,
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.85 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          className={cn(
            "absolute right-1.5 top-1/2 -translate-y-1/2",
            "size-7 rounded-full flex items-center justify-center",
            "bg-accent-primary text-inverted",
            "disabled:cursor-not-allowed",
          )}
        >
          <IconArrowUp className="size-3.5" />
        </motion.button>
      </div>
    </div>
  );
}
