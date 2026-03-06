import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "node:fs";
import path from "node:path";
import rough from "roughjs";

const OPTS = {
  stroke: "black",
  strokeWidth: 2.5,
  roughness: 2,
  bowing: 1.5,
  maxRandomnessOffset: 1.5,
  fill: "none" as const,
};
const FONT_SIZE = 80;

const fontBase64 = fs
  .readFileSync(path.join(process.cwd(), "public/fonts/sf-zimmerman/sf-zimmerman.regular.ttf"))
  .toString("base64");

export default function handler(req: VercelRequest, res: VercelResponse): void {
  try {
    const url = new URL(`http://localhost${typeof req.url === "string" ? req.url : "/"}`);
    const { searchParams } = url;

    const fullTitle = (searchParams.get("title") || "Florian").slice(0, 120);
    const title = fullTitle.split(" ")[0];
    const width = clampInt(searchParams.get("width"), 1200, 100, 2000);
    const height = clampInt(searchParams.get("height"), 630, 100, 2000);

    const textW = title.length * FONT_SIZE * 0.75;
    const rx = textW / 2 + 80;
    const ry = FONT_SIZE / 2 + 70;
    const cx = width / 2;
    const cy = height / 2;

    const gen = rough.generator();
    const ellipseDrawable = gen.ellipse(cx, cy, rx * 2, ry * 2, { ...OPTS, seed: 42 });
    const ellipsePaths = gen
      .toPaths(ellipseDrawable)
      .map(
        (p) =>
          `<path d="${p.d}" stroke="${p.stroke}" stroke-width="${p.strokeWidth}" fill="none" stroke-linecap="round"/>`,
      )
      .join("");

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <style>
      @font-face {
        font-family: 'SFZimmerman';
        src: url('data:font/ttf;base64,${fontBase64}') format('truetype');
      }
    </style>
  </defs>
  <rect width="${width}" height="${height}" fill="white"/>
  ${ellipsePaths}
  <text x="${cx}" y="${cy + FONT_SIZE * 0.2}" text-anchor="middle" font-family="SFZimmerman, sans-serif" font-size="${FONT_SIZE}" letter-spacing="0.15em" fill="black">${escapeXml(title)}</text>
</svg>`;

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
    res.status(200).send(svg);
  } catch (e: unknown) {
    if (e instanceof Error) console.log(e.message);
    else console.log(String(e));
    res.status(500).send("Failed to generate the image");
  }
}

function clampInt(value: string | null, fallback: number, min: number, max: number): number {
  const n = value ? Number.parseInt(value, 10) : Number.NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
