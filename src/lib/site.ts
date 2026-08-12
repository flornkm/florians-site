export const SITE_URL = "https://floriankiem.com";

// X's card crawler doesn't resolve relative URLs in og:image/twitter:image,
// so social images must be absolute or the large preview card silently degrades.
export const absoluteUrl = (path: string) => `${SITE_URL}${path}`;
