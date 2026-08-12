import { useEffect, useState } from "react";

const CHARS_PER_TICK = 3;
const TICK_INTERVAL_MS = 16;

export function useTypingAnimation(text: string | undefined) {
  const [displayedText, setDisplayedText] = useState("");
  const [trackedText, setTrackedText] = useState<string | undefined>(undefined);

  // Reset synchronously during render when the target text changes. Doing this
  // in an effect would commit one stale frame (old text) before the reset lands.
  if (text !== trackedText) {
    setTrackedText(text);
    setDisplayedText("");
  }

  useEffect(() => {
    if (!text) return;

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
