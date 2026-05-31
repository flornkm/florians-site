const AI_GENERATOR_HOSTS: RegExp[] = [
  /(?:^|\.)oaiusercontent\.com$/i,
  /(?:^|\.)oaidalleapiprodscus\.blob\.core\.windows\.net$/i,
  /(?:^|\.)cdn\.openai\.com$/i,
  /(?:^|\.)cdn\.midjourney\.com$/i,
  /(?:^|\.)mj-cdn\./i,
  /(?:^|\.)replicate\.delivery$/i,
  /(?:^|\.)replicate\.com$/i,
  /(?:^|\.)firefly\.adobe\.com$/i,
  /(?:^|\.)cc-api-storage\.adobe\.io$/i,
  /(?:^|\.)leonardo\.ai$/i,
  /(?:^|\.)cdn\.leonardo\.ai$/i,
  /(?:^|\.)runwayml\.com$/i,
  /(?:^|\.)stablediffusionweb\.com$/i,
  /(?:^|\.)civitai\.com$/i,
  /(?:^|\.)image\.civitai\.com$/i,
  /(?:^|\.)ideogram\.ai$/i,
];

const AI_URL_HINTS: RegExp[] = [
  /\bai[-_]?(?:generated|image|art|created)/i,
  /\bdall[-_\s]?e\b/i,
  /\bmidjourney\b/i,
  /\bstable[-_\s]?diffusion\b/i,
  /\bgenerated[-_\s]?by[-_\s]?ai\b/i,
  /\bsdxl\b/i,
  /\bflux[-_\s]?(?:dev|pro|schnell)\b/i,
];

export type ImageScore = {
  rating: number;
  signals: string[];
};

export async function scoreImage(url: string): Promise<ImageScore> {
  const signals: string[] = [];
  let score = 0;
  if (!url) return { rating: 0, signals };

  let host = "";
  let path = url;
  try {
    const u = new URL(url, location.href);
    host = u.hostname;
    path = u.pathname + u.search;
  } catch {
    // Relative or data: URL — leave host empty, path = url
  }

  for (const re of AI_GENERATOR_HOSTS) {
    if (re.test(host)) {
      score = Math.max(score, 0.85);
      signals.push(`known AI host: ${host}`);
      break;
    }
  }

  for (const re of AI_URL_HINTS) {
    if (re.test(path) || re.test(host)) {
      score = Math.max(score, 0.55);
      signals.push("AI-related URL hint");
      break;
    }
  }

  // Floor so verdicts always show a tier color (green for "no AI signal").
  return { rating: Math.max(0.05, Math.min(1, score)), signals };
}
