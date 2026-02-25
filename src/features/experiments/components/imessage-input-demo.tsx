import { AnimatePresence, motion, useAnimationControls } from "motion/react";
import { useRef, useState } from "react";

const SUGGESTIONS = ["Sounds good!", "On my way", "See you soon"];

const BUBBLE_POSITIONS = [
  { x: -110, y: -58, dotX: -44, dotY: -10, microX: -16, microY: 4 },
  { x: 0, y: -68, dotX: 0, dotY: -14, microX: 0, microY: 2 },
  { x: 110, y: -58, dotX: 44, dotY: -10, microX: 16, microY: 4 },
];

const ThinkingDot = ({
  x,
  y,
  size,
  delay,
  focused,
}: {
  x: number;
  y: number;
  size: number;
  delay: number;
  focused: boolean;
}) => (
  <motion.div
    className="absolute left-1/2 bottom-0 rounded-full"
    style={{
      width: size,
      height: size,
      background: "rgba(59, 130, 246, 0.12)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      boxShadow: "0 2px 8px rgba(59, 130, 246, 0.1)",
    }}
    initial={{ opacity: 0, scale: 0, x: -size / 2, y: size / 2 }}
    animate={
      focused
        ? {
            opacity: 1,
            scale: 1,
            x: x - size / 2,
            y: y - size / 2,
          }
        : {
            opacity: 0,
            scale: 0,
            x: -size / 2,
            y: size / 2,
          }
    }
    transition={{
      type: "spring",
      stiffness: 420,
      damping: 18,
      delay: focused ? delay : delay * 0.3,
    }}
  />
);

export const IMessageInputDemo = () => {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerControls = useAnimationControls();

  const handleSuggestionClick = (text: string) => {
    setValue(text);
    containerControls.start({
      scale: [1, 1.02, 0.99, 1],
      transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
    });
  };

  const handleSend = () => {
    setValue("");
    containerControls.start({
      x: [0, -2, 3, -1, 0],
      transition: { duration: 0.3, ease: "easeOut" },
    });
  };

  return (
    <div
      className="flex flex-col items-center justify-center w-full max-w-[340px]"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="relative w-full" style={{ height: 120 }}>
        {BUBBLE_POSITIONS.map((pos, i) => (
          <div key={i}>
            <ThinkingDot
              x={pos.microX}
              y={pos.microY}
              size={6}
              delay={i * 0.08}
              focused={focused}
            />
            <ThinkingDot
              x={pos.dotX}
              y={pos.dotY}
              size={10}
              delay={i * 0.08 + 0.04}
              focused={focused}
            />
            <motion.button
              className="absolute left-1/2 bottom-0 cursor-pointer select-none whitespace-nowrap"
              style={{
                background: "rgba(59, 130, 246, 0.08)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                boxShadow:
                  "0 4px 24px rgba(59, 130, 246, 0.12), 0 0 0 1px rgba(59, 130, 246, 0.06)",
                borderRadius: 20,
                padding: "8px 16px",
                fontSize: 14,
                fontWeight: 500,
                color: "rgba(59, 130, 246, 0.85)",
                transformOrigin: "center center",
              }}
              initial={{ opacity: 0, scale: 0, x: "-50%", y: "50%" }}
              animate={
                focused
                  ? {
                      opacity: 1,
                      scale: 1,
                      x: `calc(-50% + ${pos.x}px)`,
                      y: `calc(50% + ${pos.y}px)`,
                    }
                  : {
                      opacity: 0,
                      scale: 0,
                      x: "-50%",
                      y: "50%",
                    }
              }
              transition={{
                type: "spring",
                stiffness: 360,
                damping: 20,
                delay: focused ? i * 0.08 + 0.08 : (SUGGESTIONS.length - 1 - i) * 0.04,
              }}
              whileHover={{
                scale: 1.08,
                boxShadow:
                  "0 8px 32px rgba(59, 130, 246, 0.18), 0 0 0 1px rgba(59, 130, 246, 0.1)",
                transition: { type: "spring", stiffness: 400, damping: 15 },
              }}
              whileTap={{ scale: 0.92 }}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSuggestionClick(SUGGESTIONS[i]);
              }}
            >
              {SUGGESTIONS[i]}
            </motion.button>
          </div>
        ))}
      </div>

      <motion.div className="w-full relative" animate={containerControls}>
        <motion.div
          className="w-full relative"
          animate={{ scale: focused ? 1 : 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
        >
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            animate={{
              boxShadow: focused
                ? "0 0 0 4px rgba(59, 130, 246, 0.08), 0 4px 20px rgba(59, 130, 246, 0.1)"
                : "0 0 0 0px rgba(59, 130, 246, 0), 0 0px 0px rgba(59, 130, 246, 0)",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="iMessage"
            className="w-full rounded-full bg-tertiary border border-primary px-4 py-2.5 pr-11 type-body text-primary placeholder:text-quaternary outline-none transition-colors"
            style={{
              borderColor: focused ? "rgba(59, 130, 246, 0.2)" : undefined,
            }}
          />
          <AnimatePresence>
            {value.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 22 }}
                whileHover={{
                  scale: 1.12,
                  transition: { type: "spring", stiffness: 400, damping: 14 },
                }}
                whileTap={{ scale: 0.85 }}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
                style={{
                  background: "rgba(59, 130, 246, 0.85)",
                  boxShadow: "0 2px 10px rgba(59, 130, 246, 0.25)",
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
};
