import { cn } from "@/lib/utils";
import { Fragment } from "react";

// Matches the fade-out in globals.css; the attribute is dropped afterwards so a repeat
// click on the same number replays the mark from the start.
const MARK_DURATION = 3500;
let clearMark: ReturnType<typeof setTimeout> | undefined;

// The footnote list is authored as plain markup inside <Footnotes>, so a reference finds its
// line by matching the <sup> number instead of relying on generated ids.
function jumpToFootnote(number: string) {
  const list = document.querySelector("[data-footnotes]");
  const target = list
    ? Array.from(list.querySelectorAll("p")).find(
        (line) => line.querySelector("sup")?.textContent?.trim() === number,
      )
    : undefined;
  if (!target) return;

  clearTimeout(clearMark);
  for (const previous of document.querySelectorAll("[data-footnote-active]")) {
    previous.removeAttribute("data-footnote-active");
  }
  // Forces a reflow between removing and re-adding the attribute, so clicking the same
  // number twice restarts the animation instead of doing nothing.
  void target.offsetWidth;
  target.setAttribute("data-footnote-active", "");
  clearMark = setTimeout(() => target.removeAttribute("data-footnote-active"), MARK_DURATION);
  target.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    block: "center",
  });
}

/** Superscript source numbers on a figure caption, e.g. "1, 2" — each jumps to its footnote. */
export function FootnoteRefs({ sources, className }: { sources: string; className?: string }) {
  const numbers = sources
    .split(",")
    .map((number) => number.trim())
    .filter(Boolean);

  return (
    <sup className={cn("ml-0.5 text-[9px] text-tertiary", className)}>
      {numbers.map((number, index) => (
        <Fragment key={number}>
          {index > 0 && ", "}
          <button
            type="button"
            aria-label={`Jump to footnote ${number}`}
            onClick={() => jumpToFootnote(number)}
            className="cursor-pointer underline decoration-transparent underline-offset-2 transition-colors duration-200 hover:decoration-tertiary"
          >
            {number}
          </button>
        </Fragment>
      ))}
    </sup>
  );
}
