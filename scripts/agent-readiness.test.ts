// Regression guards for the agent-facing surface: markdown page coverage,
// robots.txt allowing AI agents, and llms.txt only linking real pages.
import { describe, expect, it } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import { markdownPages } from "../src/markdownMap.gen";

const ROOT = path.resolve(import.meta.dirname!, "..");

// Mirrors scripts/build-sitemap.ts: every static route file plus writing posts.
function routePaths(dir: string, prefix = ""): string[] {
  const paths: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      paths.push(...routePaths(path.join(dir, entry.name), `${prefix}/${entry.name}`));
      continue;
    }
    if (!entry.name.endsWith(".tsx") || entry.name === "__root.tsx" || entry.name.includes("$")) {
      continue;
    }
    const base = entry.name.replace(/\.tsx$/, "");
    paths.push(base === "index" ? prefix || "/" : `${prefix}/${base}`);
  }
  return paths;
}

describe("markdown page coverage", () => {
  const routes = routePaths(path.join(ROOT, "src/routes"));
  const writing = fs
    .readdirSync(path.join(ROOT, "src/writing"), { withFileTypes: true })
    .filter(
      (e) =>
        e.isDirectory() && fs.existsSync(path.join(ROOT, "src/writing", e.name, "article.mdx")),
    )
    .map((e) => `/writing/${e.name}`);

  it.each([...routes, ...writing])("has a markdown variant for %s", (route: string) => {
    expect(markdownPages[route]).toBeDefined();
    expect(markdownPages[route]!.markdown.length).toBeGreaterThan(100);
  });

  it("gives the homepage an H1 and 500+ chars of text", () => {
    const home = markdownPages["/"]!.markdown;
    expect(home.startsWith("# ")).toBe(true);
    expect(home.length).toBeGreaterThan(500);
  });

  it("stamps every page with its canonical URL", () => {
    for (const [route, page] of Object.entries(markdownPages)) {
      expect(page.markdown).toContain(
        `Canonical: https://floriankiem.com${route === "/" ? "" : route}`,
      );
    }
  });
});

describe("robots.txt", () => {
  const robots = fs.readFileSync(path.join(ROOT, "public/robots.txt"), "utf8");

  it("does not disallow anything", () => {
    const disallows = robots
      .split("\n")
      .filter((line) => /^disallow:/i.test(line.trim()))
      .map((line) => line.split(":")[1]!.trim())
      .filter(Boolean);
    expect(disallows).toEqual([]);
  });

  it("explicitly welcomes the major AI agents", () => {
    for (const agent of [
      "GPTBot",
      "ChatGPT-User",
      "ClaudeBot",
      "Claude-User",
      "PerplexityBot",
      "Google-Extended",
      "Applebot-Extended",
      "DeepSeekBot",
    ]) {
      expect(robots).toContain(`User-agent: ${agent}`);
    }
    expect(robots).toContain("Allow: /");
  });

  it("points at the sitemap", () => {
    expect(robots).toContain("Sitemap: https://floriankiem.com/sitemap.xml");
  });
});

describe("llms.txt", () => {
  const llms = fs.readFileSync(path.join(ROOT, "public/llms.txt"), "utf8");

  it("only links to pages that exist", () => {
    const internal = [...llms.matchAll(/\]\((\/[^)\s]*)\)/g)].map((m) => m[1]!);
    expect(internal.length).toBeGreaterThan(0);
    for (const link of internal) {
      const exists =
        link in markdownPages ||
        fs.existsSync(path.join(ROOT, "public", link)) ||
        link === "/sitemap.xml"; // generated into public/ at build time
      expect(exists, `llms.txt links to nonexistent page ${link}`).toBe(true);
    }
  });
});

describe("MDX to markdown", () => {
  const writingDir = path.join(ROOT, "src/writing");
  const posts = fs
    .readdirSync(writingDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(writingDir, e.name, "article.mdx")))
    .map((e) => e.name);

  // Code is the part an agent cannot reconstruct from the prose, and the conversion has two
  // rules — drop `import`/`export` lines, replace JSX component lines — that would happily eat
  // lines inside a fence. Comparing each block verbatim rather than counting fences is what
  // catches a line going missing from the middle of one.
  it.each(posts)("keeps every code block in %s verbatim", (slug: string) => {
    const source = fs.readFileSync(path.join(writingDir, slug, "article.mdx"), "utf8");
    const blocks = [...source.matchAll(/^```[^\n]*\n[\s\S]*?^```/gm)].map((m) => m[0]);
    const twin = markdownPages[`/writing/${slug}`]!.markdown;

    expect((twin.match(/^```/gm) ?? []).length).toBe((source.match(/^```/gm) ?? []).length);
    for (const block of blocks) expect(twin).toContain(block);
  });

  // A demo becomes a note saying the web page has more; page furniture (the copy button)
  // becomes nothing at all. Getting that backwards leaves an agent chasing an interactive
  // widget that was never content in the first place.
  it.each(posts)("marks the demos in %s and only the demos", (slug: string) => {
    const source = fs.readFileSync(path.join(writingDir, slug, "article.mdx"), "utf8");
    const components = [...source.matchAll(/^\s*<([A-Z]\w*)[^>]*\/?>\s*$/gm)].map((m) => m[1]!);
    const demos = components.filter((name) => name !== "CopyAsMarkdown");
    const twin = markdownPages[`/writing/${slug}`]!.markdown;

    expect((twin.match(/\*\(Interactive content on the web page\.\)\*/g) ?? []).length).toBe(
      demos.length,
    );
    for (const name of components) expect(twin).not.toContain(`<${name}`);
  });
});
