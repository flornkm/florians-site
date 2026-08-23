import { describe, expect, it } from "bun:test";
import {
  isNegotiablePath,
  normalizePathname,
  notFoundMarkdown,
  prefersMarkdown,
} from "./agent-content";
import { canonicalLink } from "./site";

describe("prefersMarkdown", () => {
  it("serves markdown for an explicit text/markdown accept", () => {
    expect(prefersMarkdown("text/markdown")).toBe(true);
    expect(prefersMarkdown("text/markdown, text/plain;q=0.9")).toBe(true);
    expect(prefersMarkdown("TEXT/MARKDOWN")).toBe(true);
  });

  it("serves markdown when it outranks or ties text/html", () => {
    expect(prefersMarkdown("text/markdown, text/html;q=0.8")).toBe(true);
    expect(prefersMarkdown("text/html, text/markdown")).toBe(true);
  });

  it("keeps HTML for browsers", () => {
    expect(
      prefersMarkdown("text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,*/*;q=0.8"),
    ).toBe(false);
    expect(prefersMarkdown("*/*")).toBe(false);
    expect(prefersMarkdown("text/html")).toBe(false);
    expect(prefersMarkdown(undefined)).toBe(false);
    expect(prefersMarkdown("")).toBe(false);
  });

  it("ignores markdown with q=0", () => {
    expect(prefersMarkdown("text/markdown;q=0, text/html")).toBe(false);
  });

  it("keeps HTML when it explicitly outranks markdown", () => {
    expect(prefersMarkdown("text/html, text/markdown;q=0.5")).toBe(false);
  });
});

describe("normalizePathname", () => {
  it("maps .md paths onto their page", () => {
    expect(normalizePathname("/about.md")).toBe("/about");
    expect(normalizePathname("/index.md")).toBe("/");
    expect(normalizePathname("/writing/runs.md")).toBe("/writing/runs");
  });

  it("strips trailing slashes but keeps the root", () => {
    expect(normalizePathname("/about/")).toBe("/about");
    expect(normalizePathname("/")).toBe("/");
  });

  it("decodes escapes and survives malformed ones", () => {
    expect(normalizePathname("/kr%C3%BCmel")).toBe("/krümel");
    expect(normalizePathname("/%zz")).toBe("/%zz");
  });
});

describe("isNegotiablePath", () => {
  it("negotiates pages and .md paths", () => {
    expect(isNegotiablePath("/")).toBe(true);
    expect(isNegotiablePath("/about")).toBe(true);
    expect(isNegotiablePath("/about.md")).toBe(true);
  });

  it("skips APIs, internals, and static assets", () => {
    expect(isNegotiablePath("/api/og")).toBe(false);
    expect(isNegotiablePath("/_gen/foo.webp")).toBe(false);
    expect(isNegotiablePath("/sitemap.xml")).toBe(false);
    expect(isNegotiablePath("/llms.txt")).toBe(false);
    expect(isNegotiablePath("/images/foo.webp")).toBe(false);
  });
});

describe("notFoundMarkdown", () => {
  it("points agents at recovery routes", () => {
    const body = notFoundMarkdown("/nope");
    expect(body).toContain("404");
    expect(body).toContain("/nope");
    expect(body).toContain("https://floriankiem.com/sitemap.xml");
    expect(body).toContain("https://floriankiem.com/llms.txt");
  });
});

describe("canonicalLink", () => {
  it("emits absolute canonical URLs without trailing slashes", () => {
    expect(canonicalLink("/")).toEqual({ rel: "canonical", href: "https://floriankiem.com" });
    expect(canonicalLink("/about")).toEqual({
      rel: "canonical",
      href: "https://floriankiem.com/about",
    });
    expect(canonicalLink("/about/")).toEqual({
      rel: "canonical",
      href: "https://floriankiem.com/about",
    });
  });
});
