import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "node:fs";
import path from "node:path";

const fontBase64 = fs
  .readFileSync(path.join(process.cwd(), "public/fonts/pretendard/PretendardVariable.ttf"))
  .toString("base64");

const LINE_HEIGHT = 1.1;
const PADDING = 80;

function chooseSize(title: string): { font: number; lineCount: number } {
  const len = title.length;
  if (len <= 14) return { font: 140, lineCount: 1 };
  if (len <= 28) return { font: 130, lineCount: 2 };
  if (len <= 48) return { font: 100, lineCount: 3 };
  if (len <= 72) return { font: 80, lineCount: 3 };
  return { font: 64, lineCount: 4 };
}

function balancedWrap(title: string, lineCount: number): string[] {
  if (lineCount <= 1) return [title];
  const words = title.split(/\s+/);
  if (words.length <= lineCount) return words;

  const totalLen = title.length;
  const target = totalLen / lineCount;
  const lines: string[] = [];
  let current = "";
  let remainingLines = lineCount;
  let remainingChars = totalLen;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const next = current ? `${current} ${word}` : word;
    const currentTarget = remainingChars / remainingLines;
    const wordsLeft = words.length - i - 1;

    if (
      current &&
      Math.abs(next.length - currentTarget) > Math.abs(current.length - currentTarget) &&
      wordsLeft >= remainingLines - 1
    ) {
      lines.push(current);
      remainingChars -= current.length + 1;
      remainingLines -= 1;
      current = word;
    } else {
      current = next;
    }

    if (remainingLines === 1) {
      const rest = words.slice(i + 1).join(" ");
      current = rest ? `${current} ${rest}` : current;
      break;
    }
  }

  if (current) lines.push(current);
  return lines;
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

export default function handler(req: VercelRequest, res: VercelResponse): void {
  try {
    const url = new URL(`http://localhost${typeof req.url === "string" ? req.url : "/"}`);
    const { searchParams } = url;

    const title = (searchParams.get("title") || "Florian").slice(0, 200);
    const width = clampInt(searchParams.get("width"), 1200, 100, 2000);
    const height = clampInt(searchParams.get("height"), 630, 100, 2000);

    const { bg, fg } = palette(hashString(title));
    const { font: FONT_SIZE, lineCount } = chooseSize(title);

    const lines = balancedWrap(title, lineCount);
    const cx = width / 2;
    const lineSpacing = FONT_SIZE * LINE_HEIGHT;
    const totalTextHeight = (lines.length - 1) * lineSpacing + FONT_SIZE;
    const firstBaseline = (height - totalTextHeight) / 2 + FONT_SIZE * 0.82;

    const tspans = lines
      .map((line, i) => {
        const dy = i === 0 ? 0 : lineSpacing;
        return `<tspan x="${cx}" dy="${dy}">${escapeXml(line)}</tspan>`;
      })
      .join("");

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
  <text x="${cx}" y="${firstBaseline}" text-anchor="middle" font-family="Pretendard, sans-serif" font-size="${FONT_SIZE}" font-weight="450" fill="${fg}" letter-spacing="-0.03em">${tspans}</text>
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
