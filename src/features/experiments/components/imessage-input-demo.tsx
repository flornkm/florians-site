import { AnimatePresence, motion } from "motion/react";
import { useState, useRef } from "react";

const SUGGESTIONS = ["Sounds good!", "On my way", "See you soon"];

export const IMessageInputDemo = () => {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="flex flex-col items-center justify-center w-full max-w-sm px-6 gap-3"
      onClick={() => inputRef.current?.focus()}
    >
      <AnimatePresence>
        {focused && (
          <div className="flex gap-2 items-center">
            {SUGGESTIONS.map((suggestion, i) => (
              <motion.button
                key={suggestion}
                initial={{ opacity: 0, scale: 0.4, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.6, y: 8 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 22,
                  delay: i * 0.06,
                }}
                className="px-3.5 py-1.5 rounded-full bg-quaternary text-secondary type-small cursor-pointer select-none hover:bg-interactive-active active:scale-95 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setValue(suggestion);
                }}
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
        )}
      </AnimatePresence>

      <motion.div
        className="w-full relative"
        animate={{
          scale: focused ? 1 : 0.97,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="iMessage"
          className="w-full rounded-full bg-tertiary border border-primary px-4 py-2.5 type-body text-primary placeholder:text-quaternary outline-none focus:border-secondary transition-colors"
        />
        <AnimatePresence>
          {value.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-accent-primary flex items-center justify-center cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setValue("");
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
                className="text-inverted"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
