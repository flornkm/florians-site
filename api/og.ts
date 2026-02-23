import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ImageResponse } from "@vercel/og";
import path from "node:path";
import * as opentype from "opentype.js";
import { jsx } from "react/jsx-runtime";
import rough from "roughjs";

const ROUGH_OPTS = {
  stroke: "black",
  strokeWidth: 2.5,
  roughness: 2,
  bowing: 1.5,
  maxRandomnessOffset: 1.5,
  fill: "none" as const,
};

const TEXT_ROUGH_OPTS = {
  stroke: "black",
  strokeWidth: 1.5,
  roughness: 1.8,
  bowing: 1.2,
  maxRandomnessOffset: 1.2,
  fill: "black" as const,
  fillStyle: "hachure" as const,
  fillWeight: 1.5,
  hachureGap: 3,
};

/** Word-wrap title into lines no wider than maxWidth px at given fontSize. */
function wrapLines(font: opentype.Font, title: string, fontSize: number, maxWidth: number): string[] {
  const words = title.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (font.getAdvanceWidth(test, fontSize) <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export default async function handler(req: Request | VercelRequest, res?: VercelResponse): Promise<Response | void> {
  try {
    const isEdge = req instanceof Request;
    const url = isEdge
      ? new URL((req as Request).url)
      : new URL(`http://localhost${typeof (req as VercelRequest).url === "string" ? (req as VercelRequest).url : "/"}`);
    const { searchParams } = url;

    const title = (searchParams.get("title") || "Florians Site").slice(0, 120);
    const width = clampInt(searchParams.get("width"), 1200, 100, 2000);
    const height = clampInt(searchParams.get("height"), 630, 100, 2000);

    // Load font for path generation
    const fontPath = path.join(process.cwd(), "public/fonts/pretendard/PretendardVariable.ttf");
    const font = opentype.loadSync(fontPath);

    const fontSize = 80;
    const lineHeightPx = fontSize * 1.25;
    const maxLineWidth = width * 0.4; // max text width inside circle

    const lines = wrapLines(font, title, fontSize, maxLineWidth);
    const scale = fontSize / font.unitsPerEm;
    const ascender = font.ascender * scale;
    const descender = font.descender * scale;
    const lineH = ascender - descender;

    // Total text block height
    const textBlockH = lines.length * lineHeightPx - (lineHeightPx - lineH);

    // Circle sized to contain the text with padding
    const textMaxW = Math.max(...lines.map((l) => font.getAdvanceWidth(l, fontSize)));
    const rx = textMaxW / 2 + 80;
    const ry = textBlockH / 2 + 80;

    const cx = width / 2;
    const cy = height / 2;

    const gen = rough.generator();

    // Build rough ellipse paths
    const ellipseDrawable = gen.ellipse(cx, cy, rx * 2, ry * 2, { ...ROUGH_OPTS, seed: 42 });
    const ellipsePaths = gen
      .toPaths(ellipseDrawable)
      .map(
        (p) =>
          `<path d="${p.d}" stroke="${p.stroke}" stroke-width="${p.strokeWidth}" fill="none" stroke-linecap="round" />`,
      )
      .join("");

    // Build rough text paths — each line centered
    const textTopY = cy - textBlockH / 2 + ascender;
    let textPaths = "";
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineW = font.getAdvanceWidth(line, fontSize);
      const x = cx - lineW / 2;
      const y = textTopY + i * lineHeightPx;
      const pathData = font.getPath(line, x, y, fontSize).toPathData(2);
      const drawable = gen.path(pathData, { ...TEXT_ROUGH_OPTS, seed: 100 + i });
      textPaths += gen
        .toPaths(drawable)
        .map((p) => {
          const fillAttr = p.fill && p.fill !== "none" ? ` fill="${p.fill}"` : ` fill="none"`;
          const strokeAttr =
            p.stroke && p.stroke !== "none"
              ? ` stroke="${p.stroke}" stroke-width="${p.strokeWidth}"`
              : ` stroke="none"`;
          return `<path d="${p.d}"${strokeAttr}${fillAttr} stroke-linecap="round" />`;
        })
        .join("");
    }

    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${ellipsePaths}${textPaths}</svg>`;
    const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString("base64")}`;

    const imageResponse = new ImageResponse(
      jsx("div", {
        style: {
          width: "100%",
          height: "100%",
          background: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
        children: jsx("img", {
          src: svgDataUrl,
          width,
          height,
        }),
      }),
      { width, height },
    );

    if (!isEdge && res) {
      const arrayBuf = await imageResponse.arrayBuffer();
      const buf = Buffer.from(arrayBuf);
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
      res.status(200).send(buf);
      return;
    }
    return imageResponse;
  } catch (e: unknown) {
    if (e instanceof Error) console.log(e.message);
    else console.log(String(e));
    return new Response(`Failed to generate the image`, { status: 500 });
  }
}

function clampInt(value: string | null, fallback: number, min: number, max: number): number {
  const n = value ? Number.parseInt(value, 10) : Number.NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}
