// Procedural pixel-art flower engine for the digital-garden experiment. Each asset is drawn with
// shaded, overlapping petals (radial/linear gradients, highlights, dark outlines) onto a small
// backing canvas, then displayed upscaled with nearest-neighbour so it crisps into chunky pixel
// art — the look of the hand-dithered flower GIFs on old GeoCities pages, instead of flat blobs.

type Ctx = CanvasRenderingContext2D;

// Accepts "#rrggbb" or "rgb()/rgba()", so an already-shaded colour can be shaded again without
// being mis-read as hex (that produced NaN channels → css()'s `|0` floored them to a pure green).
function parse(color: string): [number, number, number] {
  if (color[0] === "#") {
    const h = color.slice(1);
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  const m = color.match(/[\d.]+/g);
  return m ? [Number(m[0]), Number(m[1]), Number(m[2])] : [0, 0, 0];
}
function css([r, g, b]: number[], a = 1): string {
  return `rgba(${r | 0},${g | 0},${b | 0},${a})`;
}
function mix(a: string, b: string, t: number): number[] {
  const A = parse(a);
  const B = parse(b);
  return [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t];
}
const lighten = (hex: string, t: number) => css(mix(hex, "#ffffff", t));
// multiplicative darken preserves hue/saturation (mixing toward a fixed black muddies warm hues,
// e.g. yellow → olive), so a darkened yellow stays golden.
function darken(hex: string, t: number): string {
  const [r, g, b] = parse(hex);
  const k = 1 - t;
  return css([r * k, g * k, b * k]);
}

// seeded RNG so speckle/stipple is identical every render (stable posters)
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A radially-symmetric petal pointing "up" (−y) from the flower centre, drawn in the current
// transform. Almond shape via two quadratic curves; `pointed` sharpens the tip.
function petalPath(ctx: Ctx, rInner: number, rOuter: number, w: number, pointed: boolean) {
  const midR = (rInner + rOuter) / 2;
  const ctrl = pointed ? 0.42 : 0.62;
  ctx.beginPath();
  ctx.moveTo(0, -rInner);
  ctx.quadraticCurveTo(w * 0.5, -midR, w * ctrl * 0.4, -rOuter + (pointed ? 0 : w * 0.18));
  ctx.quadraticCurveTo(0, -rOuter, 0, -rOuter);
  ctx.quadraticCurveTo(0, -rOuter, -w * ctrl * 0.4, -rOuter + (pointed ? 0 : w * 0.18));
  ctx.quadraticCurveTo(-w * 0.5, -midR, 0, -rInner);
  ctx.closePath();
}

function petalRing(
  ctx: Ctx,
  cx: number,
  cy: number,
  opts: {
    count: number;
    rot: number;
    rInner: number;
    rOuter: number;
    w: number;
    color: string;
    pointed?: boolean;
    tip?: number; // how much lighter the tip is
    line?: number; // outline darkness
    lineW?: number;
    sheen?: boolean; // per-petal specular vein
    phase?: number; // animation phase 0..1 — wobbles petals + travels a glint around the ring
  },
) {
  const {
    count,
    rot,
    rInner,
    rOuter,
    w,
    color,
    pointed = false,
    tip = 0.3,
    line = 0.34,
    lineW = 1,
    sheen = true,
    phase = 0,
  } = opts;
  const TAU = Math.PI * 2;
  const wobble = Math.sin(phase * TAU) * 0.03; // whole-ring shiver
  for (let i = 0; i < count; i++) {
    const frac = i / count;
    const ang = rot + wobble + frac * TAU;
    // a bright spot that sweeps around the flower, frame by frame
    const glint = Math.max(0, Math.sin(phase * TAU - frac * TAU)) * 0.16;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(ang);
    petalPath(ctx, rInner, rOuter, w, pointed);
    const grad = ctx.createLinearGradient(0, -rInner, 0, -rOuter);
    grad.addColorStop(0, darken(color, 0.28));
    grad.addColorStop(0.5, color);
    grad.addColorStop(1, lighten(color, tip + glint));
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineJoin = "round";
    ctx.strokeStyle = darken(color, line);
    ctx.lineWidth = lineW;
    ctx.stroke();
    if (sheen) {
      // a crisp specular streak up one side of each petal (reads as a vein on daisies/gerberas)
      ctx.beginPath();
      ctx.moveTo(-w * 0.12, -rInner - (rOuter - rInner) * 0.3);
      ctx.lineTo(-w * 0.05, -rOuter + w * 0.2);
      ctx.strokeStyle = lighten(color, 0.55);
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }
}

// textured seed disc (sunflower / gerbera centre); breathes a hair with the animation phase
function seedDisc(
  ctx: Ctx,
  cx: number,
  cy: number,
  r0: number,
  color: string,
  seed: number,
  phase = 0,
) {
  const r = r0 * (1 + Math.sin(phase * Math.PI * 2) * 0.04);
  const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
  g.addColorStop(0, lighten(color, 0.35));
  g.addColorStop(0.6, color);
  g.addColorStop(1, darken(color, 0.4));
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = darken(color, 0.45);
  ctx.lineWidth = 1;
  ctx.stroke();
  const rand = rng(seed);
  for (let i = 0; i < r * r * 0.7; i++) {
    const a = rand() * Math.PI * 2;
    const rr = Math.sqrt(rand()) * (r - 1);
    ctx.fillStyle = rand() > 0.5 ? darken(color, 0.5) : lighten(color, 0.3);
    ctx.fillRect(Math.round(cx + Math.cos(a) * rr), Math.round(cy + Math.sin(a) * rr), 1, 1);
  }
}

// drawn in grid coordinates; the component adds the black outline
const STEM_G = "#3f9e34";
const STEM_LITE = "#69c94b";
const GREENS = ["#3f9e34", "#4fb340", "#2f7d2e", "#5bbf46"];

function leafBlade(ctx: Ctx, x: number, y: number, len: number, dir: number) {
  const tx = x + dir * len * 0.8;
  const ty = y - len * 0.62;
  const mx = (x + tx) / 2;
  const my = (y + ty) / 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(mx - dir * len * 0.18, my - len * 0.14, tx, ty);
  ctx.quadraticCurveTo(mx + dir * len * 0.16, my + len * 0.1, x, y);
  ctx.closePath();
  const g = ctx.createLinearGradient(x, y, tx, ty);
  g.addColorStop(0, "#2f7d2e");
  g.addColorStop(1, STEM_LITE);
  ctx.fillStyle = g;
  ctx.fill();
}

// A curved stalk from base → top with 1–2 leaves. `wid` is the grid-space stem thickness.
export function drawStem(
  ctx: Ctx,
  baseX: number,
  baseY: number,
  topX: number,
  topY: number,
  wid: number,
  seed: number,
) {
  const rand = rng(seed);
  const len = baseY - topY;
  const ctrlX = (baseX + topX) / 2 + (rand() - 0.5) * len * 0.3;
  const ctrlY = (baseY + topY) / 2;
  const curve = () => {
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.quadraticCurveTo(ctrlX, ctrlY, topX, topY);
  };
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  curve();
  ctx.strokeStyle = STEM_G;
  ctx.lineWidth = wid;
  ctx.stroke();
  curve();
  ctx.strokeStyle = STEM_LITE;
  ctx.lineWidth = Math.max(1, wid - 1.6);
  ctx.stroke();
  const nLeaves = len > 14 ? 1 + (rand() < 0.6 ? 1 : 0) : rand() < 0.5 ? 1 : 0;
  for (let i = 0; i < nLeaves; i++) {
    const t = 0.34 + i * 0.3 + rand() * 0.08;
    const mt = 1 - t;
    const px = mt * mt * baseX + 2 * mt * t * ctrlX + t * t * topX;
    const py = mt * mt * baseY + 2 * mt * t * ctrlY + t * t * topY;
    leafBlade(ctx, px, py, wid * 2 + 3 + rand() * len * 0.12, i % 2 === 0 ? 1 : -1);
  }
}

// A clump of grass blades filling the grid box — pointed, varied greens (outline added later).
export function drawGrassTuft(ctx: Ctx, gw: number, gh: number, seed: number) {
  const rand = rng(seed);
  const n = 5 + ((rand() * 5) | 0);
  for (let i = 0; i < n; i++) {
    const bx = 2 + rand() * (gw - 4);
    const bh = gh * (0.5 + rand() * 0.5);
    const topY = gh - bh;
    const topX = bx + (rand() - 0.5) * gh * 0.5;
    const wid = 1.6 + rand() * 1.6;
    ctx.beginPath();
    ctx.moveTo(bx - wid / 2, gh);
    ctx.quadraticCurveTo(bx - wid * 0.2, (gh + topY) / 2, topX, topY);
    ctx.quadraticCurveTo(bx + wid * 0.2, (gh + topY) / 2, bx + wid / 2, gh);
    ctx.closePath();
    ctx.fillStyle = GREENS[(rand() * GREENS.length) | 0];
    ctx.fill();
  }
}

function drawGerbera(
  ctx: Ctx,
  s: number,
  color: string,
  center: string,
  seed: number,
  thin = false,
  phase = 0,
) {
  const c = s / 2;
  const R = s * 0.46;
  petalRing(ctx, c, c, {
    count: thin ? 26 : 16,
    rot: 0.2,
    rInner: R * 0.36,
    rOuter: R,
    w: thin ? s * 0.09 : s * 0.15,
    color,
    pointed: thin,
    tip: 0.32,
    phase,
  });
  petalRing(ctx, c, c, {
    count: thin ? 22 : 13,
    rot: 0.5,
    rInner: R * 0.28,
    rOuter: R * 0.72,
    w: thin ? s * 0.08 : s * 0.13,
    color: darken(color, 0.12),
    pointed: thin,
    tip: 0.24,
    phase: phase + 0.5,
  });
  seedDisc(ctx, c, c, R * 0.32, center, seed, phase);
}

function drawDaisy(ctx: Ctx, s: number, petal: string, center: string, seed: number, phase = 0) {
  const c = s / 2;
  const R = s * 0.47;
  petalRing(ctx, c, c, {
    count: 13,
    rot: 0,
    rInner: R * 0.3,
    rOuter: R,
    w: s * 0.17,
    color: petal,
    tip: 0.0,
    line: 0.12,
    phase,
  });
  seedDisc(ctx, c, c, R * 0.34, center, seed, phase);
}

function drawSunflower(ctx: Ctx, s: number, seed: number, phase = 0) {
  const c = s / 2;
  const R = s * 0.47;
  petalRing(ctx, c, c, {
    count: 20,
    rot: 0.15,
    rInner: R * 0.42,
    rOuter: R,
    w: s * 0.12,
    color: "#ffc21e",
    pointed: true,
    tip: 0.4,
    line: 0.3,
    phase,
  });
  petalRing(ctx, c, c, {
    count: 20,
    rot: 0.32,
    rInner: R * 0.4,
    rOuter: R * 0.86,
    w: s * 0.1,
    color: "#f5a415",
    pointed: true,
    tip: 0.3,
    phase: phase + 0.5,
  });
  seedDisc(ctx, c, c, R * 0.44, "#6b3d16", seed, phase);
}

function drawRose(ctx: Ctx, s: number, color: string, phase = 0) {
  const c = s / 2;
  const R = s * 0.47;
  // opaque base mound sized to the outer petals, so gaps between petals never reveal the page
  // behind the bloom (a rose is a solid flower, unlike a daisy where you should see through).
  ctx.beginPath();
  ctx.arc(c, c, R, 0, Math.PI * 2);
  ctx.fillStyle = darken(color, 0.14);
  ctx.fill();
  // Broad, overlapping, rounded petals in offset rings kept inside the mound — outer edges catch
  // light, bases sit in shadow, so it furls like a cabbage rose rather than a spiky rosette.
  const ring = (
    count: number,
    rot: number,
    rIn: number,
    rOut: number,
    w: number,
    col: string,
    tip: number,
  ) =>
    petalRing(ctx, c, c, {
      count,
      rot,
      rInner: rIn,
      rOuter: rOut,
      w,
      color: col,
      tip,
      line: 0.2,
      lineW: 1,
      sheen: false,
      phase,
    });
  ring(7, 0.0, R * 0.4, R * 0.98, s * 0.4, darken(color, 0.06), 0.22);
  ring(6, 0.45, R * 0.28, R * 0.76, s * 0.4, color, 0.2);
  ring(5, 1.05, R * 0.16, R * 0.54, s * 0.34, lighten(color, 0.08), 0.18);
  ring(5, 1.7, R * 0.06, R * 0.34, s * 0.26, lighten(color, 0.16), 0.16);
  // furled centre: a tight spiral of comma strokes + a light bud
  ctx.save();
  ctx.translate(c, c);
  for (let i = 0; i < 5; i++) {
    ctx.rotate(1.5);
    ctx.beginPath();
    ctx.arc(0, 0, R * (0.2 - i * 0.032), -0.5, 2.4);
    ctx.strokeStyle = darken(color, 0.22 + i * 0.04);
    ctx.lineWidth = 1.6;
    ctx.lineCap = "round";
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(0, 0, R * 0.06, 0, Math.PI * 2);
  ctx.fillStyle = lighten(color, 0.3);
  ctx.fill();
  ctx.restore();
  // soft top sheen (a gentle light wash, not a glassy bubble)
  ctx.save();
  ctx.beginPath();
  ctx.arc(c, c, R, 0, Math.PI * 2);
  ctx.clip();
  const sheen = ctx.createLinearGradient(0, c - R, 0, c + R * 0.3);
  sheen.addColorStop(0, "rgba(255,255,255,0.28)");
  sheen.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, s, s);
  ctx.restore();
}

function drawTulip(ctx: Ctx, s: number, color: string) {
  const c = s / 2;
  const w = s * 0.5;
  const top = s * 0.12;
  const bot = s * 0.82;
  const petal = (cx: number, spread: number, col: string) => {
    ctx.beginPath();
    ctx.moveTo(cx, bot);
    ctx.quadraticCurveTo(cx - spread, s * 0.4, cx - spread * 0.7, top + s * 0.08);
    ctx.quadraticCurveTo(cx - spread * 0.3, top, cx, top + s * 0.06);
    ctx.quadraticCurveTo(cx + spread * 0.3, top, cx + spread * 0.7, top + s * 0.08);
    ctx.quadraticCurveTo(cx + spread, s * 0.4, cx, bot);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, top, 0, bot);
    g.addColorStop(0, lighten(col, 0.28));
    g.addColorStop(0.55, col);
    g.addColorStop(1, darken(col, 0.3));
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = darken(col, 0.34);
    ctx.lineWidth = 1;
    ctx.stroke();
  };
  petal(c, w * 0.62, darken(color, 0.16)); // back
  petal(c - w * 0.22, w * 0.34, color); // left
  petal(c + w * 0.22, w * 0.34, color); // right
  petal(c, w * 0.28, lighten(color, 0.06)); // front centre
  // notches between front petals
  ctx.beginPath();
  ctx.moveTo(c - w * 0.12, top + s * 0.1);
  ctx.lineTo(c - w * 0.1, s * 0.5);
  ctx.moveTo(c + w * 0.12, top + s * 0.1);
  ctx.lineTo(c + w * 0.1, s * 0.5);
  ctx.strokeStyle = darken(color, 0.28);
  ctx.globalAlpha = 0.5;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawFivePetal(ctx: Ctx, s: number, color: string, center: string, phase = 0) {
  const c = s / 2;
  const R = s * 0.46;
  petalRing(ctx, c, c, {
    count: 5,
    rot: 0,
    rInner: R * 0.12,
    rOuter: R,
    w: s * 0.4,
    color,
    tip: 0.3,
    line: 0.28,
    phase,
  });
  ctx.beginPath();
  ctx.arc(c, c, R * 0.24, 0, Math.PI * 2);
  const g = ctx.createRadialGradient(c, c, 0, c, c, R * 0.24);
  g.addColorStop(0, lighten(center, 0.4));
  g.addColorStop(1, darken(center, 0.2));
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = darken(center, 0.3);
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawCalla(ctx: Ctx, s: number, color: string) {
  // trumpet / funnel opening up-left
  ctx.beginPath();
  ctx.moveTo(s * 0.5, s * 0.92);
  ctx.quadraticCurveTo(s * 0.02, s * 0.7, s * 0.16, s * 0.28);
  ctx.quadraticCurveTo(s * 0.3, s * 0.02, s * 0.6, s * 0.12);
  ctx.quadraticCurveTo(s * 0.96, s * 0.24, s * 0.86, s * 0.6);
  ctx.quadraticCurveTo(s * 0.74, s * 0.9, s * 0.5, s * 0.92);
  ctx.closePath();
  const g = ctx.createLinearGradient(s * 0.15, s * 0.2, s * 0.85, s * 0.9);
  g.addColorStop(0, lighten(color, 0.5));
  g.addColorStop(0.5, color);
  g.addColorStop(1, darken(color, 0.25));
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = darken(color, 0.3);
  ctx.lineWidth = 1;
  ctx.stroke();
  // inner throat shadow
  ctx.beginPath();
  ctx.ellipse(s * 0.5, s * 0.56, s * 0.2, s * 0.3, -0.3, 0, Math.PI * 2);
  ctx.fillStyle = darken(color, 0.28);
  ctx.globalAlpha = 0.5;
  ctx.fill();
  ctx.globalAlpha = 1;
  // yellow spadix
  ctx.beginPath();
  ctx.roundRect?.(s * 0.46, s * 0.32, s * 0.08, s * 0.34, s * 0.04);
  ctx.fillStyle = "#ffd21e";
  ctx.fill();
  ctx.strokeStyle = "#b98700";
  ctx.stroke();
}

function drawLeafSpray(ctx: Ctx, s: number) {
  const leaf = (x: number, y: number, len: number, ang: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(len * 0.35, -len * 0.3, len, 0);
    ctx.quadraticCurveTo(len * 0.35, len * 0.3, 0, 0);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, 0, len, 0);
    g.addColorStop(0, "#2f8f3a");
    g.addColorStop(1, "#67d05a");
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = "#1f6b2a";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(2, 0);
    ctx.lineTo(len * 0.85, 0);
    ctx.strokeStyle = "#1f6b2a";
    ctx.globalAlpha = 0.6;
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();
  };
  leaf(s * 0.5, s * 0.9, s * 0.5, -1.9);
  leaf(s * 0.5, s * 0.85, s * 0.5, -1.2);
  leaf(s * 0.5, s * 0.9, s * 0.42, -2.5);
}

function drawButterfly(ctx: Ctx, s: number, top: string, bottom: string) {
  const c = s / 2;
  const wing = (sx: number) => {
    ctx.save();
    ctx.translate(c, c);
    ctx.scale(sx, 1);
    // upper wing
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.05);
    ctx.quadraticCurveTo(s * 0.5, -s * 0.5, s * 0.46, -s * 0.16);
    ctx.quadraticCurveTo(s * 0.4, 0, s * 0.1, s * 0.02);
    ctx.closePath();
    let g = ctx.createLinearGradient(0, 0, s * 0.46, -s * 0.3);
    g.addColorStop(0, darken(top, 0.2));
    g.addColorStop(1, lighten(top, 0.2));
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = "#2a1420";
    ctx.lineWidth = 1;
    ctx.stroke();
    // lower wing
    ctx.beginPath();
    ctx.moveTo(0, s * 0.02);
    ctx.quadraticCurveTo(s * 0.4, s * 0.5, s * 0.34, s * 0.18);
    ctx.quadraticCurveTo(s * 0.28, s * 0.04, s * 0.08, s * 0.03);
    ctx.closePath();
    g = ctx.createLinearGradient(0, 0, s * 0.34, s * 0.3);
    g.addColorStop(0, darken(bottom, 0.2));
    g.addColorStop(1, lighten(bottom, 0.2));
    ctx.fillStyle = g;
    ctx.fill();
    ctx.stroke();
    // wing spots
    ctx.beginPath();
    ctx.arc(s * 0.28, -s * 0.2, s * 0.05, 0, Math.PI * 2);
    ctx.fillStyle = "#fff2b0";
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };
  wing(1);
  wing(-1);
  // body
  ctx.beginPath();
  ctx.ellipse(c, c, s * 0.04, s * 0.32, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#2a1420";
  ctx.fill();
  // antennae
  ctx.beginPath();
  ctx.moveTo(c, c - s * 0.3);
  ctx.quadraticCurveTo(c + s * 0.1, c - s * 0.5, c + s * 0.16, c - s * 0.44);
  ctx.moveTo(c, c - s * 0.3);
  ctx.quadraticCurveTo(c - s * 0.1, c - s * 0.5, c - s * 0.16, c - s * 0.44);
  ctx.strokeStyle = "#2a1420";
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawLadybug(ctx: Ctx, s: number) {
  const c = s / 2;
  ctx.beginPath();
  ctx.arc(c, c + s * 0.05, s * 0.42, 0, Math.PI * 2);
  const g = ctx.createRadialGradient(c - s * 0.15, c - s * 0.1, s * 0.05, c, c, s * 0.42);
  g.addColorStop(0, "#ff5a5a");
  g.addColorStop(1, "#c00");
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = "#600";
  ctx.lineWidth = 1;
  ctx.stroke();
  // head
  ctx.beginPath();
  ctx.arc(c, c - s * 0.34, s * 0.16, 0, Math.PI * 2);
  ctx.fillStyle = "#1a1a1a";
  ctx.fill();
  // seam
  ctx.beginPath();
  ctx.moveTo(c, c - s * 0.2);
  ctx.lineTo(c, c + s * 0.47);
  ctx.strokeStyle = "#500";
  ctx.stroke();
  // spots
  const spots: [number, number, number][] = [
    [-0.18, -0.02, 0.09],
    [0.18, -0.02, 0.09],
    [-0.2, 0.22, 0.08],
    [0.2, 0.22, 0.08],
    [0, 0.32, 0.07],
  ];
  ctx.fillStyle = "#111";
  for (const [dx, dy, r] of spots) {
    ctx.beginPath();
    ctx.arc(c + dx * s, c + dy * s, r * s, 0, Math.PI * 2);
    ctx.fill();
  }
}

// `draw` takes a phase 0..1; `anim` marks assets whose pixels genuinely change with phase (so the
// renderer bakes a multi-frame loop for them; the rest render as a single frame).
export type AssetSpec = {
  w: number;
  h: number;
  anim?: boolean;
  draw: (ctx: Ctx, phase: number) => void;
};

export const ASSETS: Record<string, AssetSpec> = {
  rose_red: { w: 60, h: 60, anim: true, draw: (ctx, p) => drawRose(ctx, 60, "#e11d3a", p) },
  rose_yellow: { w: 60, h: 60, anim: true, draw: (ctx, p) => drawRose(ctx, 60, "#ffcf1e", p) },
  rose_pink: { w: 60, h: 60, anim: true, draw: (ctx, p) => drawRose(ctx, 60, "#ff5ca0", p) },
  rose_blue: { w: 60, h: 60, anim: true, draw: (ctx, p) => drawRose(ctx, 60, "#3f63d6", p) },
  gerbera_pink: {
    w: 58,
    h: 58,
    anim: true,
    draw: (ctx, p) => drawGerbera(ctx, 58, "#ff62b0", "#ffd21e", 11, false, p),
  },
  gerbera_red: {
    w: 58,
    h: 58,
    anim: true,
    draw: (ctx, p) => drawGerbera(ctx, 58, "#ef2740", "#3a1206", 22, true, p),
  },
  gerbera_orange: {
    w: 58,
    h: 58,
    anim: true,
    draw: (ctx, p) => drawGerbera(ctx, 58, "#ff8a1e", "#6b3d16", 7, false, p),
  },
  gerbera_purple: {
    w: 58,
    h: 58,
    anim: true,
    draw: (ctx, p) => drawGerbera(ctx, 58, "#9a4be0", "#ffd21e", 33, true, p),
  },
  daisy_white: {
    w: 58,
    h: 58,
    anim: true,
    draw: (ctx, p) => drawDaisy(ctx, 58, "#ffffff", "#ffcf1e", 4, p),
  },
  sunflower: { w: 62, h: 62, anim: true, draw: (ctx, p) => drawSunflower(ctx, 62, 9, p) },
  tulip_red: { w: 46, h: 60, draw: (ctx) => drawTulip(ctx, 46, "#e11d3a") },
  tulip_yellow: { w: 46, h: 60, draw: (ctx) => drawTulip(ctx, 46, "#ffcf1e") },
  tulip_purple: { w: 46, h: 60, draw: (ctx) => drawTulip(ctx, 46, "#9a4be0") },
  five_blue: {
    w: 40,
    h: 40,
    anim: true,
    draw: (ctx, p) => drawFivePetal(ctx, 40, "#3f7be0", "#ffd21e", p),
  },
  five_orange: {
    w: 40,
    h: 40,
    anim: true,
    draw: (ctx, p) => drawFivePetal(ctx, 40, "#ff8a1e", "#ffe6a0", p),
  },
  calla_pink: { w: 54, h: 60, draw: (ctx) => drawCalla(ctx, 54, "#ff8fc4") },
  leafspray: { w: 54, h: 54, draw: (ctx) => drawLeafSpray(ctx, 54) },
  butterfly: { w: 48, h: 44, draw: (ctx) => drawButterfly(ctx, 44, "#ff5aa0", "#ffb020") },
  butterfly_blue: { w: 48, h: 44, draw: (ctx) => drawButterfly(ctx, 44, "#3f8fe0", "#ff8a2a") },
  ladybug: { w: 30, h: 30, draw: (ctx) => drawLadybug(ctx, 30) },
};
