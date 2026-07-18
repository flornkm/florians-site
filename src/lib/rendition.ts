// Display-sized image renditions. The build script (scripts/build-image-manifest.ts) pre-renders these into
// public/_gen and records the available widths in imageMap.gen.ts; <Image> builds a srcset from the same paths.
// Both sides MUST agree on the URL shape, so the mapping lives here.

// Covers a ~1000px column on retina (2048) down to a 1/3-width mobile thumbnail (640). Widths at or above the
// source are skipped per-image so nothing is ever upscaled.
export const RENDITION_WIDTHS = [640, 1280, 2048] as const;

// Above this, a top-tier rendition already covers retina, so serving the (often huge) original adds bytes without
// visible gain. At or below it, the original is the sharpest candidate a small source can offer.
export const MAX_SRCSET_WIDTH = RENDITION_WIDTHS[RENDITION_WIDTHS.length - 1];

// "/images/superpower/modal.webp" + 1280 -> "_gen/images/superpower/modal-1280.webp"
export function renditionRelPath(publicPath: string, width: number): string {
  const noExt = publicPath.replace(/\.[^/.]+$/, "");
  return `_gen${noExt}-${width}.webp`;
}

export function renditionUrl(publicPath: string, width: number): string {
  return "/" + renditionRelPath(publicPath, width);
}

export function buildSrcSet(publicPath: string, widths: number[]): string {
  return widths.map((w) => `${renditionUrl(publicPath, w)} ${w}w`).join(", ");
}
