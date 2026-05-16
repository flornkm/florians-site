import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ImageResponse } from "@vercel/og";
import fs from "node:fs";
import path from "node:path";
import React from "react";

const fontData = fs.readFileSync(
  path.join(process.cwd(), "public/fonts/pretendard/Pretendard-Medium.woff"),
);

const LINE_HEIGHT = 1.1;
const PADDING = 80;
const WIDTH = 1200;
const HEIGHT = 630;

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
  return {
    bg: `hsl(${hue}, 55%, 10%)`,
    fg: `hsl(${(hue + 8) % 360}, 90%, 65%)`,
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const rawTitle = Array.isArray(req.query.title) ? req.query.title[0] : req.query.title;
    const title = (rawTitle || "Florian").slice(0, 200);

    const { bg, fg } = palette(hashString(title));
    const { font: fontSize, lineCount } = chooseSize(title);
    const lines = balancedWrap(title, lineCount);

    const image = new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: PADDING,
            background: bg,
            color: fg,
            fontFamily: "Pretendard",
            fontSize,
            fontWeight: 500,
            letterSpacing: "-0.03em",
            lineHeight: LINE_HEIGHT,
            textAlign: "center",
          }}
        >
          {lines.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      ),
      {
        width: WIDTH,
        height: HEIGHT,
        fonts: [
          {
            name: "Pretendard",
            data: fontData,
            weight: 500,
            style: "normal",
          },
        ],
      },
    );

    const buffer = Buffer.from(await image.arrayBuffer());
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
    res.status(200).send(buffer);
  } catch (e) {
    console.error(e);
    res.status(500).send("Failed to generate the image");
  }
}
