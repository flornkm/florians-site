import Button from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IconClipboard } from "central-icons/IconClipboard";
import { IconCrossSmall } from "central-icons/IconCrossSmall";
import { IconImages1 as IconImages1Filled } from "central-icons-filled/IconImages1";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

interface Suggestion {
  url: string;
  size: number; // blobs have no identity — size is a cheap "is this the same image" key
}

// Punches a round transparent notch out of the thumbnail's bottom-right corner so the
// clipboard badge sits inside it, ring and all.
const BADGE_NOTCH =
  "radial-gradient(circle 12px at calc(100% - 5px) calc(100% - 5px), #0000 10.5px, #000 11.5px)";

// Reads an image off the clipboard via the async Clipboard API. Needs a focused, secure
// context with clipboard-read permission; otherwise ⌘V and drag-drop still work.
async function readClipboardImage(): Promise<Blob | null> {
  if (!navigator.clipboard?.read || !document.hasFocus()) return null;
  try {
    const items = await navigator.clipboard.read();
    const match = items
      .map((item) => ({
        item,
        type:
          item.types.find((t) => t === "image/png") ??
          item.types.find((t) => t.startsWith("image/")),
      }))
      .find((m) => m.type);
    if (match?.type) return await match.item.getType(match.type);
  } catch {
    // unsupported or denied
  }
  return null;
}

function imageFromItems(list: DataTransferItemList | null | undefined): File | null {
  if (!list) return null;
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (item.kind === "file" && item.type.startsWith("image/")) {
      const file = item.getAsFile();
      if (file) return file;
    }
  }
  return null;
}

export const ClipboardPredict = () => {
  const reduced = useReducedMotion() ?? false;

  const [image, setImage] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [dragging, setDragging] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<string | null>(null);
  const suggestionSize = useRef<number | null>(null);
  const dismissedSize = useRef<number | null>(null);
  imageRef.current = image;

  const accept = useCallback((blob: Blob) => {
    const url = URL.createObjectURL(blob);
    setImage((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setSuggestion((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });
    suggestionSize.current = null;
    dismissedSize.current = null;
  }, []);

  // Peek at the real system clipboard. If it holds an image the user hasn't already
  // uploaded or dismissed, surface it as a suggestion in the field.
  const peekClipboard = useCallback(async () => {
    if (imageRef.current) return;
    const blob = await readClipboardImage();
    if (!blob || imageRef.current) return;
    if (blob.size === dismissedSize.current || blob.size === suggestionSize.current) return;

    const url = URL.createObjectURL(blob);
    setSuggestion((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return { url, size: blob.size };
    });
    suggestionSize.current = blob.size;
  }, []);

  // Re-check whenever the user returns to the tab (e.g. back from Finder after copying).
  useEffect(() => {
    peekClipboard();
    const onFocus = () => peekClipboard();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [peekClipboard]);

  // ⌘V anywhere drops the image straight in — the reliable path that needs no permission.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const file = imageFromItems(e.clipboardData?.items);
      if (file) accept(file);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [accept]);

  useEffect(() => {
    return () => {
      if (imageRef.current) URL.revokeObjectURL(imageRef.current);
    };
  }, []);

  const acceptSuggestion = () => {
    if (!suggestion) return;
    setImage((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return suggestion.url; // hand ownership of the URL to the preview — don't revoke it
    });
    suggestionSize.current = null;
    dismissedSize.current = null;
    setSuggestion(null);
  };

  const dismiss = () => {
    if (!suggestion) return;
    dismissedSize.current = suggestion.size;
    URL.revokeObjectURL(suggestion.url);
    suggestionSize.current = null;
    setSuggestion(null);
  };

  const remove = () => {
    setImage((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    dismissedSize.current = null;
    peekClipboard();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith("image/")) accept(file);
  };

  return (
    <div className="flex h-full w-full items-center justify-center px-6 text-primary">
      <div className="relative">
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload an image"
          onClick={() => {
            peekClipboard();
            inputRef.current?.click();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
          }}
          onDrop={onDrop}
          className={cn(
            "relative flex h-56 w-80 cursor-pointer items-center justify-center overflow-hidden rounded-[20px] outline-none",
            "transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-default",
            image ? "" : dragging ? "scale-[1.01] bg-accent-primary/[0.03]" : "bg-surface",
          )}
        >
          <AnimatePresence mode="wait">
            {image ? (
              <motion.div
                key="preview"
                initial={reduced ? false : { opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <img src={image} alt="Uploaded" className="size-full object-cover" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    remove();
                  }}
                  aria-label="Remove image"
                  className="absolute right-2.5 top-2.5 flex size-7 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition-colors hover:bg-black/60"
                >
                  <IconCrossSmall className="size-4" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none flex flex-col items-center gap-3 px-6 text-center"
              >
                <motion.div
                  animate={{ scale: dragging ? 1.1 : 1, y: dragging ? -3 : 0 }}
                  transition={{ type: "spring", stiffness: 420, damping: 24 }}
                >
                  <IconImages1Filled className="size-8 text-quaternary opacity-30" />
                </motion.div>
                <span className="text-sm font-medium text-quaternary opacity-65">
                  {dragging ? "Drop to upload" : "Drag and drop, or click to browse"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) accept(file);
              e.target.value = "";
            }}
          />

          {/* Hairline as an overlay so it sits on top of the white area and the image edge. */}
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset",
              dragging ? "ring-accent-primary/40" : "ring-black/10 dark:ring-white/15",
            )}
          />
        </div>

        {/* The clipboard prediction — slightly wider than the field and tucked into its
            bottom edge, so it reads as emerging from the upload zone. */}
        <div className="absolute inset-x-0 bottom-0 z-10 -mx-2.5 translate-y-[64%]">
          <AnimatePresence>
            {suggestion && !image && (
              <motion.div
                key="suggestion"
                initial={reduced ? false : { opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ type: "spring", stiffness: 480, damping: 30 }}
                className="flex items-center gap-3 rounded-[18px] bg-surface p-2 shadow-xl ring-1 ring-black/[0.07] dark:bg-surface-tertiary"
              >
                <span className="relative shrink-0">
                  {/* The image + its ring are masked with a notch so the badge nests cleanly
                      into the corner instead of overlapping it. */}
                  <span
                    className="relative block size-9"
                    style={{
                      WebkitMaskImage: BADGE_NOTCH,
                      maskImage: BADGE_NOTCH,
                    }}
                  >
                    <img
                      src={suggestion.url}
                      alt=""
                      className="size-full rounded-[10px] object-cover"
                    />
                    <span className="pointer-events-none absolute inset-0 rounded-[10px] ring-1 ring-black/15 ring-inset dark:ring-white/20" />
                  </span>
                  <span className="absolute -right-1 -bottom-1 flex size-[18px] items-center justify-center rounded-full bg-blue-500 text-white">
                    <IconClipboard className="size-3" />
                  </span>
                </span>
                <div className="mr-1 flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium text-primary">
                    Image in clipboard
                  </span>
                  <span className="type-tiny text-tertiary">Found on your clipboard</span>
                </div>
                <Button size="xs" rounded onClick={acceptSuggestion} className="ml-auto px-2.5">
                  Upload
                </Button>
                <button
                  type="button"
                  onClick={dismiss}
                  aria-label="Dismiss"
                  className="flex size-7 shrink-0 items-center justify-center rounded-full text-tertiary transition-colors hover:bg-black/5 hover:text-secondary dark:hover:bg-white/5"
                >
                  <IconCrossSmall className="size-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
