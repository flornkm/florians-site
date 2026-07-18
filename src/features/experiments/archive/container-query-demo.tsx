import Toggle from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { IconChevronDownSmall } from "central-icons/IconChevronDownSmall";
import { useRef, useState } from "react";

// The card stacks at 300px of *container* width (the @max-[300px] variants below). The
// dialog viewport never crosses a media-query breakpoint while you drag; that's the point.
const MIN_WIDTH = 216;
const MAX_WIDTH = 400;
const KEY_STEP = 16;

const clamp = (w: number) => Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, w));

export const ContainerQuery = () => {
  const [contained, setContained] = useState(true);
  const [width, setWidth] = useState(384);
  const [dragging, setDragging] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, width: 0 });

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    // Measure the rendered width (max-w-full may have clamped the styled one) so the
    // first move never jumps.
    dragStart.current = {
      x: e.clientX,
      width: frameRef.current?.getBoundingClientRect().width ?? width,
    };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    // The frame is centered, so its right edge only moves half a pixel per pixel of
    // width; double the delta to keep the handle under the pointer.
    setWidth(clamp(dragStart.current.width + (e.clientX - dragStart.current.x) * 2));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") setWidth((w) => clamp(w - KEY_STEP));
    if (e.key === "ArrowRight" || e.key === "ArrowUp") setWidth((w) => clamp(w + KEY_STEP));
  };

  return (
    <div className="relative flex h-full w-full max-w-full flex-col items-center justify-center px-8 py-6">
      <div
        ref={frameRef}
        style={{ width }}
        // 20px sits between the mathematically concentric 24px (card 12px + padding
        // 12px), which reads too round here, and the too-tight 16px. Florian's call.
        className="relative max-w-full rounded-[20px] bg-black/[0.04] p-3 dark:bg-white/[0.06]"
      >
        <div className={cn(contained && "@container/card")}>
          <ExportPanel />
        </div>

        <button
          type="button"
          role="slider"
          aria-label="Container width"
          aria-orientation="horizontal"
          aria-valuemin={MIN_WIDTH}
          aria-valuemax={MAX_WIDTH}
          aria-valuenow={Math.round(width)}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={() => setDragging(false)}
          onPointerCancel={() => setDragging(false)}
          onKeyDown={onKeyDown}
          className="group absolute -right-3.5 top-1/2 flex h-14 w-7 -translate-y-1/2 cursor-ew-resize touch-none items-center justify-center outline-none"
        >
          <span
            className={cn(
              "h-9 w-1 rounded-full bg-(--border-primary)/60 transition-colors",
              "group-hover:bg-(--border-primary) group-focus-visible:bg-(--border-primary)",
              dragging && "bg-(--text-quaternary) group-hover:bg-(--text-quaternary)",
            )}
          />
        </button>
      </div>

      {/* Pinned to the demo's bottom edge, out of the flex flow: the frame grows and
          shrinks while dragging, and the control must never shift with it. */}
      <label className="absolute bottom-6 left-1/2 inline-flex -translate-x-1/2 select-none items-center gap-3 text-xs text-tertiary">
        <Toggle checked={contained} onCheckedChange={setContained} />
        <span>Container query</span>
      </label>
    </div>
  );
};

// Breakpoint classes are @container variants: they only apply while the wrapper above
// actually is a container (toggle on). Off, the field grid keeps its two wide columns
// no matter how narrow you drag; a media query would be just as blind.
function ExportPanel() {
  return (
    <div className="flex flex-col gap-4 overflow-hidden rounded-xl bg-surface p-4 shadow-ring-md">
      <div className="min-w-0">
        <p className="truncate text-[15px] font-medium text-primary">Export</p>
        {/* Wraps instead of truncating when stacked: the narrow layout is the
            adapted-and-correct state, so nothing in it should look cut off. */}
        <p className="truncate text-balance text-[13px] text-quaternary @max-[300px]/card:whitespace-normal">
          Download a copy of this page.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 @max-[300px]/card:grid-cols-1">
        <Field label="Format">
          <WordLogo />
          <span className="truncate">Word (.docx)</span>
          {/* ml-auto: content stays left-grouped in the full-width chip; only the
              chevron rides the right edge. */}
          <IconChevronDownSmall className="ml-auto size-3.5 shrink-0 text-quaternary" />
        </Field>
        <Field label="Page size">
          <span className="truncate">A4</span>
          <IconChevronDownSmall className="ml-auto size-3.5 shrink-0 text-quaternary" />
        </Field>
      </div>

      <button
        type="button"
        className={cn(
          "w-full cursor-pointer rounded-lg py-2 text-[13px] font-medium",
          "bg-accent-primary text-inverted hover:bg-accent-primary-hover",
          "transition-[background-color,scale] duration-150 active:scale-[0.98]",
        )}
      >
        Export
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="truncate text-[13px] text-secondary">{label}</span>
      <button
        type="button"
        className={cn(
          "flex w-full min-w-0 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5",
          "bg-surface-tertiary text-[13px] font-medium text-primary",
          "transition-[background-color,scale] duration-150 active:scale-[0.97]",
          "hover:bg-interactive-active",
        )}
      >
        {children}
      </button>
    </div>
  );
}

// Microsoft Word logo (via brandlogos.net). Content artwork, not UI chrome.
const WordLogo = () => (
  <svg viewBox="0 0 35 36" className="size-4 shrink-0" aria-hidden>
    <defs>
      <radialGradient
        id="wd-a"
        cx="-619.29"
        cy="488.84"
        r="1"
        gradientTransform="translate(29495.74 9885.89) scale(47.57 -20.15)"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset=".18" stopColor="#1657f4" />
        <stop offset=".57" stopColor="#0036c4" />
      </radialGradient>
      <linearGradient
        id="wd-b"
        x1="5"
        y1="97"
        x2="27.97"
        y2="97"
        gradientTransform="translate(0 116) scale(1 -1)"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stopColor="#66c0ff" />
        <stop offset=".26" stopColor="#0094f0" />
      </linearGradient>
      <radialGradient
        id="wd-c"
        cx="-637.72"
        cy="517.98"
        r="1"
        gradientTransform="translate(-40017.96 -12225.34) rotate(133.55) scale(29.36 -72.32)"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset=".14" stopColor="#d471ff" />
        <stop offset=".83" stopColor="#509df5" stopOpacity="0" />
      </radialGradient>
      <radialGradient
        id="wd-d"
        cx="-611.76"
        cy="514.18"
        r="1"
        gradientTransform="translate(-52234.57 11411.47) rotate(90) scale(18.62 -101.65)"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset=".28" stopColor="#4f006f" stopOpacity="0" />
        <stop offset="1" stopColor="#4f006f" />
      </radialGradient>
      <linearGradient
        id="wd-e"
        x1="5"
        y1="107.22"
        x2="35"
        y2="106.72"
        gradientTransform="translate(0 116) scale(1 -1)"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stopColor="#9deaff" />
        <stop offset=".2" stopColor="#3bd5ff" />
      </linearGradient>
      <radialGradient
        id="wd-f"
        cx="-650.27"
        cy="515.34"
        r="1"
        gradientTransform="translate(-26921.47 -31089.42) rotate(166.85) scale(29.49 -70.64)"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset=".06" stopColor="#e4a7fe" />
        <stop offset=".54" stopColor="#e4a7fe" stopOpacity="0" />
      </radialGradient>
      <radialGradient
        id="wd-g"
        cx="-600.8"
        cy="515.58"
        r="1"
        gradientTransform="translate(1363.5 17878.99) rotate(45) scale(22.63 -22.63)"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset=".08" stopColor="#367af2" />
        <stop offset=".87" stopColor="#001a8f" />
      </radialGradient>
      <radialGradient
        id="wd-h"
        cx="-598.04"
        cy="557.24"
        r="1"
        gradientTransform="translate(-7105.12 6724.6) rotate(90) scale(11.2 -12.77)"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset=".59" stopColor="#2763e5" stopOpacity="0" />
        <stop offset=".97" stopColor="#58aafe" />
      </radialGradient>
    </defs>
    <path
      d="M5,27.09l14-17.09,16,11.11v11.39c0,1.93-1.57,3.5-3.5,3.5H11c-3.31,0-6-2.69-6-6v-2.91Z"
      fill="url(#wd-a)"
    />
    <path
      d="M5,15.04c0-2.49,2.01-4.5,4.5-4.5h20.39l5.11-2.54v12.5c0,1.93-1.57,3.5-3.5,3.5H11c-3.31,0-6,2.69-6,6v-14.96Z"
      fill="url(#wd-b)"
    />
    <path
      d="M5,15.04c0-2.49,2.01-4.5,4.5-4.5h20.39l5.11-2.54v12.5c0,1.93-1.57,3.5-3.5,3.5H11c-3.31,0-6,2.69-6,6v-14.96Z"
      fill="url(#wd-c)"
      fillOpacity=".6"
    />
    <path
      d="M5,15.04c0-2.49,2.01-4.5,4.5-4.5h20.39l5.11-2.54v12.5c0,1.93-1.57,3.5-3.5,3.5H11c-3.31,0-6,2.69-6,6v-14.96Z"
      fill="url(#wd-d)"
      fillOpacity=".1"
    />
    <path
      d="M5,6C5,2.69,7.69,0,11,0h20.5c1.93,0,3.5,1.57,3.5,3.5v5c0,1.93-1.57,3.5-3.5,3.5H11c-3.31,0-6,2.69-6,6V6Z"
      fill="url(#wd-e)"
    />
    <path
      d="M5,6C5,2.69,7.69,0,11,0h20.5c1.93,0,3.5,1.57,3.5,3.5v5c0,1.93-1.57,3.5-3.5,3.5H11c-3.31,0-6,2.69-6,6V6Z"
      fill="url(#wd-f)"
      fillOpacity=".8"
    />
    <rect y="17" width="16" height="16" rx="3.25" ry="3.25" fill="url(#wd-g)" />
    <rect y="17" width="16" height="16" rx="3.25" ry="3.25" fill="url(#wd-h)" fillOpacity=".65" />
    <path
      d="M13.49,20.43l-1.97,9.14h-2.35s-1.16-5.48-1.16-5.48l-1.22,5.49h-2.38l-1.89-9.14h1.94l1.17,6.03,1.16-6.03h2.38l1.21,6.03,1.14-6.03h1.97Z"
      fill="#fff"
    />
  </svg>
);
