import { memo, useEffect, useRef } from "react";
import rough from "roughjs";

const FRAME_COUNT = 6;
const FRAME_INTERVAL = 400; // ms

const OPTS = {
  stroke: "currentColor",
  strokeWidth: 2.5,
  roughness: 2,
  bowing: 1.5,
  maxRandomnessOffset: 1.5,
};

// Lazy-init on first client access to avoid SSR `document` issues
let _frames: string[] | null = null;
function getFrames(): string[] {
  if (_frames) return _frames;
  if (typeof document === "undefined") return [];
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  _frames = Array.from({ length: FRAME_COUNT }, (_, i) => {
    const rc = rough.svg(svg);
    const opts = { ...OPTS, seed: i * 1000 };
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.appendChild(rc.line(10, 8, 10, 52, opts)); // vertical stem
    g.appendChild(rc.line(10, 8, 35, 8, opts)); // top bar
    g.appendChild(rc.line(10, 28, 28, 28, opts)); // middle bar
    return g.innerHTML;
  });
  return _frames;
}

interface RoughFLogoProps {
  isAnimating?: boolean;
  className?: string;
}

export const RoughFLogo = memo(function RoughFLogo({
  isAnimating = false,
  className,
}: RoughFLogoProps) {
  const gRef = useRef<SVGGElement>(null);
  const indexRef = useRef(0);

  // Set initial frame on mount (handles SSR hydration)
  useEffect(() => {
    const frames = getFrames();
    if (gRef.current && frames.length > 0) {
      gRef.current.innerHTML = frames[0];
    }
  }, []);

  useEffect(() => {
    if (!isAnimating) return;
    const frames = getFrames();
    if (frames.length === 0) return;

    const id = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % frames.length;
      if (gRef.current) gRef.current.innerHTML = frames[indexRef.current];
    }, FRAME_INTERVAL);

    return () => clearInterval(id);
  }, [isAnimating]);

  return (
    <svg viewBox="2 0 42 60" className={className} aria-label="F">
      <g ref={gRef} />
    </svg>
  );
});
