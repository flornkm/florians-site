/**
 * Captures a poster for each experiment by opening its dialog in a headless Chrome
 * and screenshotting the open box on a TRANSPARENT background. We capture twice —
 * once in each color scheme — so the components (which theme themselves via
 * prefers-color-scheme CSS variables) render their light and dark chrome. The grid
 * then swaps the two via a <picture> media source, so dark mode costs no JS.
 * Components that paint their own background (3D scenes, video, the CRT) stay opaque.
 * Run with the dev server up:
 *
 *   bun run dev            # in one shell
 *   bun scripts/capture-experiments.ts
 *
 * Output: public/experiments/<slug>.webp       (light, transparent where allowed)
 *         public/experiments/<slug>-dark.webp   (dark)
 */
import { chromium } from "playwright-core";
import type { Locator, Page } from "playwright-core";
import { spawnSync } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";

const BASE = process.env.CAPTURE_BASE ?? "http://localhost:3000";
const OUT = "public/experiments";

// Posters render at ~200px in the grid (and briefly mid-morph), so downscale the
// retina screenshot and encode to webp (alpha-aware) with cwebp.
const MAX_WIDTH = Number(process.env.CAPTURE_WIDTH ?? 1000);
const WEBP_QUALITY = 80;

function toWebp(png: string, webp: string) {
  spawnSync(
    "cwebp",
    ["-q", String(WEBP_QUALITY), "-resize", String(MAX_WIDTH), "0", png, "-o", webp],
    { stdio: "ignore" },
  );
}

// Components whose root still paints an opaque fill that must be cleared for a
// transparent capture. (slop-detector / frosted-camera / depth-input now inherit the
// dialog background instead, so they no longer need stripping.)
const STRIP_ROOT_BG = new Set<string>([]);

// Settle time applied to every capture on top of the per-slug time below, so
// animations finish and any transient dev overlay has come and gone.
const BASE_SETTLE = 2500;

// slug → extra settle time (ms) for things that animate or boot slowly.
const SLUGS: Record<string, number> = {
  "login-error": 800, // static login form, no boot animation
  "variable-weight": 800, // static text sample at rest
  "drawer-drag": 1500, // two floating drawers slide in + the photo decodes
  "scrollbar-gutter": 1000, // land on the fully-typed / scrollbar-visible frame
  "shadow-ring": 1200, // spring settles
  copy: 1200,
  "video-player": 1500,
  "slop-detector": 3500, // WebGL boot + first render
  "frosted-camera": 2500, // fake camera stream
  "scroll-mask-fade": 1200,
  "font-smoothing": 800,
  "lazy-image": 2500, // progressive load
  "depth-input": 1000,
  "crt-terminal": 2500, // typing animation
  "ios-context-menu": 1000,
  "text-shimmer": 1500,
  "paste-editor": 800,
  "container-query": 800, // static card at rest
  finder: 1800, // sticker textures load async
};

// Optionally restrict to a subset, e.g. CAPTURE_ONLY=copy,paste-editor
const ONLY = process.env.CAPTURE_ONLY?.split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Optional click (selector inside the open dialog) to put a slug into a more telling
// state before the shot.
const CLICKS: Record<string, string> = {};

// Optional interaction to stage a slug right before the shot (after the settle
// wait) — the live demo is untouched.
const PREPARE: Record<string, (dialog: Locator, page: Page) => Promise<void>> = {
  // Stage a pasted attachment so the poster shows the chip and the active send button.
  "paste-editor": async (dialog, page) => {
    const sample = [
      "# Drawer component spec",
      "",
      "The drawer should feel like a natural extension of the page.",
      "",
      "- Opens from the bottom on mobile",
      "- Swipe down to dismiss",
      "- Background scales to 0.97 while open",
    ].join("\n");
    await dialog
      .locator("textarea")
      .first()
      .evaluate((el, text) => {
        const dt = new DataTransfer();
        dt.setData("text/plain", text);
        el.dispatchEvent(
          new ClipboardEvent("paste", { clipboardData: dt, bubbles: true, cancelable: true }),
        );
      }, sample);
    await page.waitForTimeout(700);
  },
};

// Capture every slug in one color scheme. `suffix` is appended to the output name
// ("" for light, "-dark" for dark) so the grid can pick the file by media query. The
// dark pass relies on each component theming itself via prefers-color-scheme, which
// Playwright drives through the context's `colorScheme`.
async function captureScheme(scheme: "light" | "dark", suffix: string) {
  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
    args: [
      "--use-fake-ui-for-media-stream",
      "--use-fake-device-for-media-stream",
      "--ignore-gpu-blocklist",
      "--enable-gpu",
      "--use-gl=angle",
      "--use-angle=swiftshader",
    ],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2, // retina-crisp posters
    permissions: ["camera"],
    colorScheme: scheme,
  });

  // react-scan is injected in dev (import.meta.env.DEV) and paints render badges
  // over the UI. Block it outright so captures are clean against any server.
  await context.route(
    (url) => url.href.includes("react-scan"),
    (route) => route.abort(),
  );

  for (const [slug, settle] of Object.entries(SLUGS)) {
    if (ONLY && !ONLY.includes(slug)) continue;
    const page = await context.newPage();
    try {
      await page.goto(`${BASE}/experiments?demo=${slug}`, { waitUntil: "networkidle" });
      const dialog = page.locator('[data-experiment-tile="open"]');
      await dialog.waitFor({ state: "visible", timeout: 15000 });

      const click = CLICKS[slug];
      if (click)
        await dialog
          .locator(click)
          .click()
          .catch(() => {});

      // Isolate the dialog so the screenshot's only opaque pixels are the ones the
      // component itself paints. omitBackground removes the browser default, but the
      // app's own body bg + the z-[100] backdrop sit *behind* the (transparent) dialog
      // and would show through — so hide everything via visibility and clear page bgs,
      // then re-show just the dialog subtree (visibility:visible cascades to children).
      await page.evaluate((stripRootBg) => {
        document.documentElement.style.background = "transparent";
        document.body.style.background = "transparent";
        document.body.style.visibility = "hidden";
        const el = document.querySelector('[data-experiment-tile="open"]') as HTMLElement | null;
        if (el) {
          el.style.visibility = "visible";
          el.style.background = "transparent";
          el.style.borderRadius = "0";
        }
        if (stripRootBg) {
          // First .bg-primary is the component's root fill; clear only that.
          const root = el?.querySelector(".bg-primary") as HTMLElement | null;
          if (root) root.style.background = "transparent";
        }
        const close = document.querySelector('[aria-label="Close"]') as HTMLElement | null;
        if (close) close.style.display = "none";
      }, STRIP_ROOT_BG.has(slug));

      await page.waitForTimeout(BASE_SETTLE + settle);

      await PREPARE[slug]?.(dialog, page);

      const png = `${OUT}/${slug}${suffix}.png`;
      const webp = `${OUT}/${slug}${suffix}.webp`;
      await dialog.screenshot({ path: png, type: "png", omitBackground: true });
      toWebp(png, webp);
      await rm(png, { force: true });
      console.log(`✓ ${slug}${suffix}.webp`);
    } catch (err) {
      console.error(`✗ ${slug}${suffix}:`, err instanceof Error ? err.message : err);
    } finally {
      await page.close();
    }
  }

  await context.close();
  await browser.close();
}

// IMPORTANT: run this file directly (`bun scripts/capture-experiments.ts`), NOT via
// `bun run capture:experiments`. bunfig's `[run] bun = true` routes package scripts
// through Bun's node shim, which breaks Playwright's screenshot pipeline and yields
// blank, fully-transparent posters.
async function main() {
  await mkdir(OUT, { recursive: true });

  await captureScheme("light", "");
  await captureScheme("dark", "-dark");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
