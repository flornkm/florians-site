import { useEffect, useRef, useState } from "react";

const CHARS_PER_TICK = 3;
const TICK_INTERVAL_MS = 16;

export function useTypingAnimation(text: string | undefined) {
  const [displayedText, setDisplayedText] = useState("");
  const previousTextRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!text) {
      setDisplayedText("");
      return;
    }

    // If text is the same as before (e.g., from cache), show immediately
    if (text === previousTextRef.current) {
      setDisplayedText(text);
      return;
    }

    // New text - animate it
    previousTextRef.current = text;
    setDisplayedText("");
    let currentIndex = 0;

    const intervalId = setInterval(() => {
      currentIndex += CHARS_PER_TICK;
      if (currentIndex >= text.length) {
        setDisplayedText(text);
        clearInterval(intervalId);
      } else {
        setDisplayedText(text.slice(0, currentIndex));
      }
    }, TICK_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [text]);

  return displayedText;
}
