import { describe, expect, it } from "bun:test";
import {
  STRUCTURED_DATA,
  structuredDataJson,
  writingIndexStructuredData,
  writingPostStructuredData,
} from "./structured-data";

const PERSON_REF = { "@id": "https://floriankiem.com/#person" } as const;

describe("structured data", () => {
  const graph = STRUCTURED_DATA["@graph"];
  const person = graph.find((node) => node["@type"] === "Person");
  const website = graph.find((node) => node["@type"] === "WebSite");

  it("declares a schema.org Person with identity fields", () => {
    expect(STRUCTURED_DATA["@context"]).toBe("https://schema.org");
    expect(person).toBeDefined();
    expect(person?.name).toBe("Florian Kiem");
    expect(person?.url).toBe("https://floriankiem.com");
    expect(person?.description).toBeTruthy();
    expect(person && "sameAs" in person && person.sameAs.length).toBeGreaterThanOrEqual(2);
  });

  it("links the WebSite to the Person", () => {
    expect(website).toBeDefined();
    expect(website && "author" in website && website.author).toEqual(PERSON_REF);
  });

  it("serializes to valid JSON", () => {
    expect(() => JSON.parse(structuredDataJson())).not.toThrow();
  });
});

const post = {
  slug: "a-post",
  title: "A post",
  description: "What the post is about.",
  date: "2026-07-11",
};
const livePost = { slug: "runs", title: "Runs", description: "A live log.", date: "" };

const nodeOfType = (graph: { "@type": string }[], type: string) =>
  graph.find((node) => node["@type"] === type);

describe("writing post structured data", () => {
  const data = writingPostStructuredData(post, "https://floriankiem.com/api/og?writing=1");
  const article = nodeOfType(data["@graph"], "BlogPosting") as Record<string, unknown> | undefined;

  it("describes the post as a dated, attributed BlogPosting", () => {
    expect(data["@context"]).toBe("https://schema.org");
    expect(article).toBeDefined();
    expect(article?.headline).toBe("A post");
    expect(article?.description).toBe("What the post is about.");
    expect(article?.datePublished).toBe("2026-07-11");
    expect(article?.author).toEqual(PERSON_REF);
    expect(article?.publisher).toEqual(PERSON_REF);
    expect(article?.image).toBeTruthy();
  });

  it("anchors the article to its canonical URL", () => {
    const url = "https://floriankiem.com/writing/a-post";
    expect(article?.["@id"]).toBe(`${url}#article`);
    expect(article?.url).toBe(url);
    expect(article?.mainEntityOfPage).toEqual({ "@type": "WebPage", "@id": url });
    expect(article?.isPartOf).toEqual({ "@id": "https://floriankiem.com/writing#blog" });
  });

  it("trails Home › Writing › post in the breadcrumbs", () => {
    const crumbs = nodeOfType(data["@graph"], "BreadcrumbList") as
      | { itemListElement: { position: number; name: string; item: string }[] }
      | undefined;
    expect(crumbs?.itemListElement.map((c) => [c.position, c.name, c.item])).toEqual([
      [1, "Home", "https://floriankiem.com"],
      [2, "Writing", "https://floriankiem.com/writing"],
      [3, "A post", "https://floriankiem.com/writing/a-post"],
    ]);
  });

  it("falls back to WebPage for a post with no publish date", () => {
    const data = writingPostStructuredData(livePost, "https://floriankiem.com/api/og?writing=1");
    const node = data["@graph"][0] as Record<string, unknown>;
    expect(node["@type"]).toBe("WebPage");
    expect(node.datePublished).toBeUndefined();
  });
});

describe("writing index structured data", () => {
  const data = writingIndexStructuredData([post, livePost], "Thoughts and ideas.");
  const blog = nodeOfType(data["@graph"], "Blog") as Record<string, unknown> | undefined;
  const list = nodeOfType(data["@graph"], "ItemList") as
    | { numberOfItems: number; itemListElement: { position: number; name: string; url: string }[] }
    | undefined;

  it("describes the blog and attributes it to the Person", () => {
    expect(blog?.["@id"]).toBe("https://floriankiem.com/writing#blog");
    expect(blog?.description).toBe("Thoughts and ideas.");
    expect(blog?.author).toEqual(PERSON_REF);
    expect(blog?.mainEntity).toEqual({ "@id": "https://floriankiem.com/writing#posts" });
  });

  it("lists every post in order, live ones included", () => {
    expect(list?.numberOfItems).toBe(2);
    expect(list?.itemListElement.map((entry) => [entry.position, entry.url])).toEqual([
      [1, "https://floriankiem.com/writing/a-post"],
      [2, "https://floriankiem.com/writing/runs"],
    ]);
  });

  it("serializes to valid JSON", () => {
    expect(() => JSON.parse(JSON.stringify(data))).not.toThrow();
  });
});
