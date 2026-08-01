// Pre-renders a 1200×630 OG card per experiment from the captured light poster
// (public/experiments/<slug>.webp), so a shared /experiments?demo=<slug> link previews
// the component itself. Static PNGs instead of the /api/og function: Satori can't embed
// WebP, and link scrapers don't all decode WebP or composite transparency — a flattened
// PNG works everywhere. Runs as part of `bun run build`.
//
// Output: public/_og/experiments/<slug>.png — NOT under public/_gen, which
// build-image-manifest.ts wipes wholesale on every run.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname!, "..");
const POSTERS_DIR = path.join(ROOT, "public/experiments");
const OUT_DIR = path.join(ROOT, "public/_og/experiments");

const WIDTH = 1200;
const HEIGHT = 630;
// Breathing room around the contained 4:3 poster so opaque demos read as a centered
// card rather than an edge-clipped screenshot.
const PADDING = 40;
// --surface in light mode (src/styles/colors.css) — the background the open dialog
// gives the component, so transparent posters flatten onto the exact same fill.
const LIGHT_SURFACE = "#ffffff";

async function main() {
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const posters = fs
    .readdirSync(POSTERS_DIR)
    .filter((f) => f.endsWith(".webp") && !f.endsWith("-dark.webp"));

  await Promise.all(
    posters.map(async (file) => {
      const slug = file.replace(/\.webp$/, "");
      const poster = await sharp(path.join(POSTERS_DIR, file))
        .resize(WIDTH - PADDING * 2, HEIGHT - PADDING * 2, { fit: "inside" })
        .png()
        .toBuffer();

      await sharp({
        create: { width: WIDTH, height: HEIGHT, channels: 3, background: LIGHT_SURFACE },
      })
        .composite([{ input: poster, gravity: "center" }])
        .png({ compressionLevel: 9 })
        .toFile(path.join(OUT_DIR, `${slug}.png`));

      console.log(`✓ ${slug}.png`);
    }),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
