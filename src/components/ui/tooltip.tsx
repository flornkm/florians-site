import { cn } from "@/lib/utils";
import React, { createContext, memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Body3 } from "../design-system/body";

const MIN_DISTANCE = 8;

interface TooltipState {
  content: string;
  triggerRect: DOMRect;
  isVisible: boolean;
}

interface TooltipContextType {
  showTooltip: (element: HTMLElement, content: string) => void;
  hideTooltip: () => void;
}

const TooltipContext = createContext<TooltipContextType | null>(null);

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const fadeTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const showTooltip = useCallback(
    (element: HTMLElement, content: string) => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = undefined;
      }
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = undefined;
      }

      const rect = element.getBoundingClientRect();
      const newTriggerCenter = rect.left + rect.width / 2;

      if (tooltip && tooltip.isVisible) {
        const currentTriggerCenter = tooltip.triggerRect.left + tooltip.triggerRect.width / 2;
        const distance = Math.abs(newTriggerCenter - currentTriggerCenter);

        if (distance > 100) {
          setTooltip((prev) => (prev ? { ...prev, isVisible: false } : null));
          fadeTimeoutRef.current = setTimeout(() => {
            setTooltip({
              content,
              triggerRect: rect,
              isVisible: true,
            });
          }, 200);
          return;
        }
      }

      setTooltip((_) => ({
        content,
        triggerRect: rect,
        isVisible: true,
      }));
    },
    [tooltip],
  );

  const hideTooltip = useCallback(() => {
    hideTimeoutRef.current = setTimeout(() => {
      setTooltip((prev) => (prev ? { ...prev, isVisible: false } : null));
    }, 150);
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, []);

  const contextValue = useMemo(() => ({ showTooltip, hideTooltip }), [showTooltip, hideTooltip]);

  return (
    <TooltipContext.Provider value={contextValue}>
      {children}
      <TooltipPortal tooltip={tooltip} />
    </TooltipContext.Provider>
  );
}

const TooltipPortal = memo(
  function TooltipPortal({ tooltip }: { tooltip: TooltipState | null }) {
    const [mounted, setMounted] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [arrowLeft, setArrowLeft] = useState(0);
    const [shouldAnimate, setShouldAnimate] = useState(false);
    const prevTooltipRef = useRef<TooltipState | null>(null);

    useEffect(() => {
      setMounted(true);
    }, []);

    const calculatePosition = useCallback(
      (tooltipWidth: number = 100, tooltipHeight: number = 32, triggerRect: DOMRect) => {
        const triggerCenter = triggerRect.left + triggerRect.width / 2;
        const viewportWidth = window.innerWidth;

        let x = triggerCenter - tooltipWidth / 2;
        const y = triggerRect.top - tooltipHeight - 8;

        if (x < MIN_DISTANCE) {
          x = MIN_DISTANCE;
        } else if (x + tooltipWidth > viewportWidth - MIN_DISTANCE) {
          x = viewportWidth - MIN_DISTANCE - tooltipWidth;
        }

        const arrowPos = Math.max(8, Math.min(triggerCenter - x, tooltipWidth - 8));

        return { x, y, arrowPos };
      },
      [],
    );

    useEffect(() => {
      if (!tooltip) {
        setPosition({ x: 0, y: 0 });
        setShouldAnimate(false);
        prevTooltipRef.current = null;
        return;
      }

      const { triggerRect, isVisible } = tooltip;
      const prevTooltip = prevTooltipRef.current;

      if (!isVisible) {
        setShouldAnimate(false);
        prevTooltipRef.current = tooltip;
        return;
      }

      if (isVisible) {
        const dimensions = tooltipRef.current
          ? { width: tooltipRef.current.offsetWidth, height: tooltipRef.current.offsetHeight }
          : { width: 100, height: 32 };

        const { x, y, arrowPos } = calculatePosition(dimensions.width, dimensions.height, triggerRect);

        const shouldAnimatePosition = Boolean(
          prevTooltip && prevTooltip.isVisible && prevTooltip.triggerRect && position.x !== 0 && position.y !== 0,
        );

        setPosition({ x, y });
        setArrowLeft(arrowPos);
        setShouldAnimate(shouldAnimatePosition);
      }

      prevTooltipRef.current = tooltip;
    }, [tooltip, calculatePosition, position.x, position.y]);

    if (!mounted || !tooltip) return null;

    return createPortal(
      <div
        ref={tooltipRef}
        className={cn(
          "fixed z-50 pointer-events-none font-medium bg-surface-inverted text-inverted px-2 py-1 rounded-lg ease-out",
          tooltip.isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
        )}
        style={{
          left: position.x,
          top: position.y,
          transform: tooltip.isVisible ? "none" : "translateY(4px)",
          transition: shouldAnimate
            ? "left 200ms ease-out, top 200ms ease-out, opacity 200ms ease-out, transform 200ms ease-out, scale 200ms ease-out"
            : "opacity 200ms ease-out, transform 200ms ease-out, scale 200ms ease-out",
        }}
      >
        <Body3 className="text-inverted whitespace-nowrap">{tooltip.content}</Body3>
        <div
          className={cn(
            "w-2 h-2 bg-surface-inverted rounded-[2px] rotate-45 absolute top-full -mt-0.5 ease-out",
            shouldAnimate ? "transition-all duration-200" : "transition-none",
          )}
          style={{
            left: arrowLeft,
            transform: "translateX(-50%)",
          }}
        />
      </div>,
      document.body,
    );
  },
  (prevProps, nextProps) => {
    const prev = prevProps.tooltip;
    const next = nextProps.tooltip;

    if (prev === next) return true;
    if (!prev || !next) return false;

    return (
      prev.content === next.content &&
      prev.isVisible === next.isVisible &&
      prev.triggerRect.left === next.triggerRect.left &&
      prev.triggerRect.top === next.triggerRect.top &&
      prev.triggerRect.width === next.triggerRect.width &&
      prev.triggerRect.height === next.triggerRect.height
    );
  },
);

interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  content: string;
  className?: string;
}

const Tooltip = memo(
  function Tooltip({ children, content, className, ...props }: TooltipProps) {
    const context = useContext(TooltipContext);
    const triggerRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = useCallback(() => {
      if (context && triggerRef.current) {
        context.showTooltip(triggerRef.current, content);
      }
    }, [context, content]);

    const handleMouseLeave = useCallback(() => {
      if (context) {
        context.hideTooltip();
      }
    }, [context]);

    if (!context) {
      return (
        <div className={cn("relative group/tooltip", className)} {...props}>
          {children}
          <div className="absolute bottom-full mb-1 group-hover/tooltip:mb-2 left-1/2 pointer-events-none font-medium -translate-x-1/2 bg-surface-inverted text-inverted px-2 py-1 rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 delay-75">
            <Body3 className="text-inverted whitespace-nowrap">{content}</Body3>
            <div className="w-2 h-2 bg-surface-inverted -translate-y-1/2 rounded-[2px] rotate-45 absolute top-full left-1/2 -translate-x-1/2" />
          </div>
        </div>
      );
    }

    return (
      <div
        ref={triggerRef}
        className={cn("relative", className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.content === nextProps.content &&
      prevProps.children === nextProps.children &&
      prevProps.className === nextProps.className
    );
  },
);

export default Tooltip;
