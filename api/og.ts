import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "node:fs";
import path from "node:path";
import rough from "roughjs";

const fontBase64 = fs
  .readFileSync(path.join(process.cwd(), "public/fonts/pretendard/PretendardVariable.ttf"))
  .toString("base64");

const LINE_HEIGHT = 1.1;
const PADDING = 80;

function chooseSize(title: string): { font: number; maxChars: number; maxLines: number } {
  const len = title.length;
  if (len <= 14) return { font: 140, maxChars: 14, maxLines: 1 };
  if (len <= 28) return { font: 130, maxChars: 14, maxLines: 2 };
  if (len <= 48) return { font: 100, maxChars: 18, maxLines: 3 };
  if (len <= 72) return { font: 80, maxChars: 24, maxLines: 3 };
  return { font: 64, maxChars: 28, maxLines: 4 };
}

function palette(seed: number): { bg: string; fg: string } {
  const hue = seed % 360;
  const bgHue = hue;
  const fgHue = (hue + 8) % 360;
  return {
    bg: `hsl(${bgHue}, 55%, 10%)`,
    fg: `hsl(${fgHue}, 90%, 65%)`,
  };
}

function buildRoughF(stroke: string, x: number, y: number, h: number): string {
  const gen = rough.generator();
  const topWidth = h * 0.57;
  const midWidth = h * 0.41;
  const midY = y + h * 0.45;
  const opts = {
    stroke,
    strokeWidth: 5,
    roughness: 2.8,
    bowing: 2.4,
    maxRandomnessOffset: 3,
    seed: 1,
  };

  const drawables = [
    gen.line(x, y, x, y + h, opts),
    gen.line(x, y, x + topWidth, y, opts),
    gen.line(x, midY, x + midWidth, midY, opts),
  ];

  return drawables
    .flatMap((d) => gen.toPaths(d))
    .map(
      (p) =>
        `<path d="${p.d}" stroke="${p.stroke || stroke}" stroke-width="${p.strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    )
    .join("");
}

export default function handler(req: VercelRequest, res: VercelResponse): void {
  try {
    const url = new URL(`http://localhost${typeof req.url === "string" ? req.url : "/"}`);
    const { searchParams } = url;

    const title = (searchParams.get("title") || "Florian").slice(0, 120);
    const width = clampInt(searchParams.get("width"), 1200, 100, 2000);
    const height = clampInt(searchParams.get("height"), 630, 100, 2000);

    const bg = "#ffffff";
    const fg = "#000000";
    const { font: FONT_SIZE, maxChars, maxLines } = chooseSize(title);

    const lines = wrapTitle(title, maxChars).slice(0, maxLines);
    const tspans = lines
      .map((line, i) => {
        const dy = i === 0 ? 0 : FONT_SIZE * LINE_HEIGHT;
        return `<tspan x="${PADDING}" dy="${dy}">${escapeXml(line)}</tspan>`;
      })
      .join("");

    const fHeight = 120;
    const fTopWidth = fHeight * 0.57;
    const fX = width - PADDING - fTopWidth;
    const fY = height - PADDING - fHeight;
    const roughF = buildRoughF(fg, fX, fY, fHeight);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <style>
      @font-face {
        font-family: 'Pretendard';
        src: url('data:font/ttf;base64,${fontBase64}') format('truetype-variations');
        font-weight: 100 900;
      }
    </style>
  </defs>
  <rect width="${width}" height="${height}" fill="${bg}"/>
  <text x="${PADDING}" y="${PADDING + FONT_SIZE * 0.8}" font-family="Pretendard, sans-serif" font-size="${FONT_SIZE}" font-weight="450" fill="${fg}" letter-spacing="-0.03em">${tspans}</text>
  ${roughF}
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

function wrapTitle(title: string, maxChars: number): string[] {
  const words = title.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function clampInt(value: string | null, fallback: number, min: number, max: number): number {
  const n = value ? Number.parseInt(value, 10) : Number.NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
