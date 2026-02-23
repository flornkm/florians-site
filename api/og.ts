import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ImageResponse } from "@vercel/og";
import { jsx } from "react/jsx-runtime";
import rough from "roughjs";
import { H, measureText, renderText, roughEllipsePaths } from "./utils/rough-text.js";

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

    const gen = rough.generator();

    const textW = measureText(title);
    const rx = textW / 2 + 80;
    const ry = H / 2 + 70;
    const cx = width / 2;
    const cy = height / 2;

    const ellipsePaths = roughEllipsePaths(gen, cx, cy, rx, ry);
    const textSvg = renderText(gen, title, cx - textW / 2, cy + H * 0.5, 0);

    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="white"/>${ellipsePaths}${textSvg}</svg>`;
    const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString("base64")}`;

    const imageResponse = new ImageResponse(
      jsx("img", { src: svgDataUrl, width, height, style: { display: "block" } }),
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
