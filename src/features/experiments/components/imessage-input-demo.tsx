import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

const SUGGESTIONS = ["Sounds good!", "On my way", "See you soon"];

export const IMessageInputDemo = () => {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSuggestionClick = (text: string) => {
    setValue(text);
    inputRef.current?.focus();
  };

  const handleSend = () => {
    setValue("");
  };

  return (
    <div className="flex flex-col items-center justify-end w-full max-w-[320px] h-[180px]">
      <AnimatePresence>
        {focused && (
          <motion.div className="flex items-center gap-1.5 mb-2.5">
            {SUGGESTIONS.map((text, i) => (
              <motion.button
                key={text}
                initial={{ opacity: 0, scale: 0.5, y: 8, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.8, y: 4, filter: "blur(2px)" }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 28,
                  delay: i * 0.05,
                }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer select-none whitespace-nowrap rounded-full bg-tertiary px-3 py-1.5 type-small text-secondary border border-primary"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSuggestionClick(text);
                }}
              >
                {text}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="iMessage"
          className="w-full rounded-full bg-secondary border border-primary px-4 py-2 pr-10 type-body text-primary placeholder:text-quaternary outline-none transition-all duration-150 focus:bg-surface-secondary"
        />
        <AnimatePresence>
          {value.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-accent-primary flex items-center justify-center cursor-pointer"
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
                className="text-inverted"
              >
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
