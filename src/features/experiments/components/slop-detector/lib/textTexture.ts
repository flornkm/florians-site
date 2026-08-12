import * as THREE from "three";

const FONT_FAMILY = "Commit Mono Slop";
const FONT_FALLBACK = `"${FONT_FAMILY}", "Commit Mono", ui-monospace, "SFMono-Regular", Menlo, monospace`;

let fontLoaded = false;
let fontLoading: Promise<void> | null = null;

export function loadFont(url: string): Promise<void> {
  if (fontLoaded) return Promise.resolve();
  if (fontLoading) return fontLoading;
  fontLoading = (async () => {
    try {
      const font = new FontFace(FONT_FAMILY, `url(${url})`);
      await font.load();
      (document as Document & { fonts: FontFaceSet }).fonts.add(font);
      fontLoaded = true;
    } catch (e) {
      console.warn("[slop] font load failed, using fallback:", e);
    } finally {
      fontLoading = null;
    }
  })();
  return fontLoading;
}

export type TextTextureResult = {
  texture: THREE.CanvasTexture;
  width: number;
  height: number;
  aspect: number;
};

const PADDING_X = 6;
const PADDING_Y = 4;
const DPR = 2;

export function makeTextTexture(
  text: string,
  pxFontSize: number,
  color: string,
  letterSpacing = 0,
): TextTextureResult {
  const measure = document.createElement("canvas").getContext("2d")!;
  measure.font = `${pxFontSize}px ${FONT_FALLBACK}`;
  const baseWidth = measure.measureText(text).width;
  const totalWidth = baseWidth + letterSpacing * Math.max(0, text.length - 1);

  const w = Math.ceil((totalWidth + PADDING_X * 2) * DPR);
  const h = Math.ceil((pxFontSize + PADDING_Y * 2) * DPR);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(DPR, DPR);
  ctx.fillStyle = color;
  ctx.font = `${pxFontSize}px ${FONT_FALLBACK}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";

  if (letterSpacing === 0) {
    ctx.fillText(text, PADDING_X, h / DPR / 2);
  } else {
    let x = PADDING_X;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      ctx.fillText(ch, x, h / DPR / 2);
      x += measure.measureText(ch).width + letterSpacing;
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return { texture: tex, width: w, height: h, aspect: w / h };
}
