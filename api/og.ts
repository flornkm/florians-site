import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ImageResponse } from "@vercel/og";
import { promises as fsp } from "node:fs";
import path from "node:path";
import { jsx, jsxs } from "react/jsx-runtime";

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
    const avatarDataUrl = await readPublicFileAsDataUrl("images/avatars/florian_kiem.jpg", "image/jpeg");
    const background = await readPublicFileAsDataUrl("images/og-background.png", "image/png");

    const imageResponse = new ImageResponse(
      jsxs("div", {
        tw: "bg-white flex w-full h-full flex-col text-black p-12",
        style: {
          fontFamily: "Pretendard, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        },
        children: [
          jsx("img", {
            tw: "absolute inset-0",
            src: background,
          }),
          jsx("div", {
            tw: "flex-1 flex justify-between gap-4 w-full relative z-10",
            children: [
              jsx("img", {
                tw: "rounded-full shrink-0 border border-neutral-200 object-cover",
                alt: "Avatar",
                src: avatarDataUrl,
                width: 128,
                height: 128,
              }),
              jsx("div", {
                tw: "flex-1 flex flex-col w-full items-end",
                children: [
                  jsx("p", { tw: "text-7xl text-right", children: title }),
                  jsx("p", { tw: "text-5xl text-neutral-400", children: "Florians Personal Site" }),
                ],
              }),
            ],
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
