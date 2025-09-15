// Page-scoped head tags for /imprint
// Flags the page as noindex for crawlers
export function Head() {
  return <meta name="robots" content="noindex, nofollow" />;
}
