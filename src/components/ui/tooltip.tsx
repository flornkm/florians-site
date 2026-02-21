import { cn } from "@/lib/utils";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import React, { useMemo } from "react";
import { Body3 } from "../design-system/body";

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return (
    <BaseTooltip.Provider delay={150} closeDelay={0} timeout={100}>
      {children}
    </BaseTooltip.Provider>
  );
}

// --- Standalone tooltip (for isolated triggers) ---

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function Tooltip({ children, content, className, style }: TooltipProps) {
  return (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger
        render={(triggerProps) => (
          <div {...triggerProps} className={cn("relative", className, triggerProps.className)} style={style}>
            {children}
          </div>
        )}
      />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner sideOffset={8}>
          <BaseTooltip.Popup
            className={cn(
              "z-50 font-medium bg-surface-inverted text-inverted px-2 py-1 rounded-lg",
              "origin-[var(--transform-origin)]",
              "transition-all duration-100 ease-out",
              "data-[starting-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:translate-y-1",
              "data-[ending-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:translate-y-1",
            )}
          >
            <Body3 className="text-inverted whitespace-nowrap">{content}</Body3>
            <BaseTooltip.Arrow
              className={cn(
                "data-[side=bottom]:top-[-4px]",
                "data-[side=top]:bottom-[-4px]",
                "data-[side=left]:right-[-4px]",
                "data-[side=right]:left-[-4px]",
              )}
            >
              <div className="w-2 h-2 bg-surface-inverted rounded-[2px] rotate-45" />
            </BaseTooltip.Arrow>
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}

// --- Animated tooltip group (for adjacent triggers with smooth transitions) ---

const easing = "cubic-bezier(0.1,1,0.36,1)";

interface TooltipGroupProps {
  children: React.ReactNode;
}

interface TooltipTriggerProps {
  children: React.ReactNode;
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

const TooltipGroupContext = React.createContext<BaseTooltip.Handle<React.ComponentType> | null>(null);

export function TooltipGroup({ children }: TooltipGroupProps) {
  const handle = useMemo(() => BaseTooltip.createHandle<React.ComponentType>(), []);

  return (
    <>
      {/* Provide handle to triggers */}
      <TooltipGroupContext.Provider value={handle}>{children}</TooltipGroupContext.Provider>

      {/* Shared popup root */}
      <BaseTooltip.Root handle={handle}>
        {({ payload: Payload }) => (
          <BaseTooltip.Portal>
            <BaseTooltip.Positioner
              sideOffset={8}
              className={cn(
                "h-[var(--positioner-height)] w-[var(--positioner-width)]",
                "max-w-[var(--available-width)]",
                "transition-[top,left,right,bottom,transform]",
                `duration-[0.35s] ease-[${easing}]`,
                "data-[instant]:transition-none",
              )}
            >
              <BaseTooltip.Popup
                className={cn(
                  "relative z-50 font-medium bg-surface-inverted text-inverted rounded-lg",
                  "h-[var(--popup-height,auto)] w-[var(--popup-width,auto)]",
                  `origin-[var(--transform-origin)]`,
                  `transition-[width,height,opacity,scale] duration-[0.1s] ease-[${easing}]`,
                  "data-[starting-style]:opacity-0 data-[starting-style]:scale-90",
                  "data-[ending-style]:opacity-0 data-[ending-style]:scale-90",
                  "data-[instant]:transition-none",
                )}
              >
                <BaseTooltip.Viewport
                  className={cn(
                    "[--vip:0.5rem]",
                    "relative h-full w-full overflow-clip",
                    "px-[var(--vip)] py-1",
                    // Current content
                    "[&_[data-current]]:w-[calc(var(--popup-width)-2*var(--vip))]",
                    "[&_[data-current]]:translate-x-0 [&_[data-current]]:opacity-100",
                    `[&_[data-current]]:transition-[translate,opacity] [&_[data-current]]:duration-[350ms,175ms] [&_[data-current]]:ease-[${easing}]`,
                    // Previous content
                    "[&_[data-previous]]:w-[calc(var(--popup-width)-2*var(--vip))]",
                    "[&_[data-previous]]:translate-x-0 [&_[data-previous]]:opacity-100",
                    `[&_[data-previous]]:transition-[translate,opacity] [&_[data-previous]]:duration-[350ms,175ms] [&_[data-previous]]:ease-[${easing}]`,
                    // Direction-aware slide animations
                    "data-[activation-direction~='left']:[&_[data-current][data-starting-style]]:-translate-x-1/2",
                    "data-[activation-direction~='left']:[&_[data-current][data-starting-style]]:opacity-0",
                    "data-[activation-direction~='right']:[&_[data-current][data-starting-style]]:translate-x-1/2",
                    "data-[activation-direction~='right']:[&_[data-current][data-starting-style]]:opacity-0",
                    "data-[activation-direction~='left']:[&_[data-previous][data-ending-style]]:translate-x-1/2",
                    "data-[activation-direction~='left']:[&_[data-previous][data-ending-style]]:opacity-0",
                    "data-[activation-direction~='right']:[&_[data-previous][data-ending-style]]:-translate-x-1/2",
                    "data-[activation-direction~='right']:[&_[data-previous][data-ending-style]]:opacity-0",
                    // Instant mode
                    "[[data-instant]_&_[data-previous]]:transition-none",
                    "[[data-instant]_&_[data-current]]:transition-none",
                  )}
                >
                  {Payload !== undefined && <Payload />}
                </BaseTooltip.Viewport>
              </BaseTooltip.Popup>
            </BaseTooltip.Positioner>
          </BaseTooltip.Portal>
        )}
      </BaseTooltip.Root>
    </>
  );
}

export function TooltipTrigger({ children, content, className, style }: TooltipTriggerProps) {
  const handle = React.useContext(TooltipGroupContext);
  if (!handle) {
    throw new Error("TooltipTrigger must be used inside a TooltipGroup");
  }

  const ContentComponent = useMemo(() => {
    return function TooltipContent() {
      return <Body3 className="text-inverted whitespace-nowrap">{content}</Body3>;
    };
  }, [content]);

  return (
    <BaseTooltip.Trigger
      handle={handle}
      payload={ContentComponent}
      render={(triggerProps) => (
        <div {...triggerProps} className={cn("relative", className, triggerProps.className)} style={style}>
          {children}
        </div>
      )}
    />
  );
}

// --- Rich tooltip (for large component content) ---

interface RichTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  className?: string;
  maxWidth?: number;
}

export function RichTooltip({ children, content, className, maxWidth = 360 }: RichTooltipProps) {
  return (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger
        render={(triggerProps) => (
          <span
            {...triggerProps}
            tabIndex={0}
            className={cn(
              "underline decoration-muted underline-offset-2 hover:decoration-emphasis/50 cursor-context-menu transition-colors duration-200 outline-none focus-visible:decoration-emphasis/50",
              className,
              triggerProps.className,
            )}
          >
            {children}
          </span>
        )}
      />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner sideOffset={12}>
          <BaseTooltip.Popup
            className={cn(
              "z-50 bg-primary border border-primary rounded-lg shadow-lg p-3 overflow-hidden",
              "origin-[var(--transform-origin)]",
              "transition-all duration-100 ease-out",
              "data-[starting-style]:opacity-0 data-[starting-style]:scale-95",
              "data-[ending-style]:opacity-0 data-[ending-style]:scale-95",
            )}
            style={{ maxWidth }}
          >
            {content}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}
