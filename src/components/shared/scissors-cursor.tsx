import { useMediaQuery } from "@/hooks/use-media-query";
import { type Variants, motion, useAnimate, useMotionValue, useReducedMotion } from "motion/react";
import { type ReactNode, createContext, useCallback, useContext, useEffect, useState } from "react";

const SNIP_MS = 220;
const IDLE_SWING = { duration: 1.8, ease: "easeInOut", repeat: Infinity } as const;
const SNIP_SWING = { duration: SNIP_MS / 1000, ease: "easeInOut" } as const;

/** Lets CutText keep the cursor snipping for as long as it is cutting letters away. */
const SnipContext = createContext<(durationMs?: number) => void>(() => {});

// Deterministic pseudo-random per character so SSR and client render the same scatter.
function seeded(index: number, salt: number) {
  const x = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function Blade({
  side,
  stroke,
  strokeWidth,
}: {
  side: "a" | "b";
  stroke: string;
  strokeWidth: number;
}) {
  const open = side === "a" ? -5 : 5;
  return (
    <motion.g
      className={`scissors-blade scissors-blade-${side}`}
      animate={{ rotate: [0, open, 0] }}
      transition={IDLE_SWING}
    >
      <path
        d={side === "a" ? "M7.6 2.8 L12 13 L13.9 15.7" : "M16.4 2.8 L12 13 L10.1 15.7"}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={side === "a" ? 15.4 : 8.6}
        cy={17.8}
        r={2.6}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </motion.g>
  );
}

const cursorStyles = `
html, html * { cursor: none !important; }
.scissors-follower { position: fixed; left: 0; top: 0; z-index: 9999; pointer-events: none; will-change: transform; }
/* Shift the svg so the pointer sits at the blade tips (the hotspot), then tilt
   the whole scissors to point top-left like a native cursor. */
.scissors-follower svg { display: block; transform: translate(-10px, -3px) rotate(-40deg); transform-origin: 10px 3px; }
.scissors-blade { transform-box: view-box; transform-origin: 12px 13px; }
`;

/**
 * Replaces the native cursor with a gently snipping macOS-style scissors while mounted, and
 * provides the snip trigger to any CutText inside it.
 */
export default function ScissorsCursor({ children }: { children?: ReactNode }) {
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const [scope, animate] = useAnimate<SVGSVGElement>();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const opacity = useMotionValue(0);

  const snip = useCallback(
    (durationMs = SNIP_MS) => {
      if (!scope.current) return;
      const repeat = Math.max(0, Math.round(durationMs / SNIP_MS) - 1);
      animate(".scissors-blade-a", { rotate: [0, -16, 0] }, { ...SNIP_SWING, repeat });
      animate(".scissors-blade-b", { rotate: [0, 16, 0] }, { ...SNIP_SWING, repeat }).then(() => {
        // Hand the blades back to the idle loop; the declarative animate prop only runs on mount.
        animate(".scissors-blade-a", { rotate: [0, -5, 0] }, IDLE_SWING);
        animate(".scissors-blade-b", { rotate: [0, 5, 0] }, IDLE_SWING);
      });
    },
    [animate, scope],
  );

  // The cursor follows the whole window, so this one subscription stays outside React.
  useEffect(() => {
    if (!finePointer) return;
    const move = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      opacity.set(1);
    };
    const hide = () => opacity.set(0);
    const click = () => snip();
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", click);
    window.addEventListener("blur", hide);
    document.documentElement.addEventListener("mouseleave", hide);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", click);
      window.removeEventListener("blur", hide);
      document.documentElement.removeEventListener("mouseleave", hide);
    };
  }, [finePointer, snip, x, y, opacity]);

  return (
    <SnipContext.Provider value={snip}>
      {children}
      {finePointer && (
        <>
          <style>{cursorStyles}</style>
          <motion.div className="scissors-follower" style={{ x, y, opacity }} aria-hidden="true">
            <svg ref={scope} width="20" height="20" viewBox="0 0 24 24" fill="none">
              {/* White halo first, black strokes on top, so the cursor reads on any background. */}
              <Blade side="a" stroke="white" strokeWidth={4.6} />
              <Blade side="b" stroke="white" strokeWidth={4.6} />
              <Blade side="a" stroke="black" strokeWidth={2} />
              <Blade side="b" stroke="black" strokeWidth={2} />
            </svg>
          </motion.div>
        </>
      )}
    </SnipContext.Provider>
  );
}

const CHAR_STAGGER = 0.03;
const CUT_DURATION = 0.65;
const HOLD = 0.4;
const RETURN_STAGGER = 0.012;
const RETURN_DURATION = 0.35;

type CharMotion = { index: number; dx: number; dy: number; rot: number };

const charVariants: Variants = {
  idle: { x: 0, y: 0, rotate: 0, opacity: 1, transition: { duration: 0 } },
  cut: ({ index, dx, dy, rot }: CharMotion) => ({
    x: [0, dx * 0.12, dx],
    y: [0, -4, dy],
    rotate: [0, rot * 0.2, rot],
    opacity: [1, 1, 0],
    transition: {
      duration: CUT_DURATION,
      delay: index * CHAR_STAGGER,
      times: [0, 0.25, 1],
      ease: ["easeOut", "easeIn"],
    },
  }),
  // Leading keyframes snap each character back to its slot (still invisible) before it rises.
  return: ({ index }: CharMotion) => ({
    x: [0, 0],
    y: [5, 0],
    rotate: [0, 0],
    opacity: [0, 1],
    transition: {
      duration: RETURN_DURATION,
      delay: HOLD + index * RETURN_STAGGER,
      ease: "easeOut",
    },
  }),
};

/** Text that gets cut away character by character on hover, like paper snippets falling off. */
export function CutText({ text }: { text: string }) {
  const reducedMotion = useReducedMotion();
  const snip = useContext(SnipContext);
  const [phase, setPhase] = useState<"idle" | "cut" | "return">("idle");

  const lastIndex = text.replace(/ /g, "").length - 1;

  const handleEnter = () => {
    if (reducedMotion || phase !== "idle") return;
    setPhase("cut");
    snip((lastIndex + 1) * CHAR_STAGGER * 1000);
  };
  // The last character is the last to finish, so it drives the whole run forward.
  const advance = () => setPhase((current) => (current === "cut" ? "return" : "idle"));

  let charIndex = 0;
  return (
    <span onPointerEnter={handleEnter}>
      {text.split(" ").map((word, wordIndex) => (
        <span key={wordIndex}>
          {wordIndex > 0 && " "}
          <span className="inline-block whitespace-nowrap">
            {word.split("").map((char) => {
              const index = charIndex++;
              return (
                <motion.span
                  key={index}
                  className="inline-block"
                  variants={charVariants}
                  custom={
                    {
                      index,
                      dx: (seeded(index, 1) - 0.5) * 110,
                      dy: 36 + seeded(index, 2) * 70,
                      rot: (seeded(index, 3) - 0.5) * 280,
                    } satisfies CharMotion
                  }
                  initial={false}
                  animate={phase}
                  onAnimationComplete={index === lastIndex ? advance : undefined}
                >
                  {char}
                </motion.span>
              );
            })}
          </span>
        </span>
      ))}
    </span>
  );
}
