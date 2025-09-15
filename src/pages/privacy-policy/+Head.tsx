// Page-scoped head tags for /privacy-policy
// Flags the page as noindex for crawlers
export function Head() {
  return <meta name="robots" content="noindex, nofollow" />;
}
