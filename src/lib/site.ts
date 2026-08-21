export const SITE_URL = "https://floriankiem.com";

// X's card crawler doesn't resolve relative URLs in og:image/twitter:image,
// so social images must be absolute or the large preview card silently degrades.
export const absoluteUrl = (path: string) => `${SITE_URL}${path}`;

// Agents and search engines use the canonical URL for entity resolution and
// attribution; every page declares its own via head links.
export const canonicalLink = (path: string) => ({
  rel: "canonical",
  href: absoluteUrl(path === "/" ? "" : path.replace(/\/$/, "")),
});
