import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

const PADDING = 8;

export const ChartTooltip = ({
  children,
  isOpen,
  position,
  className,
  side = "right",
  onMouseEnter,
  onMouseLeave,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  position: { x: number; y: number };
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) => {
  const [renderState, setRenderState] = useState<{
    shouldRender: boolean;
    animatePosition: boolean;
  }>({ shouldRender: false, animatePosition: false });
  const [displayedPosition, setDisplayedPosition] = useState(position);
  const [offsetX, setOffsetX] = useState(0);

  const tooltipRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const transformY = side === "top" ? "calc(-100% - 12px)" : side === "bottom" ? "12px" : "-50%";

  // Calculate screen bounds offset
  const calculateOffset = (x: number): number => {
    if (!tooltipRef.current) return 0;
    const tooltipWidth = tooltipRef.current.offsetWidth;
    const screenWidth = typeof window !== "undefined" ? window.innerWidth : 1024;
    const leftEdge = x - tooltipWidth / 2;
    const rightEdge = x + tooltipWidth / 2;

    if (leftEdge < PADDING) return PADDING - leftEdge;
    if (rightEdge > screenWidth - PADDING) return screenWidth - PADDING - rightEdge;
    return 0;
  };

  // Single effect to handle open/close and position updates
  useLayoutEffect(() => {
    if (isOpen) {
      // Clear any pending close timeout
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }

      const shouldAnimate = wasOpenRef.current;
      wasOpenRef.current = true;

      // Update position
      setDisplayedPosition({ x: position.x, y: position.y });

      // Calculate offset after position update
      requestAnimationFrame(() => {
        setOffsetX(calculateOffset(position.x));
      });

      // Update render state if needed
      setRenderState((prev) => {
        if (!prev.shouldRender || prev.animatePosition !== shouldAnimate) {
          return { shouldRender: true, animatePosition: shouldAnimate };
        }
        return prev;
      });
    } else {
      wasOpenRef.current = false;

      // Delay unmount for fade-out animation
      closeTimeoutRef.current = setTimeout(() => {
        setRenderState({ shouldRender: false, animatePosition: false });
      }, 150);
    }

    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, [isOpen, position.x, position.y]);

  // Handle scroll/wheel/touch to hide tooltip
  useEffect(() => {
    if (!isOpen || !onMouseLeave) return;

    const hide = () => onMouseLeave();
    const options = { capture: true, passive: true };

    window.addEventListener("scroll", hide, options);
    window.addEventListener("wheel", hide, options);
    window.addEventListener("touchstart", hide, options);

    return () => {
      window.removeEventListener("scroll", hide, { capture: true });
      window.removeEventListener("wheel", hide, { capture: true });
      window.removeEventListener("touchstart", hide, { capture: true });
    };
  }, [isOpen, onMouseLeave]);

  if (!renderState.shouldRender) return null;

  return createPortal(
    <div
      ref={tooltipRef}
      className={cn(
        "pointer-events-none fixed z-[53] duration-150 ease-out",
        renderState.animatePosition ? "transition-[left,top]" : "transition-none",
      )}
      style={{
        left: `${displayedPosition.x + offsetX}px`,
        top: `${displayedPosition.y}px`,
        transform: `translate(-50%, ${transformY})`,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className={cn(
          "w-auto whitespace-nowrap rounded-lg border border-primary bg-surface px-2 py-1.5 text-sm shadow-md shadow-black/5 dark:border-secondary dark:bg-surface",
          "pointer-events-none transition-[opacity,transform] duration-100 ease-out",
          className,
        )}
        style={{
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? "scale(1)" : "scale(0.95)",
          transformOrigin:
            side === "top"
              ? "bottom center"
              : side === "bottom"
                ? "top center"
                : side === "left"
                  ? "right center"
                  : "left center",
        }}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
};

export default ChartTooltip;
