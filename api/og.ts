import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ImageResponse } from "@vercel/og";
import { promises as fsp } from "node:fs";
import path from "node:path";
import { jsx, jsxs } from "react/jsx-runtime";
import rough from "roughjs";

const ROUGH_OPTS = {
  stroke: "black",
  strokeWidth: 2.5,
  roughness: 2,
  bowing: 1.5,
  maxRandomnessOffset: 1.5,
  fill: "transparent",
};

function buildRoughCirclePaths(cx: number, cy: number, rx: number, ry: number, seed: number): string {
  const gen = rough.generator();
  const drawable = gen.ellipse(cx, cy, rx * 2, ry * 2, { ...ROUGH_OPTS, seed });
  return gen
    .toPaths(drawable)
    .map(
      (p) =>
        `<path d="${p.d}" stroke="${p.stroke}" stroke-width="${p.strokeWidth}" fill="none" stroke-linecap="round" />`,
    )
    .join("");
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

    const pretendardMedium = await readPublicFileAsArrayBuffer("fonts/pretendard/Pretendard-Medium.woff");
    const background = await readPublicFileAsDataUrl("images/og-background.png", "image/png");

    // Estimate circle size from title length — longer titles get a bigger ellipse.
    // Base font size for the title inside the circle.
    const maxCharsPerLine = 14;
    const lines = Math.ceil(title.length / maxCharsPerLine);
    const fontSize = Math.max(40, Math.min(72, Math.floor(width * 0.06)));
    const lineHeight = fontSize * 1.2;
    // rx/ry sized to comfortably wrap title text
    const ry = Math.max(160, lines * lineHeight * 0.75 + 80);
    const rx = Math.max(220, Math.min(width * 0.38, ry * 1.4));

    const cx = rx + 24;
    const cy = height / 2;
    const svgW = cx + rx + 30;
    const svgH = height;

    const roughPaths = buildRoughCirclePaths(cx, cy, rx, ry, 42);

    const imageResponse = new ImageResponse(
      jsxs("div", {
        tw: "bg-white flex w-full h-full text-black",
        style: {
          fontFamily: "Pretendard, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          position: "relative",
        },
        children: [
          jsx("img", {
            tw: "absolute inset-0",
            src: background,
            style: { width: "100%", height: "100%", objectFit: "cover" },
          }),
          // Rough circle with title
          jsx("div", {
            style: {
              position: "absolute",
              left: 0,
              top: 0,
              width: svgW,
              height: svgH,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
            children: jsx("img", {
              src: `data:image/svg+xml;base64,${Buffer.from(
                `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">${roughPaths}</svg>`,
              ).toString("base64")}`,
              width: svgW,
              height: svgH,
            }),
          }),
          // Title text centered in circle
          jsx("div", {
            style: {
              position: "absolute",
              left: 0,
              top: 0,
              width: cx * 2,
              height: svgH,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 32px",
            },
            children: jsx("p", {
              style: {
                fontSize,
                textAlign: "center",
                lineHeight: 1.2,
                maxWidth: rx * 1.5,
                margin: 0,
                wordBreak: "break-word",
              },
              children: title,
            }),
          }),
          // Site name — right side
          jsx("div", {
            style: {
              position: "absolute",
              right: 48,
              bottom: 48,
              display: "flex",
              fontSize: 32,
              color: "#737373",
            },
            children: "Florians Personal Site",
          }),
        ],
      }),
      {
        width,
        height,
        fonts: [{ name: "Pretendard", data: pretendardMedium, weight: 500, style: "normal" }],
      },
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
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}

function clampInt(value: string | null, fallback: number, min: number, max: number): number {
  const n = value ? Number.parseInt(value, 10) : Number.NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

async function readPublicFileAsArrayBuffer(relPath: string): Promise<ArrayBuffer> {
  const fsPath = path.join(process.cwd(), "public", relPath);
  const buf = await fsp.readFile(fsPath);
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

async function readPublicFileAsDataUrl(relPath: string, mime: string): Promise<string> {
  const fsPath = path.join(process.cwd(), "public", relPath);
  const buf = await fsp.readFile(fsPath);
  return `data:${mime};base64,${buf.toString("base64")}`;
}
