import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ImageResponse } from "@vercel/og";
import fs from "node:fs";
import path from "node:path";
import { jsx, jsxs } from "react/jsx-runtime";
import rough from "roughjs";

const OPTS = { stroke: "black", strokeWidth: 2.5, roughness: 2, bowing: 1.5, maxRandomnessOffset: 1.5, fill: "none" as const };
const FONT_SIZE = 80;

export default async function handler(req: Request | VercelRequest, res?: VercelResponse): Promise<Response | void> {
  try {
    const isEdge = req instanceof Request;
    const url = isEdge
      ? new URL((req as Request).url)
      : new URL(`http://localhost${typeof (req as VercelRequest).url === "string" ? (req as VercelRequest).url : "/"}`);
    const { searchParams } = url;

    const fullTitle = (searchParams.get("title") || "Florian").slice(0, 120);
    const title = fullTitle.split(" ")[0];
    const width = clampInt(searchParams.get("width"), 1200, 100, 2000);
    const height = clampInt(searchParams.get("height"), 630, 100, 2000);

    const fontData = fs.readFileSync(path.join(process.cwd(), "public/fonts/commit-mono/commit-mono-regular.otf"));
    const fontArrayBuffer = fontData.buffer.slice(fontData.byteOffset, fontData.byteOffset + fontData.byteLength) as ArrayBuffer;

    const textW = title.length * FONT_SIZE * 0.6;
    const rx = textW / 2 + 80;
    const ry = FONT_SIZE / 2 + 70;
    const cx = width / 2;
    const cy = height / 2;

    const gen = rough.generator();
    const ellipseDrawable = gen.ellipse(cx, cy, rx * 2, ry * 2, { ...OPTS, seed: 42 });
    const ellipsePaths = gen.toPaths(ellipseDrawable)
      .map(p => `<path d="${p.d}" stroke="${p.stroke}" stroke-width="${p.strokeWidth}" fill="none" stroke-linecap="round"/>`)
      .join("");

    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="white"/>${ellipsePaths}</svg>`;
    const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString("base64")}`;

    const imageResponse = new ImageResponse(
      jsxs("div", {
        style: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" },
        children: [
          jsx("img", { src: svgDataUrl, width, height, style: { position: "absolute", inset: 0 } }),
          jsx("span", {
            style: { fontFamily: "CommitMono", fontSize: FONT_SIZE, fontWeight: 400, color: "black", position: "relative" },
            children: title,
          }),
        ],
      }),
      { width, height, fonts: [{ name: "CommitMono", data: fontArrayBuffer, weight: 400, style: "normal" }] },
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
