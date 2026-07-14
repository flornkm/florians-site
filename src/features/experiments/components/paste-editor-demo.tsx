import { cn } from "@/lib/utils";
import { IconArrowRight } from "central-icons/IconArrowRight";
import { IconCrossSmall } from "central-icons/IconCrossSmall";
import { AnimatePresence, motion } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";

// Pastes above this length become an attachment instead of inline text.
const LARGE_PASTE_MIN_CHARS = 100;
const PREVIEW_SCALE = 0.7;
const EASE = [0.22, 1, 0.36, 1] as const;

// Rogo's primary recipe in solid sky blue (oklch keeps the hue steady across
// the fill/hover/active/border ramp): darker border from the same hue and a
// hairline inset top highlight. Accent artwork, the same blue in both themes.
// Flat, foundry-style primary: a plain solid fill with only a whisper of a
// top highlight — the hover/active ramp does the rest.
const PRIMARY_BUTTON = cn(
  "cursor-pointer text-white",
  "bg-[oklch(0.58_0.22_262)] hover:bg-[oklch(0.54_0.22_262)] active:bg-[oklch(0.51_0.22_262)]",
  "border border-[oklch(0.51_0.22_262)]",
  "shadow-[inset_0_0.5px_1px_rgba(255,255,255,0.2)]",
  "transition-colors duration-150 ease-out",
);

interface PastedItem {
  id: string;
  text: string;
}

export const PasteEditor = () => {
  const [value, setValue] = useState("");
  const [items, setItems] = useState<PastedItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const idRef = useRef(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const editingItem = items.find((i) => i.id === editingId) ?? null;
  const canSend = value.trim().length > 0 || items.length > 0;

  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [value]);

  // The editor textarea grows with its content so the wrapper (not the textarea)
  // owns scrolling — that's what lets the scroll-mask fade react to it.
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const editorTextarea = (el: HTMLTextAreaElement | null) => {
    editorRef.current = el;
    focusAtStart(el);
  };
  useLayoutEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }, [editingItem?.text]);

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData("text/plain").trim();
    if (text.length <= LARGE_PASTE_MIN_CHARS) return;
    e.preventDefault();
    setItems((prev) => [...prev, { id: `paste-${idRef.current++}`, text }]);
  };

  const updateItem = (id: string, text: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, text } : i)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const send = () => {
    if (!canSend) return;
    setValue("");
    setItems([]);
    setEditingId(null);
  };

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-5 px-6">
      <div className="w-full max-w-md">
        <div
          className={cn(
            // Grey fill behind a 1px embossed edge: white in light, and in dark a
            // translucent white sitting brighter than the fill, so the surface
            // reads raised instead of punched-in.
            "border border-white bg-surface-secondary p-2 dark:border-white/10 dark:bg-surface-tertiary",
            // Pill while collapsed (24px = half the one-line bar height); eases
            // to the nested 16px once the chip row expands.
            items.length > 0 ? "rounded-2xl" : "rounded-[24px]",
            // In dark the ring flips to a dark seam so the embossed border stays
            // the only bright line — ring + border both bright reads as one
            // thick fuzzy edge.
            "shadow-ring-sm hairline-black/8 dark:hairline-black/60",
            // Focus deepens the light hairline; in dark it brightens the
            // embossed border instead (the seam never changes).
            "transition-[box-shadow,border-radius,border-color] duration-200 ease-out",
            "focus-within:hairline-black/15 dark:focus-within:hairline-black/60",
            "dark:focus-within:border-white/20",
          )}
        >
          <AnimatePresence initial={false}>
            {items.length > 0 && (
              <motion.div
                // marginTop expands the clip box up into the bar's padding so the
                // chips' overhanging remove badge isn't cut off; it animates back
                // to 0 on exit so the collapsed row doesn't leave a -8px offset.
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: "auto", opacity: 1, marginTop: -8 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                transition={{ duration: 0.2, ease: EASE }}
                className="-mx-2 overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 p-3 pb-2">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <PastedChip
                        key={item.id}
                        item={item}
                        onOpen={() => setEditingId(item.id)}
                        onRemove={() => removeItem(item.id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onPaste={handlePaste}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder="Ask anything…"
              spellCheck={false}
              className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-primary outline-none placeholder:text-quaternary"
            />
            <motion.button
              type="button"
              onClick={send}
              disabled={!canSend}
              whileTap={canSend ? { scale: 0.9 } : undefined}
              aria-label="Send"
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full",
                "transition-[background-color,color,box-shadow,border-color] duration-200",
                canSend ? PRIMARY_BUTTON : "bg-black/[0.06] text-quaternary dark:bg-white/[0.08]",
              )}
            >
              <IconArrowRight className="size-4" />
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {editingItem && (
          <>
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setEditingId(null)}
              className="absolute inset-0 z-10 bg-black/15 dark:bg-black/40"
            />
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center p-6">
              <motion.div
                key={editingItem.id}
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 6 }}
                transition={{ duration: 0.2, ease: EASE }}
                className={cn(
                  "pointer-events-auto flex h-[min(100%,19rem)] w-full max-w-[26rem] flex-col overflow-hidden rounded-2xl",
                  "border border-white bg-surface-secondary dark:border-white/10 dark:bg-surface-tertiary",
                  "shadow-ring-xl hairline-black/8 dark:hairline-black/60",
                )}
              >
                <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
                  <span className="text-[13px] font-medium text-primary">Pasted text</span>
                  <span className="text-xs tabular-nums text-quaternary">
                    {editingItem.text.length} characters
                  </span>
                </div>

                {/* The textarea grows to its content and the wrapper scrolls, so the
                    scroll-mask fade tracks the wrapper's scroll position. */}
                <div
                  className={cn(
                    "scroll-mask min-h-0 flex-1 overflow-y-auto [--scroll-mask-size:2.5rem]",
                    "[scrollbar-color:var(--text-quaternary)_transparent] [scrollbar-width:thin]",
                  )}
                >
                  <textarea
                    ref={editorTextarea}
                    value={editingItem.text}
                    onChange={(e) => updateItem(editingItem.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        // Close only the editor, not the experiment dialog around it.
                        e.stopPropagation();
                        setEditingId(null);
                      }
                    }}
                    spellCheck={false}
                    className="block w-full resize-none overflow-hidden bg-transparent px-4 py-1 pb-4 font-mono text-xs leading-relaxed text-primary outline-none"
                  />
                </div>

                <div className="flex items-center justify-between px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => removeItem(editingItem.id)}
                    className="cursor-pointer rounded-full px-3 py-1 text-xs font-medium text-tertiary transition-colors hover:bg-black/5 hover:text-primary dark:hover:bg-white/10"
                  >
                    Remove
                  </button>
                  <motion.button
                    type="button"
                    onClick={() => setEditingId(null)}
                    whileTap={{ scale: 0.96 }}
                    className={cn(PRIMARY_BUTTON, "rounded-full px-3 py-1 text-xs font-medium")}
                  >
                    Save
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Focus once on mount with the cursor at the top, so the document reads from the beginning.
function focusAtStart(el: HTMLTextAreaElement | null) {
  if (!el || el.dataset.focused) return;
  el.dataset.focused = "true";
  el.focus();
  el.setSelectionRange(0, 0);
}

function PastedChip({
  item,
  onOpen,
  onRemove,
}: {
  item: PastedItem;
  onOpen: () => void;
  onRemove: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.18, ease: EASE }}
      // Named group — the experiment dialog wrapping this demo is itself a
      // `group`, so a bare group-hover on the badge fires for the whole dialog.
      className="group/chip relative"
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label="Edit pasted text"
        className={cn(
          "relative block h-16 w-44 cursor-pointer overflow-hidden rounded-lg text-left",
          "bg-surface shadow-ring-xs hairline-black/8 dark:bg-surface-tertiary dark:hairline-white/10",
          "transition-colors duration-200 hover:bg-surface-secondary dark:hover:bg-interactive-active",
        )}
      >
        <div className="h-full overflow-hidden p-2 [mask-image:linear-gradient(to_bottom,black_30%,transparent_95%)]">
          <div
            className="origin-top-left"
            style={{ transform: `scale(${PREVIEW_SCALE})`, width: `${100 / PREVIEW_SCALE}%` }}
          >
            <PastePreview text={item.text} />
          </div>
        </div>
      </button>

      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove pasted text"
        className={cn(
          "absolute -top-1.5 -right-1.5 z-10 flex size-5 cursor-pointer items-center justify-center rounded-full",
          "bg-surface text-tertiary shadow-ring-xs hairline-black/8 dark:hairline-white/10",
          "hover:bg-interactive-hover hover:text-primary",
          "pointer-events-none scale-90 opacity-0",
          "transition-[transform,opacity,color,background-color] duration-150 ease-out",
          // Hover only — focus-within would pin it visible after the chip is
          // clicked. Keyboard access via the badge's own focus-visible.
          "group-hover/chip:pointer-events-auto group-hover/chip:scale-100 group-hover/chip:opacity-100",
          "focus-visible:pointer-events-auto focus-visible:scale-100 focus-visible:opacity-100",
        )}
      >
        <IconCrossSmall className="size-3" />
      </button>
    </motion.div>
  );
}

function stripInline(line: string) {
  return line
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1");
}

// A deliberately tiny line renderer — at chip scale only heading weight, bullets
// and mono code lines read, so full markdown parsing would be wasted.
function PastePreview({ text }: { text: string }) {
  const lines = text.split("\n").slice(0, 12);
  let inCode = false;

  return (
    <>
      {lines.map((raw, i) => {
        const line = raw.trimEnd();
        if (line.startsWith("```")) {
          inCode = !inCode;
          return null;
        }
        if (inCode) {
          return (
            <div key={i} className="font-mono text-[10px] leading-[1.5] text-tertiary">
              {line || " "}
            </div>
          );
        }
        const heading = line.match(/^#{1,4}\s+(.*)/);
        if (heading) {
          return (
            <div key={i} className="text-[13px] leading-[1.6] font-medium text-primary">
              {stripInline(heading[1])}
            </div>
          );
        }
        const bullet = line.match(/^[-*]\s+(.*)/);
        if (bullet) {
          return (
            <div key={i} className="flex gap-1 text-[11px] leading-[1.6] text-secondary">
              <span className="text-quaternary">•</span>
              <span>{stripInline(bullet[1])}</span>
            </div>
          );
        }
        if (!line) return <div key={i} className="h-1" />;
        return (
          <div key={i} className="text-[11px] leading-[1.6] text-secondary">
            {stripInline(line)}
          </div>
        );
      })}
    </>
  );
}
