import { cn } from "@/lib/utils";
import { IconCheckmark1Small } from "central-icons/IconCheckmark1Small";
import { IconCrossSmall } from "central-icons/IconCrossSmall";
import { IconSquareBehindSquare1 } from "central-icons/IconSquareBehindSquare1";
import { useRef, useState } from "react";
import type { ComponentType } from "react";

/* Puts the whole post on the clipboard as markdown — the same body an agent gets from the
   page's `.md` twin (server/middleware/markdown.ts), code blocks and all, rather than the
   rendered DOM a manual selection would pick up. An article that invites you to hand it to
   an agent should not make you assemble it first.

   Inline and wordless: it sits at the end of the invitation, which already says what it does. */

type State = "idle" | "copied" | "failed";

const ICONS: Record<State, ComponentType<{ className?: string }>> = {
  idle: IconSquareBehindSquare1,
  copied: IconCheckmark1Small,
  failed: IconCrossSmall,
};

const LABEL: Record<State, string> = {
  idle: "Copy this post as Markdown",
  copied: "Copied as Markdown",
  failed: "Could not copy",
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
    <button
      type="button"
      onClick={copy}
      aria-label={LABEL[state]}
      title={LABEL[state]}
      className={cn(
        "not-prose ml-1 inline-grid size-6 shrink-0 cursor-pointer place-items-center align-[-0.3em]",
        "rounded-md text-quaternary transition-colors hover:bg-surface-tertiary hover:text-tertiary",
        "outline-none focus-visible:ring-2 focus-visible:ring-default",
        "touch-manipulation select-none",
      )}
    >
      {/* All three stacked in one cell so they cross-fade through each other rather than
          swapping: the outgoing icon shrinks away under the incoming one, which is what makes
          a state change read as the same control changing its mind rather than two buttons. */}
      {(Object.keys(ICONS) as State[]).map((key) => {
        const Icon = ICONS[key];
        const active = key === state;
        return (
          <Icon
            key={key}
            aria-hidden
            className={cn(
              "col-start-1 row-start-1 size-4 transition-all duration-200 ease-out",
              "motion-reduce:transition-none",
              active ? "scale-100 opacity-100" : "scale-50 opacity-0",
            )}
          />
        );
      })}
    </button>
  );
}
