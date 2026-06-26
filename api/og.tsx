import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ImageResponse } from "@vercel/og";
import fs from "node:fs";
import path from "node:path";
import React from "react";

// Static weight-500 instance of the variable Haas Recast (the site sans). @vercel/og's Satori
// can't parse the variable TTF, and it must be a git-tracked file or Vercel won't deploy it.
const mediumFont = fs.readFileSync(
  path.join(process.cwd(), "public/fonts/haas-recast/HaasRecast-OG-Medium.ttf"),
);

const WIDTH = 1200;
const HEIGHT = 630;

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const rawTitle = firstParam(req.query.title);
    const title = (rawTitle || "Design Engineer").slice(0, 120);
    const isWriting = firstParam(req.query.writing) === "1";
    const icon = firstParam(req.query.icon); // base64-encoded standalone SVG

    const element = isWriting ? writingCard(title, icon) : defaultCard(title);

    const image = new ImageResponse(element, {
      width: WIDTH,
      height: HEIGHT,
      fonts: [{ name: "Haas Recast", data: mediumFont, weight: 500, style: "normal" }],
    });

    const buffer = Buffer.from(await image.arrayBuffer());
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
    res.status(200).send(buffer);
  } catch (e) {
    console.error(e);
    res.status(500).send("Failed to generate the image");
  }
}

function defaultCard(subtitle: string) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#ffffff",
        fontFamily: "Haas Recast",
        letterSpacing: "-0.03em",
        display: "flex",
        flexDirection: "column",
        padding: "64px 72px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 48, fontWeight: 500, color: "#9a9a9a", lineHeight: 1.1 }}>
          Florian Kiem
        </div>
        <div style={{ fontSize: 48, fontWeight: 500, color: "#111111", lineHeight: 1.1 }}>
          {subtitle}
        </div>
      </div>
    </div>
  );
}

function writingCard(_title: string, iconBase64?: string) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {iconBase64 ? (
        <img
          alt=""
          width={360}
          height={360}
          src={`data:image/svg+xml;base64,${iconBase64}`}
          style={{ width: 360, height: 360 }}
        />
      ) : null}
    </div>
  );
}
