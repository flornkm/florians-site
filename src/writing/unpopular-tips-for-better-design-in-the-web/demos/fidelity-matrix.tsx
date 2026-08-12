import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/* Figure for "Prototype on two axes" in the Unpopular tips article.

   One camera component rendered at nine points of a fidelity × interactivity matrix, driven by
   a draggable 2D pad. The two axes are deliberately independent:

   - Fidelity is what it LOOKS like: a hand-drawn sketch → the browser's default widgets
     (literally `all: revert`, no imitation) → the polished surface language the other figures
     use.
   - Interactivity is what it DOES: a dead mockup → wired states (press, flash) with a fake
     viewfinder → the real getUserMedia stream with a working shutter.

   The point of the matrix is the off-diagonal corners. Sketch × Live is a scribble with a real
   camera behind it; Polished × Static is the opposite — chrome with nothing inside. The pad
   updates the component continuously while dragging, so scrubbing across the grid is the demo. */

type Level = 0 | 1 | 2;

const FIDELITY = ["Sketch", "Default", "Polished"] as const;
const INTERACTIVITY = ["Static", "Wired", "Live"] as const;

// ---------------------------------------------------------------------------------------------
// Sketch artwork. Hand-authored wobbly paths (not generated) so they are stable across renders
// and SSR. The frame path doubles as the video's clip: CSS `clip-path: path(...)` shares the
// SVG coordinate space when the element is exactly FRAME_W × FRAME_H, so the stream is cropped
// by the same line the pen drew.
// ---------------------------------------------------------------------------------------------

const FRAME_W = 240;
const FRAME_H = 180;
// Drawn at 240×180 (the coordinate space every sketch path and clip-path is authored in) and
// scaled up as a whole — resizing the box instead would orphan the paths.
const CAMERA_SCALE = 1.25;

const FRAME_PATH =
  "M20 32 C18 18 27 11 44 11 C76 8 112 10 148 9 C178 8 208 10 219 15 C229 20 228 38 228 56 " +
  "C229 86 230 116 226 142 C224 160 213 169 190 168 C152 172 108 170 62 170 C40 171 20 166 18 148 " +
  "C14 120 15 88 16 60 C16 48 18 40 20 32 Z";

const BTN_W = 150;
const BTN_H = 44;

const BTN_PATH =
  "M13 14 C14 7 24 6 38 6 C66 4 100 5 126 7 C138 8 143 13 142 22 C141 31 137 37 124 38 " +
  "C98 41 64 40 36 39 C22 39 9 37 9 27 C9 21 10 18 13 14 Z";

// "Make photo", hand-lettered as open strokes — same pen (2.2, round caps) as the button
// outline, so the label and the frame read as one drawing rather than a font placed on top.
const LETTER_PATHS = [
  // M
  "M28 28 C28.5 23 29 18 30 14 L33.5 24 L37 14 C38 18 38.5 23 39 28",
  // a
  "M48 20 C44 18 42 21 42 24 C42 27 45 29 47.5 27 M48 19 C47.5 22 47.5 25 48.5 28",
  // k
  "M52.5 13 C52 18 52 23 52.5 28 M58.5 19 C56 21 54 23 52.5 24 C54.5 25 56.5 26.5 58 28",
  // e
  "M62.5 24 C65 23.5 67.5 22.5 68.5 21 C68.5 18.5 65.5 18.5 63.5 20.5 C62 22.5 62 25.5 63.5 27 C65.5 28.5 67.5 27.5 68.8 26.5",
  // p
  "M77 19 C76.7 24 76.7 29 76.2 33.5 M77.2 21 C79 18.5 82.5 18.5 83.5 21 C84.5 23.5 83 26.5 80.5 26.5 C79 26.5 77.8 25.5 77.3 24.5",
  // h
  "M87.5 13 C87 18 87 23 87.5 28 M87.5 21.5 C89.5 19 93 18.5 93.5 21.5 C94 23.5 93.8 26 94 28",
  // o
  "M100.5 19 C97.5 19.5 96.8 23 97.5 25.5 C98.5 28 102 28.3 103.3 25.8 C104.5 23 103.3 19.5 100.5 19",
  // t
  "M109.5 14 C109 18 109 23 109.5 27.5 C110 28.2 111 28 112 27.4 M107 19.5 C108.5 19 110.5 18.8 112.3 18.8",
  // o
  "M118.5 19 C115.5 19.5 114.8 23 115.5 25.5 C116.5 28 120 28.3 121.3 25.8 C122.5 23 121.3 19.5 118.5 19",
];

// The captured print at sketch fidelity, 84 × 68: the photo clipped by a small wobbly frame,
// same trick as the main viewfinder.
const THUMB_W = 84;
const THUMB_H = 68;
const THUMB_PATH =
  "M9 12 C8 6 13 4 20 4 C38 2 58 3 72 5 C79 6 81 10 80 17 C81 32 81 47 79 57 C78 63 72 65 63 64 " +
  "C46 66 27 65 15 64 C8 64 4 61 5 53 C3 39 4 26 6 17 C6 14 7 13 9 12 Z";

// The scribbled sitter for Sketch × Wired: a hand-drawn self-portrait where the camera feed
// will eventually be. Same pen as everything else.
const FACE_PATHS = [
  // head
  "M120 44 C140 44 154 60 153 80 C152 100 138 112 120 112 C102 112 88 100 87 80 C86 60 100 44 120 44",
  // hair
  "M96 58 C100 48 108 42 118 41",
  "M104 50 C112 42 124 40 134 45",
  "M126 42 C134 44 142 50 146 58",
  // brows
  "M104 70 C107 68 111 68 114 70",
  "M126 70 C129 68 133 68 136 70",
  // eyes
  "M106 78 C108 76 111 76 113 78",
  "M127 78 C129 76 132 76 134 78",
  // nose
  "M119 80 C118 85 117 88 121 90",
  // mouth
  "M110 98 C114 102 126 102 130 98",
  // ears
  "M87 78 C84 76 83 82 86 86",
  "M153 78 C156 76 157 82 154 86",
  // neck
  "M106 111 C106 117 105 121 103 124",
  "M134 111 C134 117 135 121 137 124",
  // shoulders
  "M70 152 C80 136 96 126 120 126 C144 126 160 136 170 152",
];

function SketchFace({ className }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${FRAME_W} ${FRAME_H}`}
      className={className}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <g
        fill="none"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-neutral-900 dark:stroke-neutral-100"
      >
        {FACE_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}

// Diagonal hatching for the static sketch — the pencil fill that says "picture goes here".
const HATCH_PATHS = [
  "M36 150 C70 118 104 84 134 44",
  "M66 156 C102 122 138 86 168 48",
  "M100 158 C134 126 168 92 196 56",
  "M134 160 C166 130 196 100 216 70",
];

// ---------------------------------------------------------------------------------------------
// Camera plumbing. The stream only exists while interactivity is at Live; leaving that column
// (or unmounting) stops every track so the camera light goes off immediately.
// ---------------------------------------------------------------------------------------------

function useCamera(active: boolean) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let acquired: MediaStream | undefined;

    setError(false);
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "user" } })
      .then((s) => {
        // The user can scrub off Live before the permission prompt resolves.
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        acquired = s;
        setStream(s);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
      acquired?.getTracks().forEach((t) => t.stop());
      setStream(null);
    };
  }, [active]);

  return { stream, error };
}

// ---------------------------------------------------------------------------------------------
// Frame content per interactivity level.
// ---------------------------------------------------------------------------------------------

function StaticPlaceholder({ fidelity }: { fidelity: Level }) {
  if (fidelity === 0) {
    return (
      <svg viewBox={`0 0 ${FRAME_W} ${FRAME_H}`} className="absolute inset-0 size-full" aria-hidden>
        {HATCH_PATHS.map((d) => (
          <path
            key={d}
            d={d}
            fill="none"
            strokeWidth={2}
            strokeLinecap="round"
            className="stroke-neutral-900/30 dark:stroke-neutral-100/30"
          />
        ))}
      </svg>
    );
  }
  if (fidelity === 1) {
    return <div className="absolute inset-0 bg-neutral-200" />;
  }
  // Polished × Static is the cautionary corner — chrome with nothing inside — so the frame
  // stays deliberately empty.
  return <div className="absolute inset-0 bg-surface-secondary" />;
}

function SkeletonFeed({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-neutral-100 dark:bg-neutral-900">
      {/* The loading-state cliché on purpose: at Default fidelity the placeholder should look
          like the thing every UI library ships, not like art direction. */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <div className="size-12 rounded-full bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-2.5 w-28 rounded-full bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-2.5 w-20 rounded-full bg-neutral-200 dark:bg-neutral-800" />
      </div>
      <motion.div
        aria-hidden
        // The sweep is the one gradient left in here, and it is a highlight, not a fill.
        className="absolute inset-y-0 w-1/2 bg-[linear-gradient(100deg,transparent,rgb(255_255_255/0.75)_50%,transparent)] dark:bg-[linear-gradient(100deg,transparent,rgb(255_255_255/0.09)_50%,transparent)]"
        initial={false}
        animate={reduceMotion ? { x: 0 } : { x: [-140, 280] }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 1.4, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.4 }
        }
      />
    </div>
  );
}

function LiveFeed({ stream, error }: { stream: MediaStream | null; error: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;
    video.srcObject = stream;
    video.play().catch(() => {});
  }, [stream]);

  if (error) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-neutral-950">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-500">
          camera unavailable
        </span>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-neutral-950">
      {/* Mirrored like every selfie preview; the capture mirrors too so the photo matches what
          the user was looking at. */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 size-full -scale-x-100 object-cover"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// The shutter button at each fidelity.
// ---------------------------------------------------------------------------------------------

interface ShutterProps {
  fidelity: Level;
  inert: boolean;
  onShoot: () => void;
  reduceMotion: boolean;
}

function Shutter({ fidelity, inert, onShoot, reduceMotion }: ShutterProps) {
  if (fidelity === 0) {
    return (
      <motion.button
        type="button"
        aria-disabled={inert}
        onClick={inert ? undefined : onShoot}
        whileTap={inert || reduceMotion ? undefined : { scale: 0.95, rotate: -1.5 }}
        className={cn(
          "relative select-none outline-none focus-visible:ring-2 focus-visible:ring-default",
          inert ? "cursor-default" : "cursor-pointer",
        )}
        style={{ width: BTN_W, height: BTN_H }}
      >
        <svg viewBox={`0 0 ${BTN_W} ${BTN_H}`} className="absolute inset-0 size-full" aria-hidden>
          <g
            fill="none"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-neutral-900 dark:stroke-neutral-100"
          >
            <path d={BTN_PATH} />
            <g transform="rotate(-1 75 22)">
              {LETTER_PATHS.map((d) => (
                <path key={d} d={d} />
              ))}
            </g>
          </g>
        </svg>
        <span className="sr-only">Make photo</span>
      </motion.button>
    );
  }

  if (fidelity === 1) {
    return (
      // `all: revert` undoes the Tailwind preflight and hands the button back to the browser —
      // this is the actual UA default widget, not a recreation of one.
      <button type="button" disabled={inert} onClick={onShoot} style={{ all: "revert" }}>
        Make photo
      </button>
    );
  }

  return (
    <motion.button
      type="button"
      aria-disabled={inert}
      onClick={inert ? undefined : onShoot}
      whileTap={inert || reduceMotion ? undefined : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        // Fixed near-black in both themes (content artwork, like the sketch's ink): the specular
        // bevel and black rim only read against a dark fill, so the pill doesn't flip with the
        // theme the way a token would. The fill is a vertical gradient, not flat — the body
        // itself curves away from the light, the specular only crowns it.
        "relative rounded-full border border-black bg-gradient-to-b from-neutral-800 to-neutral-950 px-4 py-2 text-[13px] font-medium text-white",
        // The specular: a pseudo-element catching light along the top edge, fading out by the
        // middle — inset from the rim so the border stays a clean black line.
        // Its rounding follows the pill's cap, not its own box: top corners at the button
        // radius minus the 1px inset so the wash tucks into the curve, bottom much tighter so
        // the fade ends in a soft straight-ish edge instead of a second pill outline.
        "before:pointer-events-none before:absolute before:inset-x-1 before:top-px before:h-1/2 before:rounded-t-[15px] before:rounded-b-[6px] before:bg-gradient-to-b before:from-white/30 before:to-transparent",
        // Inner rim light: a crisp 1px catch under the top edge where the specular wash peaks,
        // and a fainter one along the bottom — reflected light off whatever the pill sits on.
        // Deliberate border+shadow pairing (usually shadow-ring territory): the rim is part of
        // the bevel here, not a hairline substitute.
        "shadow-[inset_0_1px_0_rgb(255_255_255/0.18),inset_0_-1px_0_rgb(255_255_255/0.07),0_2px_5px_rgb(0_0_0/0.25),0_5px_14px_rgb(0_0_0/0.12)]",
        // Sunken label, as if printed into the cap rather than floating on it.
        "[text-shadow:0_1px_1px_rgb(0_0_0/0.5)]",
        "outline-none focus-visible:ring-2 focus-visible:ring-default",
        inert ? "cursor-default opacity-40" : "cursor-pointer",
      )}
    >
      Make photo
    </motion.button>
  );
}

// ---------------------------------------------------------------------------------------------
// The camera component itself, assembled from the pieces the current cell selects.
// ---------------------------------------------------------------------------------------------

function CameraStage({
  fidelity,
  interactivity,
  reduceMotion,
}: {
  fidelity: Level;
  interactivity: Level;
  reduceMotion: boolean;
}) {
  const live = interactivity === 2;
  const { stream, error } = useCamera(live);
  const videoHostRef = useRef<HTMLDivElement>(null);
  const [flashId, setFlashId] = useState(0);
  const [shot, setShot] = useState<{ kind: "camera"; url: string } | { kind: "scribble" } | null>(
    null,
  );

  // Changing rows invalidates the print: its subject (the feed or the scribble) left with it.
  // Fidelity changes keep it, so the print visibly re-dresses while the pad scrubs.
  const [prevInteractivity, setPrevInteractivity] = useState(interactivity);
  if (interactivity !== prevInteractivity) {
    setPrevInteractivity(interactivity);
    setShot(null);
  }

  const shoot = () => {
    setFlashId((n) => n + 1);
    // Wired can only photograph what it has: at Sketch that is the scribbled sitter, so the
    // shutter produces a drawing of a photo. The skeleton is nobody, so it prints nothing.
    if (!live) {
      if (fidelity === 0) setShot({ kind: "scribble" });
      return;
    }
    const video = videoHostRef.current?.querySelector("video");
    if (!video || !video.videoWidth) return;

    const canvas = document.createElement("canvas");
    canvas.width = FRAME_W * 2;
    canvas.height = FRAME_H * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Cover-crop, mirrored to match the preview.
    const scale = Math.max(canvas.width / video.videoWidth, canvas.height / video.videoHeight);
    const dw = video.videoWidth * scale;
    const dh = video.videoHeight * scale;
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh);
    setShot({ kind: "camera", url: canvas.toDataURL("image/jpeg", 0.85) });
  };

  const sketch = fidelity === 0;
  const plain = fidelity === 1;
  const polished = fidelity === 2;

  let content: React.ReactNode;
  if (interactivity === 0) content = <StaticPlaceholder fidelity={fidelity} />;
  else if (interactivity === 1)
    content =
      fidelity === 0 ? (
        <SketchFace className="absolute inset-0 size-full" />
      ) : (
        <SkeletonFeed reduceMotion={reduceMotion} />
      );
  else content = <LiveFeed stream={stream} error={error} />;

  return (
    <div className="flex flex-col items-center gap-3">
      <div style={{ width: FRAME_W * CAMERA_SCALE, height: FRAME_H * CAMERA_SCALE }}>
        <div
          className="relative origin-top-left"
          style={{ width: FRAME_W, height: FRAME_H, transform: `scale(${CAMERA_SCALE})` }}
        >
          {/* Keyed on the cell: each state blurs in over the last — a quick focus-pull, not a
            crossfade queue. No exit pass, so scrubbing the pad never piles up animations. */}
          <motion.div
            key={`${fidelity}-${interactivity}-${error}`}
            initial={reduceMotion ? false : { opacity: 0.3, filter: "blur(8px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <div
              ref={videoHostRef}
              className={cn(
                "absolute inset-0 overflow-hidden",
                plain && "border border-neutral-400 bg-white",
                polished && "rounded-[1.25rem] bg-surface",
              )}
              style={sketch ? { clipPath: `path("${FRAME_PATH}")` } : undefined}
            >
              {content}
              {/* Shutter flash. Keyed so a re-shoot restarts the pulse mid-fade. */}
              {flashId > 0 && interactivity > 0 && (
                <motion.div
                  key={flashId}
                  aria-hidden
                  initial={{ opacity: 0.85 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.4, ease: "easeOut" }}
                  className="pointer-events-none absolute inset-0 bg-white"
                />
              )}
            </div>

            {/* The sketch stroke sits above the clipped stream so the drawn line stays crisp over
              whatever the camera shows. One pass only — a ghost second stroke read as a render
              artifact next to a live video, not as pencil. */}
            {sketch && (
              <svg
                viewBox={`0 0 ${FRAME_W} ${FRAME_H}`}
                className="pointer-events-none absolute inset-0 size-full"
                aria-hidden
              >
                <path
                  d={FRAME_PATH}
                  fill="none"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  className="stroke-neutral-900 dark:stroke-neutral-100"
                />
              </svg>
            )}

            {/* Polished bezel: inner hairline over the content, since an elevation shadow cannot
              draw inside its own box. */}
            {polished && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[1.25rem] ring-1 ring-inset ring-black/10 dark:ring-white/15"
              />
            )}
          </motion.div>

          {/* The latest print — a camera capture at Live, or a drawing of the scribbled sitter
            at Sketch × Wired. Rendered at the current fidelity like everything else, and
            re-dressed live if the pad scrubs fidelity while it is up. */}
          {shot && (
            <motion.div
              // A fresh camera capture re-pops (new url); re-shooting the identical scribble
              // does not.
              key={shot.kind === "camera" ? shot.url : "scribble"}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.6, y: 12, rotate: 4 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                rotate: fidelity === 1 ? 0 : fidelity === 0 ? 5 : -7,
              }}
              transition={
                reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 26 }
              }
              className="absolute -bottom-6 -right-8"
            >
              <Print fidelity={fidelity} shot={shot} />
            </motion.div>
          )}
        </div>
      </div>

      {/* Fixed slot: the three buttons are all different sizes (the UA default is a fraction
          of the sketch), and letting the column reflow would shift the pad the user is holding
          mid-drag. The slot is the largest of the three, everything centers inside it. */}
      <div className="grid place-items-center" style={{ width: BTN_W, height: BTN_H }}>
        <Shutter
          fidelity={fidelity}
          inert={interactivity === 0}
          onShoot={shoot}
          reduceMotion={reduceMotion}
        />
      </div>
    </div>
  );
}

// The captured print at each fidelity. Sketch clips the photo with a small wobbly frame;
// Default is the bare artless <img>; Polished is the polaroid.
function Print({
  fidelity,
  shot,
}: {
  fidelity: Level;
  shot: { kind: "camera"; url: string } | { kind: "scribble" };
}) {
  const subject =
    shot.kind === "camera" ? (
      <img
        src={shot.url}
        alt="Captured photo"
        className="absolute inset-0 size-full object-cover"
      />
    ) : (
      <SketchFace className="absolute inset-0 size-full bg-white dark:bg-neutral-950" />
    );

  if (fidelity === 0) {
    return (
      <div className="relative" style={{ width: THUMB_W, height: THUMB_H }}>
        <div className="absolute inset-0" style={{ clipPath: `path("${THUMB_PATH}")` }}>
          {subject}
        </div>
        <svg
          viewBox={`0 0 ${THUMB_W} ${THUMB_H}`}
          className="pointer-events-none absolute inset-0 size-full"
          aria-hidden
        >
          <path
            d={THUMB_PATH}
            fill="none"
            strokeWidth={2}
            strokeLinecap="round"
            className="stroke-neutral-900 dark:stroke-neutral-100"
          />
        </svg>
      </div>
    );
  }
  if (fidelity === 1) {
    return (
      <div className="relative aspect-[4/3] w-20 border border-neutral-400 bg-white">{subject}</div>
    );
  }
  return (
    <div className="w-20 bg-white p-1 pb-3 shadow-ring-md">
      <div className="relative aspect-[4/3] w-full overflow-hidden">{subject}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// The 2D pad. Fidelity runs left → right, interactivity bottom → top. Dragging follows the
// pointer through a tight spring (a whisper of lag reads as weight); release snaps to the
// nearest of the nine cells with a softer one. The component updates from the nearest cell
// LIVE during the drag — scrubbing morphs the camera in real time.
// ---------------------------------------------------------------------------------------------

const PAD_W = 156;
const PAD_H = 124;
const PAD_INSET = 26;
const CELL_DX = (PAD_W - PAD_INSET * 2) / 2;
const CELL_DY = (PAD_H - PAD_INSET * 2) / 2;

const cellX = (f: Level) => PAD_INSET + f * CELL_DX;
const cellY = (i: Level) => PAD_INSET + (2 - i) * CELL_DY;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const toLevel = (v: number) => clamp(Math.round(v), 0, 2) as Level;

const FOLLOW = { type: "spring", stiffness: 900, damping: 50, mass: 0.4 } as const;
const SNAP = { type: "spring", stiffness: 400, damping: 28, mass: 0.8 } as const;

// The faint texture grid, computed once at module level.
const MINOR_DOTS: { x: number; y: number }[] = [];
for (let x = 13; x <= PAD_W - 13; x += 18) {
  for (let y = 12; y <= PAD_H - 12; y += 20) {
    MINOR_DOTS.push({ x, y });
  }
}

export function FidelityMatrix() {
  const reduceMotion = useReducedMotion() ?? false;
  const [cell, setCell] = useState<{ f: Level; i: Level }>({ f: 0, i: 0 });
  const [pos, setPos] = useState({ x: cellX(0), y: cellY(0) });
  const [dragging, setDragging] = useState(false);
  const padRef = useRef<HTMLDivElement>(null);

  const moveTo = (f: Level, i: Level) => {
    setCell({ f, i });
    setPos({ x: cellX(f), y: cellY(i) });
  };

  const readPointer = (e: React.PointerEvent) => {
    const rect = padRef.current!.getBoundingClientRect();
    return {
      x: clamp(e.clientX - rect.left, PAD_INSET, PAD_W - PAD_INSET),
      y: clamp(e.clientY - rect.top, PAD_INSET, PAD_H - PAD_INSET),
    };
  };

  const updateFromPointer = (e: React.PointerEvent) => {
    const p = readPointer(e);
    setPos(p);
    const f = toLevel((p.x - PAD_INSET) / CELL_DX);
    const i = toLevel(2 - (p.y - PAD_INSET) / CELL_DY);
    setCell((prev) => (prev.f === f && prev.i === i ? prev : { f, i }));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    updateFromPointer(e);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (dragging) updateFromPointer(e);
  };

  const settle = () => {
    setDragging(false);
    setPos({ x: cellX(cell.f), y: cellY(cell.i) });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, 1],
      ArrowDown: [0, -1],
    };
    const delta = step[e.key];
    if (!delta) return;
    e.preventDefault();
    moveTo(toLevel(cell.f + delta[0]), toLevel(cell.i + delta[1]));
  };

  const handleTransition = reduceMotion ? { duration: 0 } : dragging ? FOLLOW : SNAP;
  const label = `${FIDELITY[cell.f]} · ${INTERACTIVITY[cell.i]}`;

  return (
    <figure className="not-prose mx-auto my-8 max-w-[520px] font-pretendard">
      <div className="flex justify-center rounded-sm p-4 outline -outline-offset-1 outline-black/5 md:p-12 dark:outline-white/8">
        <div className="flex w-full max-w-[21.5rem] flex-col items-center gap-6">
          <CameraStage fidelity={cell.f} interactivity={cell.i} reduceMotion={reduceMotion} />

          {/* The pad centers on the same axis as the camera; the vertical label hangs off its
              left edge absolutely so it cannot push the pad sideways. Each label still centers
              on its own axis: the vertical one on the pad's height, Fidelity on its width. */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="relative">
              <span
                aria-hidden
                className="absolute -left-7 top-1/2 -translate-y-1/2 rotate-180 text-[11px] text-quaternary [writing-mode:vertical-rl]"
              >
                Interactivity
              </span>
              <div
                ref={padRef}
                role="slider"
                tabIndex={0}
                aria-label="Fidelity and interactivity"
                aria-valuetext={label}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={settle}
                onPointerCancel={settle}
                onKeyDown={onKeyDown}
                className={cn(
                  "relative touch-none select-none rounded-2xl bg-surface",
                  "shadow-ring-sm hairline-black/8 dark:hairline-white/10",
                  "outline-none focus-visible:ring-2 focus-visible:ring-default",
                  dragging ? "cursor-grabbing" : "cursor-pointer",
                )}
                style={{ width: PAD_W, height: PAD_H }}
              >
                <svg
                  viewBox={`0 0 ${PAD_W} ${PAD_H}`}
                  className="pointer-events-none absolute inset-0 size-full"
                  aria-hidden
                >
                  {MINOR_DOTS.map((d) => (
                    <circle
                      key={`${d.x}-${d.y}`}
                      cx={d.x}
                      cy={d.y}
                      r={0.9}
                      className="fill-black/10 dark:fill-white/10"
                    />
                  ))}
                  {([0, 1, 2] as const).flatMap((f) =>
                    ([0, 1, 2] as const).map((i) => (
                      <circle
                        key={`snap-${f}-${i}`}
                        cx={cellX(f)}
                        cy={cellY(i)}
                        r={2.25}
                        className="fill-black/25 dark:fill-white/25"
                      />
                    )),
                  )}
                </svg>

                {/* A soft plate under the nearest cell — where the handle will land if
                    released. Drag-only: resting, it stacked with the handle's own shadow into
                    a smudge under the dot. */}
                {dragging && (
                  <motion.div
                    aria-hidden
                    initial={false}
                    animate={{ x: cellX(cell.f) - 13, y: cellY(cell.i) - 13 }}
                    transition={reduceMotion ? { duration: 0 } : SNAP}
                    className="pointer-events-none absolute left-0 top-0 size-[26px] rounded-lg bg-black/5 dark:bg-white/8"
                  />
                )}

                {/* The handle. Wrapper is 0×0 positioned at the value, so children can center
                    on it without knowing its size. */}
                <motion.div
                  initial={false}
                  animate={{ x: pos.x, y: pos.y }}
                  transition={handleTransition}
                  className="pointer-events-none absolute left-0 top-0"
                >
                  <motion.div
                    animate={{ scale: dragging && !reduceMotion ? 1.25 : 1 }}
                    transition={reduceMotion ? { duration: 0 } : SNAP}
                    // White knob on a white pad: the shadow alone doesn't separate them, so the
                    // hairline runs a step darker than the pad's own.
                    // Not shadow-ring-*: those stacks are tuned for cards — 18-47px blurs at 1-3%
                    // opacity vanish under a 16px control. Same recipe at control scale: tight
                    // layers, hairline baked in last, so it stays one shadow, not border+shadow.
                    className="size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.12),0_2px_5px_rgb(0_0_0/0.08),0_0_0_1px_var(--shadow-hairline)] hairline-black/15 dark:bg-surface-tertiary dark:hairline-white/20"
                  />
                </motion.div>
              </div>
            </div>
            <span aria-hidden className="text-[11px] text-quaternary">
              Fidelity
            </span>
          </div>
        </div>
      </div>
    </figure>
  );
}
