import { AnimatePresence, motion, useAnimationControls } from "motion/react";
import { useRef, useState } from "react";

const SUGGESTIONS = [
  { text: "Sounds good!", rotation: -3 },
  { text: "On my way", rotation: 2 },
  { text: "See you soon", rotation: -2 },
];

export const IMessageInputDemo = () => {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerControls = useAnimationControls();

  const handleSuggestionClick = (text: string) => {
    setValue(text);
    containerControls.start({
      scale: [1, 1.03, 0.985, 1],
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    });
  };

  const handleSend = () => {
    containerControls.start({
      x: [0, -2, 3, -1, 0],
      transition: { duration: 0.35, ease: "easeOut" },
    });
    setValue("");
  };

  return (
    <div
      className="flex flex-col items-center justify-center w-full max-w-[320px] gap-2.5"
      onClick={() => inputRef.current?.focus()}
    >
      <AnimatePresence>
        {focused && (
          <motion.div
            className="flex gap-2 items-center origin-bottom"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            {SUGGESTIONS.map((suggestion, i) => (
              <motion.button
                key={suggestion.text}
                initial={{ opacity: 0, scale: 0, y: 30, rotate: 0, filter: "blur(4px)" }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  rotate: suggestion.rotation,
                  filter: "blur(0px)",
                }}
                exit={{
                  opacity: 0,
                  scale: 0.5,
                  y: 20,
                  rotate: 0,
                  filter: "blur(4px)",
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: (SUGGESTIONS.length - 1 - i) * 0.03,
                  },
                }}
                transition={{
                  type: "spring",
                  stiffness: 320,
                  damping: 16,
                  delay: i * 0.07,
                }}
                whileHover={{
                  scale: 1.08,
                  rotate: 0,
                  transition: { type: "spring", stiffness: 400, damping: 15 },
                }}
                whileTap={{ scale: 0.92 }}
                className="px-3.5 py-1.5 rounded-full bg-quaternary text-secondary type-small cursor-pointer select-none"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSuggestionClick(suggestion.text);
                }}
              >
                {suggestion.text}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="w-full relative"
        animate={containerControls}
      >
        <motion.div
          className="w-full relative"
          animate={{
            scale: focused ? 1 : 0.96,
          }}
          transition={{
            type: "spring",
            stiffness: 380,
            damping: 18,
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="iMessage"
            className="w-full rounded-full bg-tertiary border border-primary px-4 py-2.5 pr-11 type-body text-primary placeholder:text-quaternary outline-none focus:border-secondary transition-colors"
          />
          <AnimatePresence>
            {value.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0, rotate: 180 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 20,
                }}
                whileHover={{
                  scale: 1.15,
                  transition: { type: "spring", stiffness: 400, damping: 12 },
                }}
                whileTap={{ scale: 0.85 }}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-accent-primary flex items-center justify-center cursor-pointer"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
              >
                <motion.svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-inverted"
                  animate={{ y: [0, -1, 0] }}
                  transition={{
                    repeat: Infinity,
                    repeatDelay: 1.5,
                    duration: 0.5,
                    ease: "easeInOut",
                  }}
                >
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </motion.svg>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
};
