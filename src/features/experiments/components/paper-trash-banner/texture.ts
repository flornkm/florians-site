import * as THREE from "three";

export const BANNER_W = 1024;
export const BANNER_H = 304;

// Button bounding box in UV-space (0..1) so the hover hit-test can use it.
export const BUTTON_UV = {
  uMin: (BANNER_W - 312) / BANNER_W,
  uMax: (BANNER_W - 312 + 268) / BANNER_W,
  // Canvas Y is top-down; PlaneGeometry UV.y is bottom-up.
  vMin: 1 - (BANNER_H / 2 + 36) / BANNER_H,
  vMax: 1 - (BANNER_H / 2 - 36) / BANNER_H,
};

interface BannerOptions {
  hover: boolean;
}

export function createCookieBannerTexture(opts: BannerOptions = { hover: false }): THREE.CanvasTexture {
  const w = BANNER_W;
  const h = BANNER_H;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  // Clean white surface — no paper noise / fibers; we want it to read as a
  // crisp UI element, not a printed sheet of paper.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);

  // ----- Cookie -----
  drawCookie(ctx, 124, h / 2, 54);

  // ----- Heading -----
  ctx.fillStyle = "#101014";
  ctx.font = "500 48px -apple-system, 'SF Pro Text', 'Inter', system-ui, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText("We use cookies.", 220, h / 2 - 18);

  // ----- Subline (kept short so it doesn't run into the button) -----
  ctx.fillStyle = "#7a7a82";
  ctx.font = "400 30px -apple-system, 'SF Pro Text', 'Inter', system-ui, sans-serif";
  ctx.fillText("To remember you next time.", 220, h / 2 + 28);

  // ----- Button (hover lifts the fill noticeably but still subtly) -----
  const btnFill = opts.hover ? "#3a3a48" : "#101014";
  const btnStroke = opts.hover ? "#5a5a6c" : "#101014";
  drawButton(ctx, w - 312, h / 2 - 36, 268, 72, "Accept", {
    fill: btnFill,
    stroke: btnStroke,
    text: "#ffffff",
    radius: 36,
  });

  // Subtle border (the actual mesh is corner-clipped in the shader, so we
  // only need a faint hairline to define the card edge).
  ctx.strokeStyle = "rgba(0, 0, 0, 0.06)";
  ctx.lineWidth = 2;
  roundRectPath(ctx, 1, 1, w - 2, h - 2, 24);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  // No mipmaps — they down-average the thin border into the surrounding
  // white. The texture's still rendered crisp at this scale.
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

/**
 * Soft, multi-stop drop-shadow texture used by a plane behind the cloth.
 * Looks like a popup-style stacked shadow when the paper is flat.
 */
export function createBannerShadowTexture(): THREE.CanvasTexture {
  const w = 1024;
  const h = 512;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, w, h);

  // Centre rectangle of the would-be card (matches banner footprint).
  const padX = 130;
  const padTop = 90;
  const padBot = 150; // shadow leans downward
  const cardX = padX;
  const cardY = padTop;
  const cardW = w - padX * 2;
  const cardH = h - padTop - padBot;

  // Stacked rounded-rect shadows: largest+softest first, smallest+sharpest last.
  const layers = [
    { spread: 90, opacity: 0.04, offsetY: 60 },
    { spread: 60, opacity: 0.06, offsetY: 38 },
    { spread: 32, opacity: 0.08, offsetY: 18 },
    { spread: 14, opacity: 0.10, offsetY: 6 },
  ];
  for (const layer of layers) {
    ctx.save();
    ctx.shadowColor = `rgba(0, 0, 0, ${layer.opacity})`;
    ctx.shadowBlur = layer.spread;
    ctx.shadowOffsetY = layer.offsetY;
    ctx.fillStyle = "rgba(0,0,0,1)"; // colour only matters for the shadow it casts
    roundRectPath(ctx, cardX, cardY, cardW, cardH, 28);
    ctx.fill();
    ctx.restore();
  }

  // Now punch the rectangle itself out so we keep only the shadow halo.
  ctx.globalCompositeOperation = "destination-out";
  roundRectPath(ctx, cardX, cardY, cardW, cardH, 28);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

function drawCookie(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.save();
  const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  grad.addColorStop(0, "#e8c388");
  grad.addColorStop(1, "#c69050");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(0, 0, 0, 0.10)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "#3a2010";
  const chips: [number, number, number][] = [
    [-0.32, -0.27, 0.13],
    [0.27, -0.21, 0.10],
    [0.11, 0.27, 0.13],
    [-0.21, 0.32, 0.09],
    [0.37, 0.11, 0.08],
    [-0.05, -0.05, 0.06],
  ];
  for (const [dx, dy, cr] of chips) {
    ctx.beginPath();
    ctx.arc(x + dx * r, y + dy * r, cr * r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawButton(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  opts: { fill: string; stroke: string; text: string; radius: number },
) {
  ctx.beginPath();
  roundRectPath(ctx, x, y, w, h, opts.radius);
  ctx.fillStyle = opts.fill;
  ctx.fill();
  ctx.strokeStyle = opts.stroke;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = opts.text;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.font = "500 27px -apple-system, 'SF Pro Text', 'Inter', system-ui, sans-serif";
  ctx.fillText(label, x + w / 2, y + h / 2 + 1);
  ctx.textAlign = "start";
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
