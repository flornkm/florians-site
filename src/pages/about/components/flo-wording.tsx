import { memo, useRef } from "react";
import rough from "roughjs";
import useAnimationFrame from "use-animation-frame";

const FRAME_COUNT = 6;
const FRAME_INTERVAL = 0.4; // seconds

const OPTS = { stroke: "currentColor", strokeWidth: 2.5, roughness: 2, bowing: 1.5, maxRandomnessOffset: 1.5 };

// Generate all SVG group elements once at module scope
const tempSvg = typeof document !== "undefined" ? document.createElementNS("http://www.w3.org/2000/svg", "svg") : null;

const FRAMES: SVGGElement[] = tempSvg
  ? Array.from({ length: FRAME_COUNT }, (_, i) => {
      const rc = rough.svg(tempSvg);
      const opts = { ...OPTS, seed: i * 1000 };
      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");

      // F
      group.appendChild(rc.line(10, 8, 10, 52, opts));
      group.appendChild(rc.line(10, 8, 35, 8, opts));
      group.appendChild(rc.line(10, 28, 28, 28, opts));
      // l
      group.appendChild(rc.line(48, 8, 48, 52, opts));
      // o
      group.appendChild(rc.ellipse(78, 38, 28, 30, { ...opts, fill: "transparent" }));
      // circle around "Flo"
      group.appendChild(rc.ellipse(50, 30, 160, 100, { ...opts, fill: "transparent" }));

      return group;
    })
  : [];

export const FloWording = memo(function FloWording() {
  const gRef = useRef<SVGGElement>(null);
  const lastSwapRef = useRef(0);
  const indexRef = useRef(0);

  useAnimationFrame(({ time }) => {
    if (time - lastSwapRef.current < FRAME_INTERVAL) return;
    lastSwapRef.current = time;

    const g = gRef.current;
    if (!g) return;

    indexRef.current = (indexRef.current + 1) % FRAME_COUNT;
    g.innerHTML = FRAMES[indexRef.current].innerHTML;
  });

  const initialHtml = FRAMES[0]?.innerHTML ?? "";

  return (
    <svg viewBox="-40 -28 180 116" className="w-20 md:w-28 select-none overflow-visible text-[#2563eb] dark:text-[#60a5fa]" aria-label="Flo">
      <g ref={gRef} dangerouslySetInnerHTML={{ __html: initialHtml }} />
    </svg>
  );
});
