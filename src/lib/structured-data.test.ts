import { describe, expect, it } from "bun:test";
import { STRUCTURED_DATA, structuredDataJson } from "./structured-data";

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
    expect(website && "author" in website && website.author).toEqual({
      "@id": "https://floriankiem.com/#person",
    });
  });

  it("serializes to valid JSON", () => {
    expect(() => JSON.parse(structuredDataJson())).not.toThrow();
  });
});
