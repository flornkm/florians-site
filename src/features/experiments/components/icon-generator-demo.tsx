import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useMotionValue, useTransform, animate } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

const SPRING = { stiffness: 500, damping: 30 };

const ICONS = [
  {
    name: "Compass",
    paths: [
      "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z",
      "M16.5 7.5l-3 6-6 3 3-6 6-3z",
    ],
    filled: [false, true],
  },
  {
    name: "Camera",
    paths: [
      "M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z",
      "M12 17a4 4 0 100-8 4 4 0 000 8z",
    ],
    filled: [false, false],
  },
  {
    name: "Feather",
    paths: [
      "M20.24 12.24a6 6 0 00-8.49-8.49L5 10.5V19h8.5z",
      "M16 8L2 22",
      "M17.5 15H9",
    ],
    filled: [false, false, false],
  },
  {
    name: "Zap",
    paths: ["M13 2L3 14h9l-1 10 10-12h-9l1-10z"],
    filled: [false],
  },
  {
    name: "Heart",
    paths: [
      "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z",
    ],
    filled: [false],
  },
  {
    name: "Music",
    paths: ["M9 18V5l12-2v13", "M9 18a3 3 0 11-6 0 3 3 0 016 0z", "M21 16a3 3 0 11-6 0 3 3 0 016 0z"],
    filled: [false, false, false],
  },
  {
    name: "Globe",
    paths: [
      "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z",
      "M2 12h20",
      "M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z",
    ],
    filled: [false, false, false],
  },
  {
    name: "Star",
    paths: [
      "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    ],
    filled: [false],
  },
];

function DrawingPath({
  d,
  delay,
  filled,
  drawing,
}: {
  d: string;
  delay: number;
  filled: boolean;
  drawing: boolean;
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
  const fillOpacity = useTransform(progress, [0.6, 1], [0, filled ? 0.08 : 0]);

  useEffect(() => {
    if (drawing && length > 0) {
      progress.set(0);
      animate(progress, 1, {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        delay,
      });
    }
  }, [drawing, length, delay, progress]);

  return (
    <motion.path
      ref={pathRef}
      d={d}
      fill="currentColor"
      fillOpacity={fillOpacity}
      stroke="currentColor"
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
  const icon = ICONS[index];

  const generate = useCallback(() => {
    if (generating) return;
    setGenerating(true);
    setDrawing(false);

    setTimeout(() => {
      setIndex((prev) => (prev + 1) % ICONS.length);
      setDrawing(true);
      setTimeout(() => setGenerating(false), 700);
    }, 300);
  }, [generating]);

  return (
    <div className="flex flex-col items-center gap-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={icon.name}
          initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
          transition={{ type: "spring", ...SPRING }}
          className="relative"
        >
          <div className="size-36 rounded-[28px] bg-tertiary border border-primary flex items-center justify-center text-primary">
            <svg
              width={64}
              height={64}
              viewBox="0 0 24 24"
              fill="none"
              className="text-primary"
            >
              {icon.paths.map((d, i) => (
                <DrawingPath
                  key={`${icon.name}-${i}`}
                  d={d}
                  delay={i * 0.15}
                  filled={icon.filled[i]}
                  drawing={drawing}
                />
              ))}
            </svg>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-col items-center gap-3">
        <AnimatePresence mode="wait">
          <motion.span
            key={icon.name}
            initial={{ opacity: 0, y: 4, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -4, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="text-sm font-medium text-secondary"
          >
            {icon.name}
          </motion.span>
        </AnimatePresence>

        <motion.button
          onClick={generate}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
          disabled={generating}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-150",
            "bg-accent-primary text-inverted",
            "hover:bg-accent-primary-hover",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          )}
        >
          Generate
        </motion.button>
      </div>
    </div>
  );
}
