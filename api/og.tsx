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

function orbGradient(seed: number): string {
  const rand = (n: number) => {
    let s = (seed + n * 2654435761) >>> 0;
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };

  const baseHue = seed % 360;
  // Analogous hues — stay within ~60° of the base so the orb feels harmonious
  const hues = [0, 18, 38, -15, -32].map(
    (offset) => (baseHue + offset + 360 + Math.floor(rand(offset + 100) * 10)) % 360,
  );

  const blobs = hues.map((hue, i) => {
    const x = Math.round(15 + rand(i * 2 + 1) * 70);
    const y = Math.round(15 + rand(i * 2 + 2) * 70);
    const radius = Math.round(45 + rand(i * 2 + 3) * 30);
    const sat = 92 + Math.floor(rand(i * 2 + 4) * 8);
    const light = 68 + Math.floor(rand(i * 2 + 5) * 18);
    const alpha = (0.8 + rand(i * 2 + 6) * 0.2).toFixed(2);
    return `radial-gradient(circle at ${x}% ${y}%, hsla(${hue}, ${sat}%, ${light}%, ${alpha}) 0%, hsla(${hue}, ${sat}%, ${light}%, 0) ${radius}%)`;
  });

  // Base layer fills any gaps so the orb is never washed out
  blobs.push(
    `radial-gradient(circle at 50% 55%, hsl(${hues[0]}, 95%, 70%) 0%, hsl(${hues[2]}, 85%, 52%) 100%)`,
  );

  return blobs.join(", ");
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

    const orb = orbGradient(hashString(title));
    const { font: fontSize, lineCount } = chooseSize(title);
    const lines = balancedWrap(title, lineCount);
    const dotSize = fontSize * LINE_HEIGHT;

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
            background: "#ffffff",
            color: "#111111",
            fontFamily: "Pretendard",
            fontSize,
            fontWeight: 500,
            letterSpacing: "-0.03em",
            lineHeight: LINE_HEIGHT,
            textAlign: "center",
          }}
        >
          {lines.map((line, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: `${fontSize * 0.3}px`,
              }}
            >
              {i === 0 && (
                <div
                  style={{
                    width: dotSize,
                    height: dotSize,
                    borderRadius: "9999px",
                    background: orb,
                    flexShrink: 0,
                    boxShadow: "inset 0 0 0 2px rgba(0,0,0,0.1)",
                  }}
                />
              )}
              <span>{line}</span>
            </div>
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
