import { cn } from "@/lib/utils";
import { Select as BaseSelect } from "@base-ui/react/select";
import { IconCheckmark1Small } from "central-icons/IconCheckmark1Small";
import { IconChevronGrabberVertical } from "central-icons/IconChevronGrabberVertical";
import type { ComponentProps } from "react";

const Root = BaseSelect.Root;
const Value = BaseSelect.Value;

function Trigger({ className, children, ...props }: ComponentProps<typeof BaseSelect.Trigger>) {
  return (
    <BaseSelect.Trigger
      className={cn(
        "flex h-9 shrink-0 cursor-pointer items-center justify-between gap-2",
        "rounded-full bg-surface py-1 pl-4 pr-2.5 text-[13px] font-medium text-primary",
        "shadow-ring-xs hairline-black/8 dark:hairline-white/10",
        "outline-none transition-colors hover:bg-surface-tertiary dark:hover:bg-surface-secondary",
        "focus-visible:ring-2 focus-visible:ring-default",
        className,
      )}
      {...props}
    >
      {children}
      <BaseSelect.Icon>
        <IconChevronGrabberVertical className="size-4 text-quaternary" />
      </BaseSelect.Icon>
    </BaseSelect.Trigger>
  );
}

type ContentProps = ComponentProps<typeof BaseSelect.Popup> &
  Pick<
    ComponentProps<typeof BaseSelect.Positioner>,
    "side" | "sideOffset" | "align" | "alignItemWithTrigger"
  >;

function Content({
  className,
  children,
  side,
  // Only felt when item alignment can't apply (touch devices, not enough room): the popup
  // natively overlays the trigger with the selected item on top of it, and side/sideOffset
  // are the fallback placement.
  sideOffset = 8,
  align,
  alignItemWithTrigger,
  ...props
}: ContentProps) {
  return (
    <BaseSelect.Portal>
      {/* z on the Positioner, not the Popup: the Positioner places itself with a transform,
          which would trap any z-index on its child in a stacking context of its own. */}
      <BaseSelect.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignItemWithTrigger={alignItemWithTrigger}
        className="z-[150]"
      >
        <BaseSelect.Popup
          className={cn(
            // The menu inherits the trigger's measured width plus a margin of its own: a menu
            // cut to the exact width of its trigger reads as the trigger having grown rather
            // than as a surface that opened over it.
            "w-[calc(var(--anchor-width)_+_2rem)] rounded-2xl bg-surface p-1.5",
            // A step brighter than the page it floats over in dark mode: on a near-black
            // surface a shadow has nothing left to darken, so the surface carries the lift.
            // The ring has to outrun that brighter fill: white/10 on the black page lands
            // darker than surface-tertiary and reads as a dark seam, so it goes to /20.
            "shadow-ring-lg hairline-black/8 dark:bg-surface-tertiary dark:hairline-white/20",
            "origin-[var(--transform-origin)] transition-all duration-150 ease-out",
            "data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            "data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            className,
          )}
          {...props}
        >
          <BaseSelect.List>{children}</BaseSelect.List>
        </BaseSelect.Popup>
      </BaseSelect.Positioner>
    </BaseSelect.Portal>
  );
}

function Item({ className, children, ...props }: ComponentProps<typeof BaseSelect.Item>) {
  return (
    <BaseSelect.Item
      className={cn(
        "flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2",
        "text-[13px] text-primary outline-none",
        // Dark highlight goes lighter, not darker: surface-secondary sits below the popup's
        // own surface there and would read as a hole.
        "data-[highlighted]:bg-surface-tertiary dark:data-[highlighted]:bg-white/8",
        className,
      )}
      {...props}
    >
      <BaseSelect.ItemText>{children}</BaseSelect.ItemText>
      <BaseSelect.ItemIndicator>
        <IconCheckmark1Small className="size-4 text-tertiary" />
      </BaseSelect.ItemIndicator>
    </BaseSelect.Item>
  );
}

export const Select = {
  Root,
  Trigger,
  Value,
  Content,
  Item,
};
