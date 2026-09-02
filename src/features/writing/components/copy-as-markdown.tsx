import { cn } from "@/lib/utils";
import { IconCheckmark1Small } from "central-icons/IconCheckmark1Small";
import { IconSquareBehindSquare1 } from "central-icons/IconSquareBehindSquare1";
import { useRef, useState } from "react";

/* Puts the whole post on the clipboard as markdown — the same body an agent gets from the
   page's `.md` twin (server/middleware/markdown.ts), code blocks and all, rather than the
   rendered DOM a manual selection would pick up. An article that invites you to hand it to
   an agent should not make you assemble it first. */

type State = "idle" | "copied" | "failed";

const LABEL: Record<State, string> = {
  idle: "Copy as Markdown",
  copied: "Copied",
  failed: "Copy failed",
};

// Long enough to read the confirmation, short enough that the button is ready again by the
// time anyone reaches for it twice.
const RESET_DELAY = 2000;

export function CopyAsMarkdown() {
  const [state, setState] = useState<State>("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const settle = (next: State) => {
    setState(next);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setState("idle"), RESET_DELAY);
  };

  const copy = async () => {
    try {
      // The twin of whatever page this is rendered on, so the button never needs to be told
      // which post it belongs to.
      const response = await fetch(`${window.location.pathname.replace(/\/$/, "")}.md`, {
        headers: { accept: "text/markdown" },
      });
      if (!response.ok) throw new Error(`${response.status}`);
      await navigator.clipboard.writeText(await response.text());
      settle("copied");
    } catch {
      // Clipboard access is refused outright in some contexts, and there is nothing to retry.
      // Saying so beats a button that silently does nothing.
      settle("failed");
    }
  };

  return (
    <div className="not-prose my-6">
      <button
        type="button"
        onClick={copy}
        // The confirmation replaces the label in place, so a screen reader hears the outcome
        // rather than the reader having to go looking for it.
        aria-live="polite"
        className={cn(
          "flex h-9 cursor-pointer items-center gap-2 rounded-full bg-surface py-1 pl-3.5 pr-4",
          "text-[13px] font-medium text-primary shadow-ring-xs hairline-black/8 dark:hairline-white/10",
          "outline-none transition-colors hover:bg-surface-tertiary dark:hover:bg-surface-secondary",
          "focus-visible:ring-2 focus-visible:ring-default",
          "touch-manipulation select-none",
        )}
      >
        {state === "copied" ? (
          <IconCheckmark1Small className="size-4 text-tertiary" />
        ) : (
          <IconSquareBehindSquare1 className="size-4 text-quaternary" />
        )}
        {LABEL[state]}
      </button>
    </div>
  );
}
