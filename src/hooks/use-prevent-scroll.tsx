import { useEffect } from "react";

/**
 * Prevents page scrolling when `active` is true.
 * - prevents iOS Safari scroll with a non-passive `touchmove` handler.
 */
export function usePreventScroll(active: boolean): void {
  useEffect(() => {
    if (!active) return;

    // Guard for SSR environments
    if (typeof document === "undefined") return;
    const { body } = document;
    const prevOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    const preventTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    // iOS Safari requires passive:false to be able to call preventDefault()
    document.addEventListener("touchmove", preventTouchMove, { passive: false });

    return () => {
      body.style.overflow = prevOverflow;
      document.removeEventListener("touchmove", preventTouchMove);
    };
  }, [active]);
}

export default usePreventScroll;
