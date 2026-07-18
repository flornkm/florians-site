import { DrawerPreview as Drawer } from "@base-ui/react/drawer";
import { IconCrossSmall } from "central-icons/IconCrossSmall";
import { type ComponentType, Suspense } from "react";
import "./experiment-drawer.css";

interface ExperimentDrawerProps {
  open: boolean;
  title: string;
  Component: ComponentType;
  onOpenChange: (open: boolean) => void;
}

export function ExperimentDrawer({ open, title, Component, onOpenChange }: ExperimentDrawerProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} swipeDirection="down">
      <Drawer.Portal>
        <Drawer.Backdrop className="experiment-drawer__backdrop" />
        <Drawer.Viewport className="experiment-drawer__viewport">
          <Drawer.Popup className="experiment-drawer__popup">
            <Drawer.Close
              aria-label="Close"
              className="absolute right-3 top-3 z-10 flex size-6 items-center justify-center rounded-sm text-neutral-500 transition-colors hover:bg-black/5 dark:text-neutral-400 dark:hover:bg-white/5 cursor-pointer"
            >
              <IconCrossSmall className="size-4" />
            </Drawer.Close>
            {/* The experiment opts out of swipe so its own gestures aren't hijacked. */}
            <Drawer.Content
              className="experiment-drawer__content font-pretendard"
              data-base-ui-swipe-ignore
            >
              <Drawer.Title className="sr-only">{title}</Drawer.Title>
              <Suspense fallback={null}>
                <Component />
              </Suspense>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
