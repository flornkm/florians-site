import { cn } from "@/lib/utils";
import { IconArrowUp } from "central-icons/IconArrowUp";
import { IconCrossSmall } from "central-icons/IconCrossSmall";
import { IconFileText } from "central-icons-filled/IconFileText";
import { AnimatePresence, motion } from "motion/react";
import type { ClipboardEvent, KeyboardEvent } from "react";
import { useRef, useState } from "react";

const SPRING = { type: "spring", stiffness: 700, damping: 40, mass: 0.6 } as const;

// Below this length a paste is just text and lands in the field; at or above it the
// paste would drown the input, so it collapses into an attachment instead.
const CHIP_THRESHOLD = 200;

const SAMPLE = `Subject: Q3 planning notes

Attendees agreed the onboarding flow needs a full rework before the October launch. Current drop-off sits at 38% on the second screen, mostly on the permissions step. Proposal: move permissions to the moment they're actually needed instead of front-loading them.

Design wants two weeks for exploration, engineering estimates three weeks of build after that. Marketing asked that the new flow ships behind a flag so the campaign screenshots stay stable until the announcement.

Open questions: do we migrate existing users to the new flow immediately, and who owns the copy review? Follow-up scheduled for Thursday.`;

interface Attachment {
  id: number;
  text: string;
}

function wordCount(text: string) {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

// A chat prompt input where a long paste doesn't flood the field: it condenses into a
// chip, and the chip morphs into an inline editor so the pasted text stays editable
// without ever stretching the composer.
export const PromptInput = () => {
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const nextId = useRef(1);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const attach = (text: string) => {
    setAttachments((prev) => [...prev, { id: nextId.current++, text }]);
  };

  const onPaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData("text/plain");
    if (text.length < CHIP_THRESHOLD) return;
    e.preventDefault();
    attach(text);
  };

  const remove = (id: number) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const send = () => {
    setValue("");
    setAttachments([]);
    setEditingId(null);
    inputRef.current?.focus();
  };

  const onInputKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const editing = attachments.find((a) => a.id === editingId) ?? null;
  const canSend = value.trim() !== "" || attachments.length > 0;

  return (
    <div className="font-pretendard relative flex h-full w-full flex-col items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl bg-surface p-2 shadow-ring-sm">
        <AnimatePresence initial={false}>
          {attachments.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={SPRING}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-1.5 p-1 pb-2">
                {attachments.map((a) => (
                  <Chip
                    key={a.id}
                    attachment={a}
                    hidden={editingId === a.id}
                    onOpen={() => setEditingId(a.id)}
                    onRemove={() => remove(a.id)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onPaste={onPaste}
          onKeyDown={onInputKeyDown}
          rows={2}
          placeholder="Ask anything, or paste something long…"
          className="w-full resize-none bg-transparent px-2 pt-1.5 text-sm text-primary outline-none placeholder:text-quaternary"
        />

        <div className="flex items-center justify-end px-1 pb-1">
          <button
            type="button"
            onClick={send}
            disabled={!canSend}
            aria-label="Send"
            className={cn(
              "flex size-7 cursor-pointer items-center justify-center rounded-full transition-colors",
              "outline-none focus-visible:ring-2 focus-visible:ring-default",
              canSend
                ? "bg-accent-primary text-accent-foreground"
                : "cursor-default bg-surface-tertiary text-quaternary",
            )}
          >
            <IconArrowUp className="size-4" />
          </button>
        </div>
      </div>

      <button
        type="button"
        data-sample
        onClick={() => attach(SAMPLE)}
        className={cn(
          "absolute bottom-4 left-1/2 -translate-x-1/2 cursor-pointer rounded-full px-3.5 py-1 text-xs font-medium",
          "text-tertiary transition-colors hover:text-secondary",
          "outline-none focus-visible:ring-2 focus-visible:ring-default",
        )}
      >
        Paste sample text
      </button>

      {/* The chip morphs into this editor via layoutId, so "open" reads as the chip
          growing — not a second surface appearing on top of it. */}
      <AnimatePresence>
        {editing && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setEditingId(null)}
              className="absolute inset-0 z-10 bg-black/10 dark:bg-black/30"
            />
            <Editor
              key={editing.id}
              attachment={editing}
              onChange={(text) =>
                setAttachments((prev) =>
                  prev.map((a) => (a.id === editing.id ? { ...a, text } : a)),
                )
              }
              onClose={() => setEditingId(null)}
              onRemove={() => remove(editing.id)}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

function Chip({
  attachment,
  hidden,
  onOpen,
  onRemove,
}: {
  attachment: Attachment;
  hidden: boolean;
  onOpen: () => void;
  onRemove: () => void;
}) {
  return (
    <motion.div
      layoutId={`pasted-${attachment.id}`}
      transition={SPRING}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
      // While the editor owns the layoutId the chip must not also claim it, but it
      // stays mounted so the close morph has a target to land on.
      style={{ visibility: hidden ? "hidden" : "visible" }}
      className="group relative flex items-center gap-2 rounded-lg bg-surface-secondary py-1.5 pl-2 pr-2.5"
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label="Edit pasted text"
        className="absolute inset-0 cursor-pointer rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-default"
      />
      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-surface text-secondary shadow-ring-xs">
        <IconFileText className="size-3.5" />
      </span>
      <span className="flex flex-col text-left">
        <span className="text-xs font-medium text-primary">Pasted text</span>
        <span className="text-[10px] text-tertiary">{wordCount(attachment.text)} words</span>
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove pasted text"
        className={cn(
          "relative flex size-4 cursor-pointer items-center justify-center rounded-full text-tertiary",
          "opacity-0 transition-opacity hover:text-primary group-hover:opacity-100",
          "outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-default",
        )}
      >
        <IconCrossSmall className="size-3.5" />
      </button>
    </motion.div>
  );
}

function Editor({
  attachment,
  onChange,
  onClose,
  onRemove,
}: {
  attachment: Attachment;
  onChange: (text: string) => void;
  onClose: () => void;
  onRemove: () => void;
}) {
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      // Swallow it — the experiment dialog also closes on Escape, and one keypress
      // should only ever back out one level.
      e.stopPropagation();
      onClose();
    }
  };

  return (
    <motion.div
      layoutId={`pasted-${attachment.id}`}
      transition={SPRING}
      onKeyDown={onKeyDown}
      className="absolute inset-x-6 top-1/2 z-20 mx-auto flex h-[min(70%,18rem)] max-w-md -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-surface shadow-ring-sm"
    >
      <div className="flex items-center justify-between px-4 pt-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-primary">Pasted text</span>
          <span className="text-xs text-tertiary">{wordCount(attachment.text)} words</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onRemove}
            className={cn(
              "cursor-pointer rounded-md px-2 py-1 text-xs font-medium text-tertiary",
              "transition-colors hover:text-destructive",
              "outline-none focus-visible:ring-2 focus-visible:ring-default",
            )}
          >
            Remove
          </button>
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "cursor-pointer rounded-md bg-surface-tertiary px-2.5 py-1 text-xs font-medium text-primary",
              "transition-colors hover:bg-interactive-hover",
              "outline-none focus-visible:ring-2 focus-visible:ring-default",
            )}
          >
            Done
          </button>
        </div>
      </div>
      <textarea
        value={attachment.text}
        onChange={(e) => onChange(e.target.value)}
        autoFocus
        className="mt-2 flex-1 resize-none bg-transparent px-4 pb-4 text-[13px] leading-relaxed text-secondary outline-none"
      />
    </motion.div>
  );
}
