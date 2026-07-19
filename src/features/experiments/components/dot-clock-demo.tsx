import { useEffect, useRef, useState } from "react";

/* A field of physical dots that pack themselves into the current time. Every dot is a real
   little body: it springs toward a slot in a coarse dot-matrix rendering of HH:MM:SS, but it can
   never sit inside another — a hard collision radius pushes overlapping pairs apart, so the
   number is always built from separated, breathing dots rather than a printed glyph. Idle dots
   drift grey through the field (the loose stipple of the book that inspired this); to keep it
   alive, a slow churn constantly hands digit slots off to fresh dots — a grey one rolls in and
   darkens while the one it replaced fades back to grey. The cursor magnetises nearby dots.
   Because the packing settles under collision from wherever the dots happen to be, the
   arrangement is never the same twice. Transparent background, pure canvas. */

// 5×7 dot-matrix font. One string per row, "1" = a lit cell.
const FONT: Record<string, string[]> = {
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
};

type RGB = [number, number, number];

// Accepts both a computed `rgb(r g b)` / `rgb(r, g, b)` string and a raw #rrggbb hex.
function parseColor(value: string): RGB | null {
  const s = value.trim();
  const rgb = /rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(s);
  if (rgb) return [Math.round(+rgb[1]), Math.round(+rgb[2]), Math.round(+rgb[3])];
  const hex = /^#?([0-9a-f]{6})$/i.exec(s);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  return null;
}

const ROWS = 7;
const DIGIT_W = 5;
const GAP = 1; // blank columns between glyphs
const COLON_W = 1;

// Column where each glyph starts: H H : M M : S S.
const UNIT = DIGIT_W + GAP; // 6
const COL = {
  h0: 0,
  h1: UNIT, // 6
  colon1: 2 * UNIT, // 12
  m0: 2 * UNIT + COLON_W + GAP, // 14
  m1: 3 * UNIT + COLON_W + GAP, // 20
  colon2: 4 * UNIT + COLON_W + GAP, // 26
  s0: 4 * UNIT + 2 * (COLON_W + GAP), // 28
  s1: 5 * UNIT + 2 * (COLON_W + GAP), // 34
};
const GRID_COLS = COL.s1 + DIGIT_W; // 39

interface Cell {
  c: number;
  r: number;
}

// The lit cells for a time string, in grid coordinates. Both colons are two dots, always on.
function cellsFor(time: string): Cell[] {
  const [hh, mm, ss] = time.split(":");
  const digits: [string, number][] = [
    [hh[0], COL.h0],
    [hh[1], COL.h1],
    [mm[0], COL.m0],
    [mm[1], COL.m1],
    [ss[0], COL.s0],
    [ss[1], COL.s1],
  ];
  const cells: Cell[] = [];
  for (const [d, col] of digits) {
    const rows = FONT[d];
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < DIGIT_W; c++) if (rows[r][c] === "1") cells.push({ c: col + c, r });
  }
  cells.push(
    { c: COL.colon1, r: 2 },
    { c: COL.colon1, r: 4 },
    { c: COL.colon2, r: 2 },
    { c: COL.colon2, r: 4 },
  );
  return cells;
}

// Pool sized to the densest possible time ("88:88:88" is 106 lit cells) plus a big scatter
// surplus, so there are always plenty of spare dots loose in the field. Constant across the
// demo's life — dots are only ever re-homed, never created or destroyed.
const MAX_LIT = cellsFor("88:88:88").length; // 106
const SURPLUS = 230;
const COUNT = MAX_LIT + SURPLUS;

interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hx: number; // home (target slot) when lit
  hy: number;
  lit: boolean;
  ax: number; // idle wander anchor
  ay: number;
  phase: number; // per-dot breathing offset
  lum: number; // eased 0→1 lit amount (grey→black crossfade)
}

function localTime(): string {
  const now = new Date();
  return [now.getHours(), now.getMinutes(), now.getSeconds()]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}

export const DotClock = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [label, setLabel] = useState(() => localTime());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0;
    let H = 0;
    let pitch = 0; // px between neighbouring cells
    let radius = 0; // dot radius
    let originX = 0;
    let originY = 0;

    // Dot colours, read from the theme: idle grey and active "black" (which is white in dark
    // mode), so both read correctly on light and dark. We resolve each token through a probe
    // element's computed `color` rather than reading the raw custom property: iOS Safari often
    // returns an empty string for getPropertyValue("--x"), but computed `color` is always a
    // concrete rgb() on every engine.
    let grey: RGB = [163, 163, 163];
    let ink: RGB = [23, 23, 23];
    const probe = document.createElement("span");
    probe.style.cssText = "position:absolute;width:0;height:0;visibility:hidden";
    canvas.parentElement?.appendChild(probe);
    const resolveVar = (name: string): RGB | null => {
      probe.style.color = `var(${name})`;
      return parseColor(getComputedStyle(probe).color);
    };
    const readColors = () => {
      const q = resolveVar("--text-quaternary");
      const p = resolveVar("--text-primary");
      if (q) grey = q;
      if (p) ink = p;
    };

    // Cursor position in canvas space (null when the pointer is away) — dots near it are pulled in.
    const mouse: { x: number | null; y: number | null } = { x: null, y: null };

    // A drifting pseudo-random source that never touches Math.random (keeps SSR/replays clean
    // and avoids the lint against it) — a hashed, self-advancing value per call.
    let seed = 0x2545f491;
    const rand = () => {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      return ((seed >>> 0) % 100000) / 100000;
    };

    const dots: Dot[] = Array.from({ length: COUNT }, () => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      hx: 0,
      hy: 0,
      lit: false,
      ax: 0,
      ay: 0,
      phase: 0,
      lum: 0,
    }));

    const scatterAnchor = (d: Dot) => {
      const m = pitch * 1.2;
      d.ax = m + rand() * (W - 2 * m);
      d.ay = m + rand() * (H - 2 * m);
    };

    let currentTime = "";

    const layout = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width;
      H = rect.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      pitch = Math.min((W * 0.7) / GRID_COLS, (H * 0.32) / ROWS);
      radius = pitch * 0.34;
      originX = (W - (GRID_COLS - 1) * pitch) / 2;
      originY = (H - (ROWS - 1) * pitch) / 2;
      readColors();
    };

    // Greedy nearest assignment: each lit slot claims the closest free dot to its current
    // position, so the number reshapes with minimal travel. Leftover dots become scatter.
    const assign = (time: string) => {
      const cells = cellsFor(time);
      const targets = cells.map((c) => ({
        x: originX + c.c * pitch,
        y: originY + c.r * pitch,
      }));
      const free = dots.slice();
      for (const t of targets) {
        let best = -1;
        let bestD = Infinity;
        for (let i = 0; i < free.length; i++) {
          const dx = free[i].x - t.x;
          const dy = free[i].y - t.y;
          const dist = dx * dx + dy * dy;
          if (dist < bestD) {
            bestD = dist;
            best = i;
          }
        }
        const dot = free.splice(best, 1)[0];
        dot.lit = true;
        dot.hx = t.x;
        dot.hy = t.y;
      }
      for (const d of free) {
        if (d.lit) scatterAnchor(d); // just released — wander off from where it was
        d.lit = false;
      }
    };

    const seedField = () => {
      for (const d of dots) {
        d.x = rand() * W;
        d.y = rand() * H;
        d.vx = 0;
        d.vy = 0;
        d.phase = rand() * Math.PI * 2;
        scatterAnchor(d);
      }
    };

    // Physics constants. SPRING is soft and FRICTION sits just past critical (2·√SPRING ≈ 9.4),
    // so dots glide into place with no overshoot — a slow, smooth settle rather than a snap.
    const SPRING = 22;
    const FRICTION = 10;
    const IDLE_SPRING = 2;
    const IDLE_JITTER = 9;
    const BREATH = 0.06;
    const MAG_STRENGTH = 1100;

    const step = (dt: number, t: number) => {
      // Recomputed from the live radius so it tracks resizes.
      const md = radius * 2 * 1.02;
      const magR = pitch * 9;
      const mx = mouse.x;
      const my = mouse.y;
      for (const d of dots) {
        // Ease the lit amount so a dot warms up / cools down instead of snapping colour.
        d.lum += ((d.lit ? 1 : 0) - d.lum) * Math.min(1, dt * 3.5);
        if (d.lit) {
          // Breathe around the home slot so a settled number still feels alive.
          const bx = Math.sin(t * 0.7 + d.phase) * pitch * BREATH;
          const by = Math.cos(t * 0.6 + d.phase) * pitch * BREATH;
          const tx = d.hx + bx;
          const ty = d.hy + by;
          d.vx += ((tx - d.x) * SPRING - d.vx * FRICTION) * dt;
          d.vy += ((ty - d.y) * SPRING - d.vy * FRICTION) * dt;
        } else {
          if (rand() < 0.004) scatterAnchor(d);
          d.vx += ((d.ax - d.x) * IDLE_SPRING - d.vx * 2.4) * dt;
          d.vy += ((d.ay - d.y) * IDLE_SPRING - d.vy * 2.4) * dt;
          d.vx += (rand() - 0.5) * IDLE_JITTER * dt;
          d.vy += (rand() - 0.5) * IDLE_JITTER * dt;
        }
        // Cursor magnet: dots inside the radius are drawn toward it, hardest up close. The soft
        // spring lets lit dots be tugged off their slots and glide back once the cursor leaves.
        if (mx !== null && my !== null) {
          const gx = mx - d.x;
          const gy = my - d.y;
          const gd = Math.hypot(gx, gy);
          if (gd < magR && gd > 0.01) {
            const f = (1 - gd / magR) * MAG_STRENGTH;
            d.vx += (gx / gd) * f * dt;
            d.vy += (gy / gd) * f * dt;
          }
        }
        d.x += d.vx * dt;
        d.y += d.vy * dt;
      }

      // Hard collision: separate every overlapping pair. Two relaxation passes keep dense
      // packings (a settled "8") from jittering while still holding the no-overlap invariant.
      for (let pass = 0; pass < 2; pass++) {
        for (let i = 0; i < dots.length; i++) {
          const a = dots[i];
          for (let j = i + 1; j < dots.length; j++) {
            const b = dots[j];
            let dx = b.x - a.x;
            let dy = b.y - a.y;
            let dist = Math.hypot(dx, dy);
            if (dist === 0) {
              dx = (rand() - 0.5) * 0.01;
              dy = (rand() - 0.5) * 0.01;
              dist = Math.hypot(dx, dy) || 0.01;
            }
            if (dist < md) {
              const push = (md - dist) / 2;
              const nx = dx / dist;
              const ny = dy / dist;
              a.x -= nx * push;
              a.y -= ny * push;
              b.x += nx * push;
              b.y += ny * push;
            }
          }
        }
      }

      // Keep dots inside the frame.
      const m = radius;
      for (const d of dots) {
        if (d.x < m) {
          d.x = m;
          d.vx *= -0.4;
        } else if (d.x > W - m) {
          d.x = W - m;
          d.vx *= -0.4;
        }
        if (d.y < m) {
          d.y = m;
          d.vy *= -0.4;
        } else if (d.y > H - m) {
          d.y = H - m;
          d.vy *= -0.4;
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const d of dots) {
        // Crossfade grey → ink by the eased lit amount; alpha lifts with it so active dots read
        // solid and the idle field stays a quiet stipple. Every dot is one size.
        const l = d.lum;
        const r = Math.round(grey[0] + (ink[0] - grey[0]) * l);
        const g = Math.round(grey[1] + (ink[1] - grey[1]) * l);
        const b = Math.round(grey[2] + (ink[2] - grey[2]) * l);
        ctx.globalAlpha = 0.22 + 0.78 * l;
        ctx.beginPath();
        ctx.arc(d.x, d.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${r} ${g} ${b})`;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    // Constant churn: hand a random lit slot to the nearest idle dot, releasing the one that held
    // it. The number stays intact but a fresh dot rolls in (warming up) while the old drifts off.
    const swapOne = () => {
      let L: Dot | null = null;
      let seen = 0;
      for (const d of dots) {
        if (!d.lit) continue;
        seen++;
        if (rand() < 1 / seen) L = d; // reservoir-pick a random lit dot in one pass
      }
      if (!L) return;
      let best: Dot | null = null;
      let bestD = Infinity;
      for (const d of dots) {
        if (d.lit) continue;
        const dd = (d.x - L.hx) ** 2 + (d.y - L.hy) ** 2;
        if (dd < bestD) {
          bestD = dd;
          best = d;
        }
      }
      if (!best) return;
      best.lit = true;
      best.hx = L.hx;
      best.hy = L.hy;
      L.lit = false;
      scatterAnchor(L);
    };

    layout();
    seedField();
    currentTime = localTime();
    assign(currentTime);
    setLabel(currentTime);

    let raf = 0;
    let last = 0;
    const loop = (now: number) => {
      if (!last) last = now;
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      const next = localTime();
      if (next !== currentTime) {
        currentTime = next;
        assign(currentTime);
        setLabel(currentTime);
      }
      if (rand() < 0.1) swapOne(); // ~6 handoffs/sec keeps the field visibly churning
      step(dt, now / 1000);
      draw();
      raf = requestAnimationFrame(loop);
    };

    if (reduced) {
      // No simulation: place lit dots on their slots, hide the rest, redraw each second.
      const place = () => {
        const next = localTime();
        currentTime = next;
        setLabel(next);
        assign(next);
        for (const d of dots) {
          d.lum = d.lit ? 1 : 0;
          if (d.lit) {
            d.x = d.hx;
            d.y = d.hy;
          } else {
            d.x = -100;
            d.y = -100;
          }
        }
        draw();
      };
      place();
      const id = window.setInterval(place, 1000);
      const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const onTheme = () => {
        readColors();
        place();
      };
      darkQuery.addEventListener("change", onTheme);
      const ro = new ResizeObserver(() => {
        layout();
        assign(currentTime);
        place();
      });
      ro.observe(canvas);
      return () => {
        window.clearInterval(id);
        darkQuery.removeEventListener("change", onTheme);
        ro.disconnect();
        probe.remove();
      };
    }

    raf = requestAnimationFrame(loop);

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);

    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const onTheme = () => readColors();
    darkQuery.addEventListener("change", onTheme);

    const ro = new ResizeObserver(() => {
      layout();
      assign(currentTime);
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      darkQuery.removeEventListener("change", onTheme);
      ro.disconnect();
      probe.remove();
    };
  }, []);

  return (
    <div
      className="absolute inset-0"
      role="img"
      aria-label={`A field of dots forming the current time, ${label}`}
    >
      <canvas ref={canvasRef} className="size-full" />
    </div>
  );
};
