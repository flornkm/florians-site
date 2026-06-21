import { cn } from "@/lib/utils";
import { DrawerPreview as Drawer } from "@base-ui/react/drawer";
import { IconArrowUndoUp } from "central-icons/IconArrowUndoUp";
import type { ComponentType } from "react";
import { useState } from "react";
import "./drag-image-drawer-demo.css";

// Two identical floating drawers, one attribute apart. An <img> is draggable by
// default, so pressing and dragging one fires the browser's native image drag — which
// emits `pointercancel` and aborts the drawer's swipe, so the sheet never follows your
// finger. The reliable, cross-browser fix is `draggable={false}` (NOT `user-select`,
// which only blocks the drag in WebKit). We pair it with `-webkit-user-drag: none` for
// older Safari.
const PHOTO = "/images/experiments/drawer-photo.webp";

interface Card {
  locked: boolean;
  label: string;
  Icon: ComponentType;
  badge: string;
}

const CARDS: Card[] = [
  { locked: false, label: "Drags the photo", Icon: CrossIcon, badge: "bg-inverted text-inverted" },
  {
    locked: true,
    label: "Swipes to close",
    Icon: CheckIcon,
    badge: "bg-blue-500 text-white",
  },
];

export const DragImageDrawer = () => {
  return (
    <div className="flex h-full w-full max-w-full items-center justify-center px-6 py-8 text-primary">
      <div className="grid w-full max-w-[22rem] grid-cols-2 gap-4">
        {CARDS.map((card) => (
          <DrawerCard key={card.label} {...card} />
        ))}
      </div>
    </div>
  );
};

function DrawerCard({ locked, label, Icon, badge }: Card) {
  const [open, setOpen] = useState(true);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={setContainer}
        className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl bg-surface-secondary hairline-black/8 dark:hairline-white/10"
      >
        {container && (
          <Drawer.Root
            open={open}
            onOpenChange={setOpen}
            modal={false}
            swipeDirection="down"
            disablePointerDismissal
          >
            <Drawer.Portal container={container}>
              <Drawer.Backdrop className="dragdrawer__backdrop" />
              <Drawer.Viewport className="dragdrawer__viewport">
                <Drawer.Popup
                  className="dragdrawer__popup font-pretendard"
                  initialFocus={false}
                  finalFocus={false}
                >
                  {/* The image sits directly in the Popup, NOT inside Drawer.Content —
                      Content always carries `data-swipe-ignore`, which makes Base UI
                      drop mouse swipes over it (so its text stays selectable). We want
                      the whole sheet to be the swipe surface, so the native-drag bug is
                      actually reachable. */}
                  <Drawer.Title className="sr-only">{`${label} drawer`}</Drawer.Title>
                  <div className="flex justify-center pb-1 pt-2">
                    <div className="h-1 w-9 rounded-full bg-quaternary/70" />
                  </div>
                  <div className="min-h-0 flex-1 px-2 pb-2 pt-1">
                    <div className="relative size-full">
                      <img
                        src={PHOTO}
                        alt=""
                        // `draggable={false}` is the actual fix — it stops the native
                        // image drag in every browser. `-webkit-user-drag` just mirrors it
                        // for older Safari.
                        draggable={!locked}
                        className={cn(
                          "size-full rounded-lg object-cover",
                          // The left must STAY draggable to show the bug; `<img>` defaults
                          // to user-select:none, which WebKit treats as "not draggable", so
                          // re-enable selection there or the drag wouldn't reproduce.
                          locked
                            ? "[-webkit-user-drag:none]"
                            : "select-text [-webkit-user-select:auto] [-webkit-user-drag:element]",
                        )}
                      />
                      {/* Inset hairline so the photo's edges read crisply against the sheet.
                          pointer-events-none keeps the drag/swipe reaching the image. */}
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-black/10"
                      />
                    </div>
                  </div>
                </Drawer.Popup>
              </Drawer.Viewport>
            </Drawer.Portal>
          </Drawer.Root>
        )}

        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="absolute inset-0 z-[3] flex cursor-pointer flex-col items-center justify-center gap-2 text-tertiary outline-none"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-surface shadow-ring-sm hairline-black/8 dark:hairline-white/10">
              <IconArrowUndoUp className="size-4 text-secondary" />
            </span>
            <span className="type-tiny select-none">Reopen</span>
          </button>
        )}
      </div>

      <div className="flex select-none items-center gap-2">
        <span className={cn("flex size-5 items-center justify-center rounded-full", badge)}>
          <Icon />
        </span>
        <span className="whitespace-nowrap text-[15px] font-medium text-primary">{label}</span>
      </div>
    </div>
  );
}

// Same stroke icons as the scrollbar-gutter experiment's Verdict.
function CheckIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth={3.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg width={11} height={11} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth={3.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
