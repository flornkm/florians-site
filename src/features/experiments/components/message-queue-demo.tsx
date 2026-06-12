import { cn } from "@/lib/utils";
import { IconArrowCornerDownLeft } from "central-icons/IconArrowCornerDownLeft";
import { AnimatePresence, motion, Reorder } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface QueuedMessage {
  id: number;
  text: string;
}

// Critically damped — the tray reads as a physical surface sliding out from
// behind the input, so any bounce would break the metaphor.
const SPRING = { type: "spring", duration: 0.45, bounce: 0 } as const;

const LIFETIME = 5000;

export const MessageQueue = () => {
  const [queue, setQueue] = useState<QueuedMessage[]>([]);
  const [value, setValue] = useState("");
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const nextId = useRef(1);

  // Only the head of the queue is ever "sent": a single timer for the front row
  // keeps dequeues sequential and following the current (drag-reordered) order —
  // per-item clocks would fire in enqueue order, regardless of reordering. Any
  // drag clears the timer (a row vanishing mid-drag would reshuffle the list
  // under the pointer); release arms a fresh lifetime for the new head.
  const headId = queue[0]?.id;
  useEffect(() => {
    if (headId === undefined || draggingId !== null) return;
    const timer = setTimeout(() => setQueue((q) => q.filter((m) => m.id !== headId)), LIFETIME);
    return () => clearTimeout(timer);
  }, [headId, draggingId]);

  const submit = () => {
    const text = value.trim();
    if (!text) return;
    const id = nextId.current++;
    setQueue((q) => [...q, { id, text }]);
    setValue("");
  };

  const hasText = value.trim() !== "";
  const chipState = hasText ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 };

  return (
    <div className="flex h-full w-full items-center justify-center px-6">
      {/* Bottom-justified fixed-height stage: the input never moves while the
          tray above it grows and shrinks. */}
      <div className="flex h-72 w-full max-w-sm flex-col justify-end">
        <AnimatePresence initial={false}>
          {queue.length > 0 && (
            <motion.div
              key="tray"
              layout
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24, transition: { duration: 0.2, ease: "easeOut" } }}
              transition={SPRING}
              // motion only scale-corrects radii set via `style` while the
              // layout animation stretches the box.
              style={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
              // dark:bg-white/[0.04]: dark surface-secondary (#0a0a0a) matches the
              // dialog background exactly, which would make the tray invisible.
              className="relative -mb-3 bg-surface-secondary px-1.5 pb-4 pt-1.5 dark:bg-white/[0.04]"
            >
              <Reorder.Group
                axis="y"
                values={queue}
                onReorder={setQueue}
                className="relative flex flex-col"
              >
                <AnimatePresence initial={false} mode="popLayout">
                  {queue.map((message) => {
                    const dragging = draggingId === message.id;
                    return (
                      <Reorder.Item
                        key={message.id}
                        value={message}
                        initial={{ opacity: 0, y: 12, filter: "blur(2px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{
                          opacity: 0,
                          y: -10,
                          filter: "blur(2px)",
                          transition: { duration: 0.25, ease: "easeOut" },
                        }}
                        transition={SPRING}
                        whileDrag={{ scale: 1.02 }}
                        onDragStart={() => setDraggingId(message.id)}
                        onDragEnd={() => setDraggingId(null)}
                        className={cn(
                          "relative flex cursor-grab select-none items-center rounded-lg px-3 py-2",
                          "text-[13px] font-medium text-secondary",
                          "transition-[background-color,box-shadow,color] duration-200",
                          !dragging && "hover:bg-interactive-hover",
                          dragging &&
                            "z-10 cursor-grabbing bg-surface text-primary shadow-ring-sm hairline-black/8 dark:hairline-white/10",
                        )}
                      >
                        <span className="min-w-0 truncate">{message.text}</span>
                      </Reorder.Item>
                    );
                  })}
                </AnimatePresence>
              </Reorder.Group>
            </motion.div>
          )}
        </AnimatePresence>

        <form
          className="relative z-10"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Queue a message..."
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="send"
            className={cn(
              "w-full rounded-xl bg-surface py-3 pl-4 pr-11 text-sm font-medium text-primary",
              "shadow-ring-lg hairline-black/8 dark:hairline-white/10",
              "outline-none placeholder:text-quaternary",
            )}
          />
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            {/* Always mounted with a retargetable animate — submit clears the value
                the instant the enter animation starts, and an AnimatePresence exit
                interrupted that early can wedge the chip visible. */}
            <motion.span
              aria-hidden
              initial={false}
              animate={chipState}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="grid size-5 place-items-center rounded-md bg-surface-secondary text-tertiary"
            >
              <IconArrowCornerDownLeft className="size-3" />
            </motion.span>
          </div>
        </form>
      </div>
    </div>
  );
};
