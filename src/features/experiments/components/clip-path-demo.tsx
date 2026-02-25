import { useRef, useState } from "react";

const WORDS = ["reveal", "uncover", "expose", "unveil", "disclose"];

export const ClipPathDemo = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleClick = () => {
    setWordIndex((prev) => (prev + 1) % WORDS.length);
  };

  const radius = hovered ? 120 : 0;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md px-6">
      <div
        ref={containerRef}
        className="relative w-full aspect-[3/2] cursor-pointer select-none overflow-hidden rounded-xl"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      >
        <div className="absolute inset-0 bg-tertiary flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="rounded-full bg-quaternary"
                style={{
                  height: 2,
                  width: i === 2 ? 80 : i === 1 || i === 3 ? 60 : 40,
                  opacity: i === 2 ? 0.6 : 0.3,
                }}
              />
            ))}
          </div>
        </div>

        <div
          className="absolute inset-0 bg-surface-inverted flex items-center justify-center"
          style={{
            clipPath: `circle(${radius}px at ${pos.x}px ${pos.y}px)`,
            transition: hovered
              ? "clip-path 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
              : "clip-path 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <span
            className="text-inverted text-sm font-medium tracking-tight select-none"
            style={{
              transition: "opacity 0.3s ease",
              opacity: hovered ? 1 : 0,
            }}
          >
            {WORDS[wordIndex]}
          </span>
        </div>

        <div
          className="absolute bottom-3 left-3 text-quaternary select-none pointer-events-none"
          style={{
            fontSize: 10,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            transition: "opacity 0.3s ease",
            opacity: hovered ? 0 : 1,
          }}
        >
          hover to reveal
        </div>
      </div>
    </div>
  );
};
