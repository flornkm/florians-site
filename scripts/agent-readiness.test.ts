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
