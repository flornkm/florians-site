// Emits src/imageMap.gen.ts with image dimensions + a ThumbHash so <Image> avoids layout shift and shows a blur-up.
// Also pre-renders sharpened, display-sized WebP renditions into public/_gen so <Image> can serve a srcset matched
// to the device — a 5040px source downscaled ~5x in the browser looks soft, especially on fine UI text.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { rgbaToThumbHash } from "thumbhash";
import { renditionRelPath, RENDITION_WIDTHS } from "../src/lib/rendition";

const ROOT = path.resolve(import.meta.dirname!, "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const IMAGES_DIR = path.join(PUBLIC_DIR, "images");
const GEN_DIR = path.join(PUBLIC_DIR, "_gen");
const OUTPUT_PATH = path.join(ROOT, "src/imageMap.gen.ts");

const RASTER = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const SVG = ".svg";

interface Entry {
  width: number;
  height: number;
  thumbhash: string | null;
  widths?: number[];
}

function parseSvgDimensions(source: string): { width: number; height: number } | null {
  const tagMatch = source.match(/<svg\b[^>]*>/i);
  if (!tagMatch) return null;
  const tag = tagMatch[0];

  const attrNum = (name: string): number | null => {
    const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*"([^"]+)"`, "i"));
    if (!m) return null;
    const n = parseFloat(m[1]);
    return Number.isFinite(n) ? n : null;
  };

  const w = attrNum("width");
  const h = attrNum("height");
  if (w && h) return { width: w, height: h };

  const viewBox = tag.match(/\bviewBox\s*=\s*"([^"]+)"/i);
  if (viewBox) {
    const parts = viewBox[1]
      .trim()
      .split(/[\s,]+/)
      .map(parseFloat);
    if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
      return { width: parts[2], height: parts[3] };
    }
  }
  return null;
}

function walk(dir: string, out: string[] = []): string[] {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

async function processImage(absPath: string): Promise<[string, Entry] | null> {
  const ext = path.extname(absPath).toLowerCase();
  const publicPath = "/" + path.relative(PUBLIC_DIR, absPath).split(path.sep).join("/");

  if (ext === SVG) {
    const dims = parseSvgDimensions(fs.readFileSync(absPath, "utf-8"));
    if (!dims) return null;
    return [publicPath, { width: dims.width, height: dims.height, thumbhash: null }];
  }

  if (!RASTER.has(ext)) return null;

  const image = sharp(absPath);
  const meta = await image.metadata();
  if (!meta.width || !meta.height) return null;

  const { data, info } = await image
    .clone()
    .resize(100, 100, { fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const hash = rgbaToThumbHash(info.width, info.height, data);
  const thumbhash = Buffer.from(hash).toString("base64");

  const widths = await renderRenditions(absPath, publicPath, meta.width);

  return [
    publicPath,
    { width: meta.width, height: meta.height, thumbhash, ...(widths.length ? { widths } : {}) },
  ];
}

// Lanczos downscale + a light unsharp recovers the crispness the browser's fast downscaler loses, and re-spends
// the byte budget on the pixels actually shown (a 15MP source at ~0.08 bits/px vs ~0.6 at display size).
async function renderRenditions(
  absPath: string,
  publicPath: string,
  sourceWidth: number,
): Promise<number[]> {
  const targets = RENDITION_WIDTHS.filter((w) => w < sourceWidth);
  await Promise.all(
    targets.map(async (w) => {
      const outPath = path.join(PUBLIC_DIR, renditionRelPath(publicPath, w));
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      await sharp(absPath)
        .resize({ width: w, kernel: "lanczos3" })
        .sharpen({ sigma: 0.6 })
        .webp({ quality: 80, effort: 5 })
        .toFile(outPath);
    }),
  );
  return targets;
}

async function main() {
  if (!fs.existsSync(IMAGES_DIR)) {
    console.warn(`[image-manifest] ${IMAGES_DIR} does not exist, skipping`);
    return;
  }

  // Wipe so removed/renamed sources never leave orphan renditions behind; the tree is rebuilt below.
  fs.rmSync(GEN_DIR, { recursive: true, force: true });

  const files = walk(IMAGES_DIR);
  const entries = await Promise.all(files.map(processImage));
  const manifest: Record<string, Entry> = {};
  for (const e of entries) {
    if (e) manifest[e[0]] = e[1];
  }

  const sorted = Object.keys(manifest).sort();
  const body = sorted
    .map((k) => {
      const { width, height, thumbhash, widths } = manifest[k];
      const hash = thumbhash === null ? "null" : JSON.stringify(thumbhash);
      const widthsField = widths?.length ? `, widths: [${widths.join(", ")}]` : "";
      return `  ${JSON.stringify(k)}: { width: ${width}, height: ${height}, thumbhash: ${hash}${widthsField} },`;
    })
    .join("\n");

  const source = `// Generated by scripts/build-image-manifest.ts — do not edit by hand.
export interface ImageManifestEntry {
  width: number;
  height: number;
  thumbhash: string | null;
  widths?: number[];
}

export const imageManifest: Record<string, ImageManifestEntry> = {
${body}
};
`;

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, source);
  console.log(
    `[image-manifest] wrote ${sorted.length} entries to ${path.relative(ROOT, OUTPUT_PATH)}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
