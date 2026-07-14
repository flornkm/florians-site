import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "motion/react";

const CAPTION_CLASS =
  "mx-auto mt-4 max-w-[460px] text-center font-serif text-[11px] font-normal italic text-primary";

// The figure caption fades in one word at a time, each blurring into focus.
export function AnimatedCaption({ text, className }: { text: string; className?: string }) {
  const reduceMotion = useReducedMotion();
  const words = text.split(" ");

  if (reduceMotion) {
    return <figcaption className={cn(CAPTION_CLASS, className)}>{text}</figcaption>;
  }

  return (
    <motion.figcaption
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { delayChildren: 0.15, staggerChildren: 0.045 } },
      }}
      className={cn(CAPTION_CLASS, className)}
    >
      {words.map((word, i) => (
        <motion.span
          // Words are positional, not unique — the index is the only stable key.
          key={i}
          className="inline-block whitespace-pre"
          variants={{
            hidden: { opacity: 0, y: 4, filter: "blur(4px)" },
            visible: { opacity: 1, y: 0, filter: "blur(0px)" },
          }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </motion.figcaption>
  );
}
