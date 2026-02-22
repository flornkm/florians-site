import { useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useRef, useState } from "react";

export function useScrollThreshold(threshold: number): boolean {
  const { scrollY } = useScroll();
  const [exceeded, setExceeded] = useState(false);
  const ready = useRef(false);

  // To prevent initial effects because of route changes when the user was scrolled down, we wait for the first animation frame
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      ready.current = true;
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useMotionValueEvent(scrollY, "change", (y) => {
    if (ready.current) setExceeded(y > threshold);
  });

  return exceeded;
}
