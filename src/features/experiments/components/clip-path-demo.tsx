import { useCallback, useEffect, useRef, useState } from "react";

const SHAPES = [
  {
    label: "Circle",
    clipPath: "circle(30% at 50% 50%)",
    activeClipPath: "circle(50% at 50% 50%)",
  },
  {
    label: "Inset",
    clipPath: "inset(20% 20% 20% 20% round 12px)",
    activeClipPath: "inset(4% 4% 4% 4% round 16px)",
  },
  {
    label: "Diamond",
    clipPath: "polygon(50% 15%, 85% 50%, 50% 85%, 15% 50%)",
    activeClipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
  },
  {
    label: "Star",
    clipPath:
      "polygon(50% 15%, 61% 35%, 83% 35%, 67% 50%, 75% 72%, 50% 58%, 25% 72%, 33% 50%, 17% 35%, 39% 35%)",
    activeClipPath:
      "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
  },
  {
    label: "Cross",
    clipPath:
      "polygon(35% 0%, 65% 0%, 65% 35%, 100% 35%, 100% 65%, 65% 65%, 65% 100%, 35% 100%, 35% 65%, 0% 65%, 0% 35%, 35% 35%)",
    activeClipPath:
      "polygon(30% 0%, 70% 0%, 70% 30%, 100% 30%, 100% 70%, 70% 70%, 70% 100%, 30% 100%, 30% 70%, 0% 70%, 0% 30%, 30% 30%)",
  },
];

const GRADIENT =
  "linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)";

export const ClipPathDemo = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const shape = SHAPES[activeIndex];

  const startAutoPlay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SHAPES.length);
    }, 2400);
  }, []);

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startAutoPlay]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const handleSelect = (index: number) => {
    setActiveIndex(index);
    startAutoPlay();
  };

  const currentClip = hovered ? shape.activeClipPath : shape.clipPath;

  const dynamicClip = currentClip
    .replace(/at \d+% \d+%/, `at ${mousePos.x}% ${mousePos.y}%`)
    .replace(
      /50% 15%/,
      `${mousePos.x}% ${Math.max(0, mousePos.y - 35)}%`,
    );

  const finalClip = shape.label === "Circle" ? dynamicClip : currentClip;

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-sm px-6">
      <div
        ref={containerRef}
        className="relative w-full aspect-square cursor-pointer select-none overflow-hidden rounded-2xl"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onMouseMove={handleMouseMove}
        onClick={() => handleSelect((activeIndex + 1) % SHAPES.length)}
      >
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: "var(--bg-tertiary)",
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background: GRADIENT,
            clipPath: finalClip,
            transition: "clip-path 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.06) 0%, transparent 50%)`,
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
        />

        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          <span
            className="text-xs font-medium tracking-wide uppercase"
            style={{
              color: "rgba(255,255,255,0.5)",
              transition: "color 0.3s ease",
              ...(hovered ? { color: "rgba(255,255,255,0.8)" } : {}),
            }}
          >
            {shape.label}
          </span>
          <span
            className="text-xs tabular-nums"
            style={{
              color: "rgba(255,255,255,0.3)",
            }}
          >
            {String(activeIndex + 1).padStart(2, "0")}/{String(SHAPES.length).padStart(2, "0")}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {SHAPES.map((s, i) => (
          <button
            key={s.label}
            onClick={() => handleSelect(i)}
            className="group relative flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200"
            style={{
              background: i === activeIndex ? "var(--bg-tertiary)" : "transparent",
            }}
          >
            <div
              className="w-2.5 h-2.5 rounded-sm transition-all duration-300"
              style={{
                background: i === activeIndex ? "var(--text-primary)" : "var(--text-quaternary)",
                transform: i === activeIndex ? "scale(1)" : "scale(0.8)",
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
};
