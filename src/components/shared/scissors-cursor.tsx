import { useMediaQuery } from "@/hooks/use-media-query";
import { useReducedMotion } from "motion/react";
import { type CSSProperties, useEffect, useRef, useState } from "react";

const SNIP_EVENT = "scissors-snip";
/** Matches the one-shot blade animation in cursorStyles. */
const SNIP_ONCE_MS = 220;

// Deterministic pseudo-random per character so SSR and client render the same scatter.
function seeded(index: number, salt: number) {
  const x = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function BladeShapes({ side, stroke, strokeWidth }: {
  side: "a" | "b";
  stroke: string;
  strokeWidth: number;
}) {
  return (
    <>
      <path
        d={side === "a" ? "M7.6 2.8 L12 13 L13.9 15.7" : "M16.4 2.8 L12 13 L10.1 15.7"}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={side === "a" ? 15.4 : 8.6} cy={17.8} r={2.6} stroke={stroke} strokeWidth={strokeWidth} />
    </>
  );
}

const cursorStyles = `
html.scissors-cursor, html.scissors-cursor * { cursor: none !important; }
.scissors-follower {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 9999;
  pointer-events: none;
  opacity: 0;
  will-change: transform;
}
/* Shift the svg so the pointer sits at the blade tips (the hotspot), then tilt
   the whole scissors to point top-left like a native cursor. */
.scissors-follower svg {
  display: block;
  transform: translate(-10px, -3px) rotate(-40deg);
  transform-origin: 10px 3px;
}
.scissors-blade-a, .scissors-blade-b {
  transform-box: view-box;
  transform-origin: 12px 13px;
}
.scissors-blade-a { animation: scissors-idle-a 1.8s ease-in-out infinite; }
.scissors-blade-b { animation: scissors-idle-b 1.8s ease-in-out infinite; }
.scissors-follower[data-snip-once="true"] .scissors-blade-a { animation: scissors-snip-a 0.22s ease-in-out 1; }
.scissors-follower[data-snip-once="true"] .scissors-blade-b { animation: scissors-snip-b 0.22s ease-in-out 1; }
/* After the one-shot rules so a running cut keeps the blades snipping through a click. */
.scissors-follower[data-snipping="true"] .scissors-blade-a { animation: scissors-snip-a 0.22s ease-in-out infinite; }
.scissors-follower[data-snipping="true"] .scissors-blade-b { animation: scissors-snip-b 0.22s ease-in-out infinite; }
@keyframes scissors-idle-a { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-5deg); } }
@keyframes scissors-idle-b { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(5deg); } }
@keyframes scissors-snip-a { 0%, 100% { transform: rotate(0deg); } 40% { transform: rotate(-16deg); } }
@keyframes scissors-snip-b { 0%, 100% { transform: rotate(0deg); } 40% { transform: rotate(16deg); } }
@keyframes scissors-cut-away {
  0% { transform: translate(0, 0) rotate(0deg); opacity: 1; animation-timing-function: ease-out; }
  25% { transform: translate(calc(var(--dx) * 0.12), -4px) rotate(calc(var(--rot) * 0.2)); opacity: 1; animation-timing-function: ease-in; }
  100% { transform: translate(var(--dx), var(--dy)) rotate(var(--rot)); opacity: 0; }
}
@keyframes scissors-return {
  0% { transform: translate(0, 5px); opacity: 0; }
  100% { transform: translate(0, 0); opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .scissors-blade-a, .scissors-blade-b { animation: none !important; }
}
`;

/** Replaces the native cursor with a gently snipping macOS-style scissors while mounted. */
export default function ScissorsCursor() {
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const followerRef = useRef<HTMLDivElement>(null);
  const [snipping, setSnipping] = useState(false);

  useEffect(() => {
    if (!finePointer) return;
    document.documentElement.classList.add("scissors-cursor");

    const move = (event: PointerEvent) => {
      const follower = followerRef.current;
      if (!follower) return;
      follower.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      follower.style.opacity = "1";
    };
    const hide = () => {
      if (followerRef.current) followerRef.current.style.opacity = "0";
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("mouseleave", hide);
    window.addEventListener("blur", hide);
    return () => {
      document.documentElement.classList.remove("scissors-cursor");
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("mouseleave", hide);
      window.removeEventListener("blur", hide);
    };
  }, [finePointer]);

  useEffect(() => {
    if (!finePointer) return;
    let timeout: number;
    const snip = (event: Event) => {
      const duration = (event as CustomEvent<number>).detail ?? 350;
      setSnipping(true);
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => setSnipping(false), duration);
    };
    window.addEventListener(SNIP_EVENT, snip);
    return () => {
      window.removeEventListener(SNIP_EVENT, snip);
      window.clearTimeout(timeout);
    };
  }, [finePointer]);

  useEffect(() => {
    if (!finePointer) return;
    let timeout: number;
    const snipOnce = () => {
      const follower = followerRef.current;
      if (!follower) return;
      // Drop the attribute and force a reflow so a rapid second click restarts the animation.
      follower.removeAttribute("data-snip-once");
      void follower.offsetWidth;
      follower.setAttribute("data-snip-once", "true");
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => follower.removeAttribute("data-snip-once"), SNIP_ONCE_MS);
    };
    window.addEventListener("pointerdown", snipOnce);
    return () => {
      window.removeEventListener("pointerdown", snipOnce);
      window.clearTimeout(timeout);
    };
  }, [finePointer]);

  if (!finePointer) return null;

  return (
    <>
      <style>{cursorStyles}</style>
      <div ref={followerRef} className="scissors-follower" data-snipping={snipping} aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          {/* White halo first, black strokes on top, so the cursor reads on any background. */}
          <g className="scissors-blade-a">
            <BladeShapes side="a" stroke="white" strokeWidth={4.6} />
          </g>
          <g className="scissors-blade-b">
            <BladeShapes side="b" stroke="white" strokeWidth={4.6} />
          </g>
          <g className="scissors-blade-a">
            <BladeShapes side="a" stroke="black" strokeWidth={2} />
          </g>
          <g className="scissors-blade-b">
            <BladeShapes side="b" stroke="black" strokeWidth={2} />
          </g>
        </svg>
      </div>
    </>
  );
}

const CHAR_STAGGER_MS = 30;
const CUT_DURATION_MS = 650;
const RETURN_STAGGER_MS = 12;
const RETURN_DURATION_MS = 350;

/** Text that gets cut away character by character on hover, like paper snippets falling off. */
export function CutText({ text }: { text: string }) {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<"idle" | "cut" | "return">("idle");
  const timeoutRef = useRef<number>(undefined);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  const totalChars = text.replace(/ /g, "").length;

  const handleEnter = () => {
    if (reducedMotion || phase !== "idle") return;
    setPhase("cut");
    // Keep the scissors snipping for as long as the letters are being cut.
    window.dispatchEvent(new CustomEvent(SNIP_EVENT, { detail: totalChars * CHAR_STAGGER_MS }));
    timeoutRef.current = window.setTimeout(() => {
      setPhase("return");
      timeoutRef.current = window.setTimeout(
        () => setPhase("idle"),
        totalChars * RETURN_STAGGER_MS + RETURN_DURATION_MS,
      );
    }, totalChars * CHAR_STAGGER_MS + CUT_DURATION_MS + 400);
  };

  let charIndex = 0;
  return (
    <span onPointerEnter={handleEnter}>
      {text.split(" ").map((word, wordIndex) => (
        <span key={wordIndex}>
          {wordIndex > 0 && " "}
          <span className="inline-block whitespace-nowrap">
            {word.split("").map((char) => {
              const i = charIndex++;
              const dx = (seeded(i, 1) - 0.5) * 110;
              const dy = 36 + seeded(i, 2) * 70;
              const rotation = (seeded(i, 3) - 0.5) * 280;
              return (
                <span
                  key={i}
                  className="inline-block"
                  style={{
                    "--dx": `${dx}px`,
                    "--dy": `${dy}px`,
                    "--rot": `${rotation}deg`,
                    animation:
                      phase === "cut"
                        ? `scissors-cut-away ${CUT_DURATION_MS}ms ${i * CHAR_STAGGER_MS}ms forwards`
                        : phase === "return"
                          // "both" keeps not-yet-returned characters hidden during their delay.
                          ? `scissors-return ${RETURN_DURATION_MS}ms ease-out ${i * RETURN_STAGGER_MS}ms both`
                          : "none",
                  } as CSSProperties}
                >
                  {char}
                </span>
              );
            })}
          </span>
        </span>
      ))}
    </span>
  );
}
