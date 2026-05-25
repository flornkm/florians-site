import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ImageResponse } from "@vercel/og";
import fs from "node:fs";
import path from "node:path";
import React from "react";

const mediumFont = fs.readFileSync(
  path.join(process.cwd(), "public/fonts/pretendard/Pretendard-Medium.woff"),
);

const WIDTH = 1200;
const HEIGHT = 630;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const rawTitle = Array.isArray(req.query.title) ? req.query.title[0] : req.query.title;
    const subtitle = (rawTitle || "Design Engineer").slice(0, 120);

    const image = new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#ffffff",
            fontFamily: "Pretendard",
            letterSpacing: "-0.03em",
            display: "flex",
            flexDirection: "column",
            padding: "64px 72px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontWeight: 500,
                color: "#111111",
                lineHeight: 1.1,
              }}
            >
              Florian Kiem
            </div>
            <div
              style={{
                fontSize: 48,
                fontWeight: 500,
                color: "#9a9a9a",
                lineHeight: 1.1,
              }}
            >
              {subtitle}
            </div>
          </div>
        </div>
      ),
      {
        width: WIDTH,
        height: HEIGHT,
        fonts: [
          {
            name: "Pretendard",
            data: mediumFont,
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
