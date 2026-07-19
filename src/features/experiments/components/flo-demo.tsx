import rough from "roughjs";
import { useEffect, useState } from "react";

/* The hand-drawn "Flo" — my signature scribble from the about page — with a circle looped
   around it, redrawn from the rough.js sketch. The wobble is a "boil": a handful of frames,
   each drawn from a different seed so every stroke lands slightly differently, cycled slowly
   so the lines look alive as if someone were retracing them. Faithful to the original, but the
   swap runs on a slow interval (a few frames a second) instead of a per-frame RAF, so it costs
   almost nothing while it sits open. Transparent, drawn in ink: black on light, white on dark. */

const FRAME_COUNT = 6;
const FRAME_MS = 450;

const OPTS = {
  stroke: "currentColor",
  strokeWidth: 2.5,
  roughness: 2,
  bowing: 1.5,
  maxRandomnessOffset: 1.5,
};

// Draw each frame once (rough.js only runs here, at mount) and keep just the innerHTML so the
// per-tick swap is a cheap string set, not a re-tessellation. Client-only: rough.js needs a real
// SVG node, and this demo is lazy-loaded so it never renders on the server.
function buildFrames(): string[] {
  if (typeof document === "undefined") return [];
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  return Array.from({ length: FRAME_COUNT }, (_, i) => {
    const rc = rough.svg(svg);
    const opts = { ...OPTS, seed: i * 1000 + 1 };
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    // F
    g.appendChild(rc.line(10, 8, 10, 52, opts));
    g.appendChild(rc.line(10, 8, 35, 8, opts));
    g.appendChild(rc.line(10, 28, 28, 28, opts));
    // l
    g.appendChild(rc.line(48, 8, 48, 52, opts));
    // o
    g.appendChild(rc.ellipse(78, 38, 28, 30, opts));
    // the circle looped around the word
    g.appendChild(rc.ellipse(50, 30, 160, 100, opts));
    return g.innerHTML;
  });
}

export const Flo = () => {
  const [frames] = useState(buildFrames);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (frames.length <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % frames.length), FRAME_MS);
    return () => window.clearInterval(id);
  }, [frames.length]);

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <svg
        viewBox="-40 -28 180 116"
        className="w-1/3 max-w-[15rem] select-none overflow-visible text-neutral-900 dark:text-neutral-50"
        role="img"
        aria-label="A hand-drawn Flo with a circle looped around it"
      >
        <g dangerouslySetInnerHTML={{ __html: frames[index] ?? "" }} />
      </svg>
    </div>
  );
};
