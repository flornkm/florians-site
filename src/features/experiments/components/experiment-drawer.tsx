import { DrawerPreview as Drawer } from "@base-ui/react/drawer";
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
            {/* The only draggable region: touches here bubble to the viewport's swipe
                handlers; Content below stops them, so the sheet can't be dismissed by
                dragging the experiment itself. */}
            <div className="experiment-drawer__handle" aria-hidden>
              <div className="experiment-drawer__grabber" />
            </div>
            <Drawer.Content
              className="experiment-drawer__content"
              // Content's built-in data-swipe-ignore only covers mouse drags; the viewport's
              // touch path doesn't check it, so touch swipes must be stopped from bubbling.
              onTouchStart={(event) => event.stopPropagation()}
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
