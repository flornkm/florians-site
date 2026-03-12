import { memo, useRef } from "react";
import rough from "roughjs";
import useAnimationFrame from "use-animation-frame";

const FRAME_INTERVAL = 0.4; // seconds
const OPTS = {
  stroke: "currentColor",
  strokeWidth: 2.5,
  roughness: 2,
  bowing: 1.5,
  maxRandomnessOffset: 1.5,
};

const FRAMES: string[] = (() => {
  if (typeof document === "undefined") return [];
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  return Array.from({ length: 6 }, (_, i) => {
    const rc = rough.svg(svg);
    const opts = { ...OPTS, seed: i * 1000 };
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.appendChild(rc.line(10, 8, 10, 52, opts));
    g.appendChild(rc.line(10, 8, 35, 8, opts));
    g.appendChild(rc.line(10, 28, 28, 28, opts));
    g.appendChild(rc.line(48, 8, 48, 52, opts));
    g.appendChild(rc.ellipse(78, 38, 28, 30, { ...opts, fill: "transparent" }));
    g.appendChild(rc.ellipse(50, 30, 160, 100, { ...opts, fill: "transparent" }));
    return g.innerHTML;
  });
})();

export const FloWording = memo(function FloWording() {
  const gRef = useRef<SVGGElement>(null);
  const lastSwapRef = useRef(0);
  const indexRef = useRef(0);

  useAnimationFrame(({ time }: { time: number }) => {
    if (time - lastSwapRef.current < FRAME_INTERVAL) return;
    lastSwapRef.current = time;
    indexRef.current = (indexRef.current + 1) % FRAMES.length;
    if (gRef.current) gRef.current.innerHTML = FRAMES[indexRef.current];
  });

  return (
    <svg
      viewBox="-40 -28 180 116"
      className="w-20 md:w-28 select-none overflow-visible text-black dark:text-white"
      aria-label="Flo"
    >
      <g ref={gRef} dangerouslySetInnerHTML={{ __html: FRAMES[0] ?? "" }} />
    </svg>
  );
});
