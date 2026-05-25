import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ImageResponse } from "@vercel/og";
import fs from "node:fs";
import path from "node:path";
import opentype from "opentype.js";
import React from "react";
import rough from "roughjs";

const fontData = fs.readFileSync(
  path.join(process.cwd(), "public/fonts/pretendard/Pretendard-SemiBold.woff"),
);

const titleFontBuf = fs.readFileSync(
  path.join(process.cwd(), "public/fonts/pretendard/PretendardVariable.ttf"),
);
const titleFont = opentype.parse(
  titleFontBuf.buffer.slice(
    titleFontBuf.byteOffset,
    titleFontBuf.byteOffset + titleFontBuf.byteLength,
  ),
);

const WIDTH = 1200;
const HEIGHT = 630;

// Linear chain of routes — discovered from src/routes at module init.
// Each route gets a previous and next neighbor (cyclic). Pages whose title
// doesn't appear here (e.g. dynamic work/$id, writing/$id) render with just
// the centered title and no neighbors.
function discoverRoutes(): string[] {
  const routesDir = path.join(process.cwd(), "src/routes");
  let entries: { kind: "index" | "page"; title: string }[] = [];

  try {
    const items = fs.readdirSync(routesDir, { withFileTypes: true });
    for (const item of items) {
      if (item.name.startsWith("_") || item.name.startsWith("$") || item.name.startsWith(".")) {
        continue;
      }

      if (item.isFile() && item.name.endsWith(".tsx")) {
        const slug = item.name.replace(/\.tsx$/, "");
        if (slug === "index") {
          entries.push({ kind: "index", title: "Work" });
        } else {
          entries.push({ kind: "page", title: slugToTitle(slug) });
        }
      } else if (item.isDirectory()) {
        const indexPath = path.join(routesDir, item.name, "index.tsx");
        if (fs.existsSync(indexPath)) {
          entries.push({ kind: "page", title: slugToTitle(item.name) });
        }
      }
    }
  } catch {
    // If the filesystem isn't available at runtime fall back to an empty list.
  }

  // Home first, the rest alphabetical so the order is deterministic and
  // doesn't depend on filesystem iteration order.
  entries.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "index" ? -1 : 1;
    return a.title.localeCompare(b.title);
  });

  return entries.map((e) => e.title);
}

function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const ROUTE_CHAIN = discoverRoutes();

// Estimated character width — used to pick a font size that leaves slack
// around the title so the rough strokes don't crowd the ellipse. The
// final ellipse is sized from actual opentype measurements.
const CHAR_WIDTH_RATIO = 0.7;
const FONT_LADDER = [140, 130, 120, 110, 100, 90, 80, 72, 64, 56, 48] as const;
const LINE_HEIGHT = 1.15;
const rxPadFor = (font: number) => font * 0.55;
const ryPadFor = (font: number) => font * 0.4;
// Extra clearance between the glyph paths and the ellipse stroke — the
// roughened glyph outlines wobble outward a few pixels, so the ellipse
// has to start a bit further out than the geometric glyph box.
const TEXT_SAFETY = 24;

function measureWidth(text: string, fontSize: number): number {
  return titleFont.getAdvanceWidth(text, fontSize);
}

function chooseLayout(title: string): { fontSize: number; lines: string[] } {
  const maxRx = WIDTH / 2 - 60;
  const maxRy = HEIGHT / 2 - 60;

  for (const font of FONT_LADDER) {
    const rxPad = rxPadFor(font);
    const ryPad = ryPadFor(font);
    const maxTextWidth = (maxRx - rxPad - TEXT_SAFETY) * 2;
    const maxTextHeight = (maxRy - ryPad - TEXT_SAFETY) * 2;
    const maxCharsPerLine = Math.max(6, Math.floor(maxTextWidth / (font * CHAR_WIDTH_RATIO)));
    const lines = balancedWrap(title, maxCharsPerLine);
    const longest = lines.reduce((m, l) => Math.max(m, l.length), 0);
    const textWidth = longest * font * CHAR_WIDTH_RATIO;
    const textHeight = lines.length * font * LINE_HEIGHT;
    if (textWidth <= maxTextWidth && textHeight <= maxTextHeight) {
      return { fontSize: font, lines };
    }
  }
  return { fontSize: 44, lines: balancedWrap(title, 28) };
}

function balancedWrap(title: string, maxCharsPerLine: number): string[] {
  if (title.length <= maxCharsPerLine) return [title];
  const words = title.split(/\s+/);
  if (words.length <= 1) return [title];

  const targetLines = Math.max(2, Math.ceil(title.length / maxCharsPerLine));
  const target = title.length / targetLines;
  const lines: string[] = [];
  let current = "";

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const next = current ? `${current} ${w}` : w;
    const wordsLeft = words.length - i - 1;
    const linesLeft = targetLines - lines.length;

    if (
      current &&
      Math.abs(next.length - target) > Math.abs(current.length - target) &&
      wordsLeft >= linesLeft - 1
    ) {
      lines.push(current);
      current = w;
    } else {
      current = next;
    }
    if (lines.length === targetLines - 1) {
      const rest = words.slice(i + 1).join(" ");
      current = rest ? `${current} ${rest}` : current;
      break;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const rawTitle = Array.isArray(req.query.title) ? req.query.title[0] : req.query.title;
    const title = (rawTitle || "Florian").slice(0, 200);

    const idx = ROUTE_CHAIN.indexOf(title);
    const n = ROUTE_CHAIN.length;
    const prev = idx >= 0 ? ROUTE_CHAIN[(idx - 1 + n) % n] : null;
    const next = idx >= 0 ? ROUTE_CHAIN[(idx + 1) % n] : null;

    const { fontSize, lines: titleLines } = chooseLayout(title);
    const longestLineWidth = titleLines.reduce(
      (m, l) => Math.max(m, measureWidth(l, fontSize)),
      0,
    );
    const halfCenter = longestLineWidth / 2;
    const GAP = 80;
    const offset = halfCenter + GAP;
    const totalTextHeight = titleLines.length * fontSize * LINE_HEIGHT;

    const gen = rough.generator();

    // Hand-drawn ellipse around the title — same vibe as FloWording.
    const ellipseRx = halfCenter + rxPadFor(fontSize) + TEXT_SAFETY;
    const ellipseRy = totalTextHeight / 2 + ryPadFor(fontSize) + TEXT_SAFETY;
    const ellipseDrawable = gen.ellipse(
      WIDTH / 2,
      HEIGHT / 2,
      ellipseRx * 2,
      ellipseRy * 2,
      {
        stroke: "#111111",
        strokeWidth: 3,
        roughness: 3,
        bowing: 2.2,
        maxRandomnessOffset: 2.5,
        fill: "none",
        seed: 1,
      },
    );
    const ellipsePaths = gen.toPaths(ellipseDrawable);

    // Render each line of the title as rough.js sketched glyph outlines —
    // same approach FloWording uses for the "Flo" word, generalized via
    // opentype.js for arbitrary text.
    const titleRoughPaths: { d: string; stroke: string; strokeWidth: number }[] = [];
    const firstBaselineY = HEIGHT / 2 - totalTextHeight / 2 + fontSize * 0.82;
    titleLines.forEach((line, i) => {
      const lineWidth = measureWidth(line, fontSize);
      const lineX = (WIDTH - lineWidth) / 2;
      const baselineY = firstBaselineY + i * fontSize * LINE_HEIGHT;
      const glyphPath = titleFont.getPath(line, lineX, baselineY, fontSize).toPathData(2);
      const drawable = gen.path(glyphPath, {
        stroke: "#111111",
        strokeWidth: 2.5,
        roughness: 2,
        bowing: 1.5,
        maxRandomnessOffset: 1.5,
        fill: "none",
        seed: 42 + i,
      });
      for (const p of gen.toPaths(drawable)) {
        titleRoughPaths.push({
          d: p.d,
          stroke: p.stroke || "#111111",
          strokeWidth: p.strokeWidth ?? 2.5,
        });
      }
    });

    const image = new ImageResponse(
      (
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            background: "#ffffff",
            fontFamily: "Pretendard",
            fontWeight: 600,
            letterSpacing: "-0.03em",
            fontSize: 44,
            lineHeight: 1,
            overflow: "hidden",
            display: "flex",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              right: `${WIDTH / 2 + offset}px`,
              transform: "translateY(-50%)",
              color: "#bbbbbb",
              whiteSpace: "nowrap",
              display: "flex",
            }}
          >
            {prev || ""}
          </div>
          <svg
            width={WIDTH}
            height={HEIGHT}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            style={{ position: "absolute", top: 0, left: 0 }}
          >
            {ellipsePaths.map((p, i) => (
              <path
                key={`e-${i}`}
                d={p.d}
                stroke={p.stroke || "#111111"}
                strokeWidth={p.strokeWidth}
                fill="none"
                strokeLinecap="round"
              />
            ))}
            {titleRoughPaths.map((p, i) => (
              <path
                key={`t-${i}`}
                d={p.d}
                stroke={p.stroke}
                strokeWidth={p.strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </svg>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: `${WIDTH / 2 + offset}px`,
              transform: "translateY(-50%)",
              color: "#bbbbbb",
              whiteSpace: "nowrap",
              display: "flex",
            }}
          >
            {next || ""}
          </div>
        </div>
      ),
      {
        width: WIDTH,
        height: HEIGHT,
        fonts: [
          {
            name: "Pretendard",
            data: fontData,
            weight: 600,
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
