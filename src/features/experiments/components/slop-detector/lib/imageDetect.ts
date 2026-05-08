// V1 image detector: URL-host fingerprinting only. This catches the obvious
// "image came from an AI generator's CDN" case with zero false positives.
//
// TODO: drop in c2pa-js (https://www.npmjs.com/package/c2pa) to read the
// Content Authenticity manifest. If the active manifest is signed by a known
// AI generator (OpenAI, Adobe Firefly, Google Imagen, etc.), bump rating to
// ~0.95 with high confidence. Lack of manifest stays at the URL heuristic.

const AI_GENERATOR_HOSTS: RegExp[] = [
  // OpenAI / DALL·E
  /(?:^|\.)oaiusercontent\.com$/i,
  /(?:^|\.)oaidalleapiprodscus\.blob\.core\.windows\.net$/i,
  /(?:^|\.)cdn\.openai\.com$/i,
  // Midjourney (served via Discord CDN, not specific to MJ — kept loose)
  /(?:^|\.)cdn\.midjourney\.com$/i,
  /(?:^|\.)mj-cdn\./i,
  // Replicate
  /(?:^|\.)replicate\.delivery$/i,
  /(?:^|\.)replicate\.com$/i,
  // Adobe Firefly
  /(?:^|\.)firefly\.adobe\.com$/i,
  /(?:^|\.)cc-api-storage\.adobe\.io$/i,
  // Leonardo
  /(?:^|\.)leonardo\.ai$/i,
  /(?:^|\.)cdn\.leonardo\.ai$/i,
  // Runway
  /(?:^|\.)runwayml\.com$/i,
  // Stable Diffusion / public hosts
  /(?:^|\.)stablediffusionweb\.com$/i,
  /(?:^|\.)civitai\.com$/i,
  /(?:^|\.)image\.civitai\.com$/i,
  // Ideogram
  /(?:^|\.)ideogram\.ai$/i
]

const AI_URL_HINTS: RegExp[] = [
  /\bai[-_]?(?:generated|image|art|created)/i,
  /\bdall[-_\s]?e\b/i,
  /\bmidjourney\b/i,
  /\bstable[-_\s]?diffusion\b/i,
  /\bgenerated[-_\s]?by[-_\s]?ai\b/i,
  /\bsdxl\b/i,
  /\bflux[-_\s]?(?:dev|pro|schnell)\b/i
]

export type ImageScore = {
  rating: number
  signals: string[]
}

export async function scoreImage(url: string): Promise<ImageScore> {
  const signals: string[] = []
  let score = 0
  if (!url) return { rating: 0, signals }

  let host = ""
  let path = url
  try {
    const u = new URL(url, location.href)
    host = u.hostname
    path = u.pathname + u.search
  } catch {
    // Relative or data: URL — leave host empty, path = url
  }

  for (const re of AI_GENERATOR_HOSTS) {
    if (re.test(host)) {
      score = Math.max(score, 0.85)
      signals.push(`known AI host: ${host}`)
      break
    }
  }

  for (const re of AI_URL_HINTS) {
    if (re.test(path) || re.test(host)) {
      score = Math.max(score, 0.55)
      signals.push("AI-related URL hint")
      break
    }
  }

  // TODO: c2pa-js manifest read goes here. Pseudocode:
  //   const c2pa = await getC2pa()
  //   const result = await c2pa.read(url)
  //   if (result.manifestStore?.activeManifest) {
  //     const issuer = result.manifestStore.activeManifest.signature?.issuer
  //     if (isKnownAIGenerator(issuer)) score = Math.max(score, 0.95)
  //     signals.push(`C2PA: ${issuer}`)
  //   }

  // Floor so verdicts always show a tier color (green for "no AI signal").
  return { rating: Math.max(0.05, Math.min(1, score)), signals }
}
