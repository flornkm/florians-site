import rough from "roughjs";

export const OPTS = {
  stroke: "black",
  strokeWidth: 2.5,
  roughness: 2,
  bowing: 1.5,
  maxRandomnessOffset: 1.5,
  fill: "none" as const,
};

export const H = 60;
export const W = 36;
export const GAP = 10;

type DrawFn = (gen: ReturnType<typeof rough.generator>, x: number, seed: number) => string[];

const LETTERS: Record<string, DrawFn> = {
  A: (gen, x, s) => [
    line(gen, x + W / 2, -H, x, 0, s),
    line(gen, x + W / 2, -H, x + W, 0, s + 1),
    line(gen, x + W * 0.15, -H * 0.4, x + W * 0.85, -H * 0.4, s + 2),
  ],
  B: (gen, x, s) => [
    line(gen, x, -H, x, 0, s),
    arc(gen, x + W * 0.1, -H * 0.75, W * 0.9, H * 0.5, s + 1, -Math.PI / 2, Math.PI / 2),
    arc(gen, x + W * 0.1, -H * 0.25, W * 1.0, H * 0.55, s + 2, -Math.PI / 2, Math.PI / 2),
  ],
  C: (gen, x, s) => [arc(gen, x + W * 0.5, -H * 0.5, W, H, s, -0.7, 0.7)],
  D: (gen, x, s) => [
    line(gen, x, -H, x, 0, s),
    arc(gen, x + W * 0.1, -H * 0.5, W * 0.9, H, s + 1, -Math.PI / 2, Math.PI / 2),
  ],
  E: (gen, x, s) => [
    line(gen, x, -H, x, 0, s),
    line(gen, x, -H, x + W * 0.85, -H, s + 1),
    line(gen, x, -H * 0.5, x + W * 0.7, -H * 0.5, s + 2),
    line(gen, x, 0, x + W * 0.85, 0, s + 3),
  ],
  F: (gen, x, s) => [
    line(gen, x, -H, x, 0, s),
    line(gen, x, -H, x + W * 0.85, -H, s + 1),
    line(gen, x, -H * 0.5, x + W * 0.7, -H * 0.5, s + 2),
  ],
  G: (gen, x, s) => [
    arc(gen, x + W * 0.5, -H * 0.5, W, H, s, -0.6, 0.6),
    line(gen, x + W, -H * 0.5, x + W * 0.55, -H * 0.5, s + 1),
  ],
  H: (gen, x, s) => [
    line(gen, x, -H, x, 0, s),
    line(gen, x + W, -H, x + W, 0, s + 1),
    line(gen, x, -H * 0.5, x + W, -H * 0.5, s + 2),
  ],
  I: (gen, x, s) => [line(gen, x + W / 2, -H, x + W / 2, 0, s)],
  J: (gen, x, s) => [
    line(gen, x + W, -H, x + W, -H * 0.2, s),
    arc(gen, x + W * 0.5, -H * 0.18, W, H * 0.38, s + 1, 0, Math.PI),
  ],
  K: (gen, x, s) => [
    line(gen, x, -H, x, 0, s),
    line(gen, x + W, -H, x, -H * 0.5, s + 1),
    line(gen, x, -H * 0.5, x + W, 0, s + 2),
  ],
  L: (gen, x, s) => [line(gen, x, -H, x, 0, s), line(gen, x, 0, x + W * 0.85, 0, s + 1)],
  M: (gen, x, s) => [
    line(gen, x, 0, x, -H, s),
    line(gen, x, -H, x + W / 2, -H * 0.5, s + 1),
    line(gen, x + W / 2, -H * 0.5, x + W, -H, s + 2),
    line(gen, x + W, -H, x + W, 0, s + 3),
  ],
  N: (gen, x, s) => [
    line(gen, x, 0, x, -H, s),
    line(gen, x, -H, x + W, 0, s + 1),
    line(gen, x + W, 0, x + W, -H, s + 2),
  ],
  O: (gen, x, s) => [ellipse(gen, x + W / 2, -H / 2, W, H, s)],
  P: (gen, x, s) => [line(gen, x, -H, x, 0, s), arc(gen, x + W * 0.1, -H * 0.75, W * 0.85, H * 0.52, s + 1)],
  Q: (gen, x, s) => [ellipse(gen, x + W / 2, -H / 2, W, H, s), line(gen, x + W * 0.6, -H * 0.3, x + W, 0, s + 1)],
  R: (gen, x, s) => [
    line(gen, x, -H, x, 0, s),
    arc(gen, x + W * 0.1, -H * 0.75, W * 0.85, H * 0.52, s + 1),
    line(gen, x + W * 0.4, -H * 0.5, x + W, 0, s + 2),
  ],
  S: (gen, x, s) => [
    arc(gen, x + W * 0.5, -H * 0.75, W, H * 0.52, s, 0.2, 1.0),
    arc(gen, x + W * 0.5, -H * 0.25, W, H * 0.52, s + 1, -0.8, 0.2),
  ],
  T: (gen, x, s) => [line(gen, x + W / 2, -H, x + W / 2, 0, s), line(gen, x, -H, x + W, -H, s + 1)],
  U: (gen, x, s) => [
    line(gen, x, -H, x, -H * 0.25, s),
    arc(gen, x + W / 2, -H * 0.22, W, H * 0.46, s + 1, 0, Math.PI),
    line(gen, x + W, -H * 0.25, x + W, -H, s + 2),
  ],
  V: (gen, x, s) => [line(gen, x, -H, x + W / 2, 0, s), line(gen, x + W / 2, 0, x + W, -H, s + 1)],
  W: (gen, x, s) => [
    line(gen, x, -H, x + W * 0.2, 0, s),
    line(gen, x + W * 0.2, 0, x + W / 2, -H * 0.5, s + 1),
    line(gen, x + W / 2, -H * 0.5, x + W * 0.8, 0, s + 2),
    line(gen, x + W * 0.8, 0, x + W, -H, s + 3),
  ],
  X: (gen, x, s) => [line(gen, x, -H, x + W, 0, s), line(gen, x + W, -H, x, 0, s + 1)],
  Y: (gen, x, s) => [
    line(gen, x, -H, x + W / 2, -H * 0.5, s),
    line(gen, x + W, -H, x + W / 2, -H * 0.5, s + 1),
    line(gen, x + W / 2, -H * 0.5, x + W / 2, 0, s + 2),
  ],
  Z: (gen, x, s) => [
    line(gen, x, -H, x + W, -H, s),
    line(gen, x + W, -H, x, 0, s + 1),
    line(gen, x, 0, x + W, 0, s + 2),
  ],
  a: (gen, x, s) => [
    ellipse(gen, x + W / 2, -H * 0.35, W * 0.85, H * 0.65, s),
    line(gen, x + W * 0.85, -H * 0.65, x + W * 0.85, 0, s + 1),
  ],
  b: (gen, x, s) => [line(gen, x, -H, x, 0, s), ellipse(gen, x + W * 0.52, -H * 0.3, W * 0.9, H * 0.6, s + 1)],
  c: (gen, x, s) => [arc(gen, x + W * 0.5, -H * 0.35, W * 0.9, H * 0.65, s, -0.6, 0.6)],
  d: (gen, x, s) => [
    ellipse(gen, x + W * 0.45, -H * 0.3, W * 0.85, H * 0.6, s),
    line(gen, x + W * 0.9, -H, x + W * 0.9, 0, s + 1),
  ],
  e: (gen, x, s) => [
    arc(gen, x + W * 0.5, -H * 0.35, W * 0.9, H * 0.65, s, -0.5, 0.85),
    line(gen, x + W * 0.08, -H * 0.35, x + W * 0.9, -H * 0.35, s + 1),
  ],
  f: (gen, x, s) => [
    line(gen, x + W * 0.3, -H, x + W * 0.3, 0, s),
    arc(gen, x + W * 0.55, -H * 0.88, W * 0.55, H * 0.28, s + 1, -Math.PI, 0),
    line(gen, x, -H * 0.63, x + W * 0.65, -H * 0.63, s + 2),
  ],
  g: (gen, x, s) => [
    ellipse(gen, x + W * 0.45, -H * 0.35, W * 0.85, H * 0.6, s),
    line(gen, x + W * 0.88, -H * 0.62, x + W * 0.88, H * 0.22, s + 1),
    arc(gen, x + W * 0.42, H * 0.22, W * 0.85, H * 0.35, s + 2, 0, Math.PI),
  ],
  h: (gen, x, s) => [
    line(gen, x, -H, x, 0, s),
    arc(gen, x + W * 0.5, -H * 0.5, W * 0.9, H * 0.55, s + 1, -Math.PI, 0),
    line(gen, x + W * 0.88, -H * 0.28, x + W * 0.88, 0, s + 2),
  ],
  i: (gen, x, s) => [
    line(gen, x + W / 2, -H * 0.6, x + W / 2, 0, s),
    line(gen, x + W / 2 - 2, -H * 0.82, x + W / 2 + 2, -H * 0.78, s + 1),
  ],
  j: (gen, x, s) => [
    line(gen, x + W * 0.6, -H * 0.6, x + W * 0.6, H * 0.2, s),
    arc(gen, x + W * 0.28, H * 0.2, W * 0.6, H * 0.32, s + 1, 0, Math.PI),
    line(gen, x + W * 0.6 - 2, -H * 0.82, x + W * 0.6 + 2, -H * 0.78, s + 2),
  ],
  k: (gen, x, s) => [
    line(gen, x, -H, x, 0, s),
    line(gen, x + W * 0.85, -H * 0.65, x, -H * 0.3, s + 1),
    line(gen, x, -H * 0.3, x + W * 0.85, 0, s + 2),
  ],
  l: (gen, x, s) => [line(gen, x + W / 2, -H, x + W / 2, 0, s)],
  m: (gen, x, s) => [
    line(gen, x, -H * 0.65, x, 0, s),
    arc(gen, x + W * 0.3, -H * 0.5, W * 0.55, H * 0.55, s + 1, -Math.PI, 0),
    line(gen, x + W * 0.55, -H * 0.28, x + W * 0.55, 0, s + 2),
    arc(gen, x + W * 0.78, -H * 0.5, W * 0.5, H * 0.55, s + 3, -Math.PI, 0),
    line(gen, x + W * 1.0, -H * 0.28, x + W * 1.0, 0, s + 4),
  ],
  n: (gen, x, s) => [
    line(gen, x, -H * 0.65, x, 0, s),
    arc(gen, x + W * 0.45, -H * 0.62, W * 0.85, H * 0.28, s + 1, -Math.PI, 0),
    line(gen, x + W * 0.88, -H * 0.48, x + W * 0.88, 0, s + 2),
  ],
  o: (gen, x, s) => [ellipse(gen, x + W / 2, -H * 0.33, W * 0.9, H * 0.65, s)],
  p: (gen, x, s) => [
    line(gen, x, -H * 0.65, x, H * 0.35, s),
    ellipse(gen, x + W * 0.5, -H * 0.33, W * 0.9, H * 0.62, s + 1),
  ],
  q: (gen, x, s) => [
    ellipse(gen, x + W * 0.42, -H * 0.33, W * 0.85, H * 0.62, s),
    line(gen, x + W * 0.88, -H * 0.65, x + W * 0.88, H * 0.35, s + 1),
  ],
  r: (gen, x, s) => [
    line(gen, x, -H * 0.65, x, 0, s),
    arc(gen, x + W * 0.45, -H * 0.55, W * 0.85, H * 0.3, s + 1, -Math.PI, -0.1),
  ],
  s: (gen, x, s) => [
    arc(gen, x + W * 0.5, -H * 0.55, W * 0.85, H * 0.32, s, 0.15, 1.0),
    arc(gen, x + W * 0.5, -H * 0.22, W * 0.85, H * 0.32, s + 1, -0.85, 0.1),
  ],
  t: (gen, x, s) => [
    line(gen, x + W * 0.4, -H * 0.9, x + W * 0.4, 0, s),
    line(gen, x + W * 0.05, -H * 0.62, x + W * 0.8, -H * 0.62, s + 1),
  ],
  u: (gen, x, s) => [
    line(gen, x, -H * 0.65, x, -H * 0.22, s),
    arc(gen, x + W / 2, -H * 0.2, W * 0.9, H * 0.42, s + 1, 0, Math.PI),
    line(gen, x + W * 0.88, -H * 0.22, x + W * 0.88, -H * 0.65, s + 2),
  ],
  v: (gen, x, s) => [line(gen, x, -H * 0.65, x + W / 2, 0, s), line(gen, x + W / 2, 0, x + W, -H * 0.65, s + 1)],
  w: (gen, x, s) => [
    line(gen, x, -H * 0.65, x + W * 0.2, 0, s),
    line(gen, x + W * 0.2, 0, x + W / 2, -H * 0.35, s + 1),
    line(gen, x + W / 2, -H * 0.35, x + W * 0.8, 0, s + 2),
    line(gen, x + W * 0.8, 0, x + W, -H * 0.65, s + 3),
  ],
  x: (gen, x, s) => [line(gen, x, -H * 0.65, x + W, 0, s), line(gen, x + W, -H * 0.65, x, 0, s + 1)],
  y: (gen, x, s) => [
    line(gen, x, -H * 0.65, x + W / 2, -H * 0.2, s),
    line(gen, x + W, -H * 0.65, x + W / 2, -H * 0.2, s + 1),
    line(gen, x + W / 2, -H * 0.2, x + W * 0.3, H * 0.35, s + 2),
    arc(gen, x + W * 0.1, H * 0.35, W * 0.45, H * 0.28, s + 3, 0, Math.PI),
  ],
  z: (gen, x, s) => [
    line(gen, x, -H * 0.65, x + W, -H * 0.65, s),
    line(gen, x + W, -H * 0.65, x, 0, s + 1),
    line(gen, x, 0, x + W, 0, s + 2),
  ],
  " ": () => [],
  "-": (gen, x, s) => [line(gen, x, -H * 0.35, x + W * 0.8, -H * 0.35, s)],
  "!": (gen, x, s) => [
    line(gen, x + W / 2, -H, x + W / 2, -H * 0.25, s),
    line(gen, x + W / 2 - 2, -H * 0.08, x + W / 2 + 2, -H * 0.04, s + 1),
  ],
  "?": (gen, x, s) => [
    arc(gen, x + W * 0.5, -H * 0.75, W * 0.8, H * 0.5, s, -Math.PI, 0.2),
    line(gen, x + W * 0.55, -H * 0.45, x + W * 0.5, -H * 0.25, s + 1),
    line(gen, x + W / 2 - 2, -H * 0.08, x + W / 2 + 2, -H * 0.04, s + 2),
  ],
  ",": (gen, x, s) => [arc(gen, x + W * 0.4, H * 0.08, W * 0.18, H * 0.22, s, -Math.PI * 0.3, Math.PI * 0.9)],
  ".": (gen, x, s) => [line(gen, x + W * 0.4 - 2, -H * 0.04, x + W * 0.4 + 2, 0, s)],
};

function line(
  gen: ReturnType<typeof rough.generator>,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  seed: number,
): string {
  const d = gen.line(x1, y1, x2, y2, { ...OPTS, seed });
  return gen
    .toPaths(d)
    .map(
      (p) =>
        `<path d="${p.d}" stroke="${p.stroke}" stroke-width="${p.strokeWidth}" fill="none" stroke-linecap="round"/>`,
    )
    .join("");
}

function ellipse(
  gen: ReturnType<typeof rough.generator>,
  cx: number,
  cy: number,
  w: number,
  h: number,
  seed: number,
): string {
  const d = gen.ellipse(cx, cy, w, h, { ...OPTS, seed, fill: "none" });
  return gen
    .toPaths(d)
    .map(
      (p) =>
        `<path d="${p.d}" stroke="${p.stroke}" stroke-width="${p.strokeWidth}" fill="none" stroke-linecap="round"/>`,
    )
    .join("");
}

function arc(
  gen: ReturnType<typeof rough.generator>,
  cx: number,
  cy: number,
  w: number,
  h: number,
  seed: number,
  start?: number,
  end?: number,
): string {
  const s = start ?? -Math.PI;
  const e = end ?? 0;
  const d = gen.arc(cx, cy, w, h, s, e, false, { ...OPTS, seed, fill: "none" });
  return gen
    .toPaths(d)
    .map(
      (p) =>
        `<path d="${p.d}" stroke="${p.stroke}" stroke-width="${p.strokeWidth}" fill="none" stroke-linecap="round"/>`,
    )
    .join("");
}

export function measureText(text: string): number {
  return text.split("").reduce((w, ch) => {
    if (ch === " ") return w + W * 0.6 + GAP;
    const lw = ch === "m" ? W * 1.1 : W;
    return w + lw + GAP;
  }, -GAP);
}

export function renderText(
  gen: ReturnType<typeof rough.generator>,
  text: string,
  offsetX: number,
  offsetY: number,
  seed: number,
): string {
  let x = offsetX;
  const parts: string[] = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === " ") {
      x += W * 0.6 + GAP;
      continue;
    }
    const draw = LETTERS[ch];
    if (draw) parts.push(...draw(gen, x, seed + i * 10));
    const lw = ch === "m" ? W * 1.1 : W;
    x += lw + GAP;
  }
  return `<g transform="translate(0, ${offsetY})">${parts.join("")}</g>`;
}

export function roughEllipsePaths(
  gen: ReturnType<typeof rough.generator>,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
): string {
  const drawable = gen.ellipse(cx, cy, rx * 2, ry * 2, { ...OPTS, seed: 42 });
  return gen
    .toPaths(drawable)
    .map(
      (p) =>
        `<path d="${p.d}" stroke="${p.stroke}" stroke-width="${p.strokeWidth}" fill="none" stroke-linecap="round"/>`,
    )
    .join("");
}
