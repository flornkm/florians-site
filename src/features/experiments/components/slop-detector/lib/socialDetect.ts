// Special-case detection for social posts (Twitter/X tweets, LinkedIn posts)
// and video elements. Mostly DOM-aware extraction so we score the right thing
// rather than the surrounding chrome (author handles, like counts, timestamps).

import { scoreImage, type ImageScore } from "./imageDetect"
import { scoreText, type TextScore } from "./textHeuristic"

const onTwitter = () => /(?:^|\.)(?:twitter|x)\.com$/.test(location.hostname)
const onLinkedIn = () => /(?:^|\.)linkedin\.com$/.test(location.hostname)

// -----------------------------------------------------------------------------
// Twitter / X
// -----------------------------------------------------------------------------

/** Walk up the DOM looking for a tweet article container. */
function findTweetContainer(el: Element): Element | null {
  let cur: Element | null = el
  while (cur && cur !== document.body) {
    if (cur.matches('article[data-testid="tweet"]')) return cur
    if (
      cur.tagName === "ARTICLE" &&
      cur.getAttribute("role") === "article" &&
      cur.querySelector('[data-testid="tweetText"]')
    )
      return cur
    cur = cur.parentElement
  }
  return null
}

export function isTwitterTweet(el: Element): boolean {
  if (!onTwitter()) return false
  return findTweetContainer(el) !== null
}

// -----------------------------------------------------------------------------
// LinkedIn
// -----------------------------------------------------------------------------

/** Walk up to a LinkedIn feed post container. */
function findLinkedInPost(el: Element): Element | null {
  let cur: Element | null = el
  while (cur && cur !== document.body) {
    const urn = cur.getAttribute("data-urn") || ""
    if (
      urn.includes("urn:li:activity:") ||
      urn.includes("urn:li:share:") ||
      urn.includes("urn:li:ugcPost:")
    )
      return cur
    if (
      cur.classList.contains("feed-shared-update-v2") ||
      cur.classList.contains("occludable-update")
    )
      return cur
    cur = cur.parentElement
  }
  return null
}

/** Pull the post commentary text from a LinkedIn post container. */
function extractLinkedInText(container: Element): string {
  const selectors = [
    '[data-test-id*="commentary"]',
    ".feed-shared-inline-show-more-text",
    ".feed-shared-update-v2__commentary",
    ".update-components-text",
    ".feed-shared-text"
  ]
  for (const sel of selectors) {
    const el = container.querySelector(sel)
    const text = el?.textContent?.trim() ?? ""
    if (text.length >= 20) return text
  }
  // Fallback: largest single text-bearing element inside the post.
  let best = ""
  for (const el of Array.from(container.querySelectorAll("p, span, div"))) {
    if (el.querySelector("img,video,svg,picture")) continue
    const t = (el.textContent || "").trim()
    if (t.length > best.length) best = t
  }
  return best.length >= 20 ? best : ""
}

// -----------------------------------------------------------------------------
// Combined: when an image is hovered inside a social post, fold the post text
// into the rating. Simple "max" merge — most reliable, no false positives from
// the URL heuristic blocking a clearly-AI caption (or vice versa).
// -----------------------------------------------------------------------------

/** Get post commentary text near `el`, on supported social hosts. */
export function findSocialPostText(el: Element): string {
  if (onTwitter()) {
    const tweet = findTweetContainer(el)
    if (tweet) {
      const t = tweet.querySelector('[data-testid="tweetText"]')
      return t?.textContent?.trim() ?? ""
    }
  }
  if (onLinkedIn()) {
    const post = findLinkedInPost(el)
    if (post) return extractLinkedInText(post)
  }
  return ""
}

/** Image score combined with the surrounding social post's text score. */
export async function scoreSocialImage(
  src: string,
  postText: string
): Promise<ImageScore> {
  const img = await scoreImage(src)
  if (!postText) return img
  const text = scoreText(postText)
  return {
    rating: Math.max(img.rating, text.rating),
    signals: [...img.signals, ...text.signals.map((s) => `post: ${s}`)]
  }
}

export function scoreTwitterTweet(el: Element): TextScore | null {
  const container = findTweetContainer(el)
  if (!container) return null
  const tweetTextEl = container.querySelector('[data-testid="tweetText"]')
  const text = tweetTextEl?.textContent?.trim() ?? ""
  if (!text) return null
  const score = scoreText(text)

  // Author bot-like handle bump — many auto-posted accounts end in numerics.
  const handleEl = container.querySelector(
    'a[href*="/status/"][role="link"] [dir="ltr"]'
  )
  const handle = handleEl?.textContent?.trim() ?? ""
  if (/^@[a-z]+\d{4,}$/i.test(handle) || /bot$/i.test(handle)) {
    score.rating = Math.min(1, score.rating + 0.10)
    score.signals.push(`bot-like handle: ${handle}`)
  }

  // Twitter labels generated content as "Created with AI" sometimes.
  const aiBadge = container.querySelector(
    '[data-testid*="aiGenerated"], [aria-label*="generated with AI" i]'
  )
  if (aiBadge) {
    score.rating = 1.0
    score.signals.push("Twitter AI-generated label")
  }

  return score
}

// -----------------------------------------------------------------------------
// Video elements (raw <video>) + IFRAME embeds
// -----------------------------------------------------------------------------

const AI_VIDEO_HOSTS: RegExp[] = [
  /(?:^|\.)runwayml\.com$/i,
  /(?:^|\.)pika\.art$/i,
  /(?:^|\.)lumalabs\.ai$/i,
  /(?:^|\.)haiper\.ai$/i,
  /(?:^|\.)synthesia\.io$/i,
  /(?:^|\.)sora\.com$/i,
  /(?:^|\.)heygen\.com$/i,
  /(?:^|\.)d-id\.com$/i
]

const AI_VIDEO_URL_HINTS: RegExp[] = [
  /\bsora\b/i,
  /\bgen[-_]?2\b/i,
  /\bgen[-_]?3\b/i,
  /\brunway\b/i,
  /\bpika[-_]?labs?\b/i,
  /\bluma[-_]?dream/i,
  /\bai[-_]?(?:video|generated)/i
]

export async function scoreVideoElement(
  el: HTMLVideoElement
): Promise<ImageScore> {
  const signals: string[] = []
  let score = 0

  const candidates = [
    el.currentSrc,
    el.src,
    el.querySelector("source")?.src,
    el.poster
  ].filter(Boolean) as string[]

  for (const url of candidates) {
    let host = ""
    let path = url
    try {
      const u = new URL(url, location.href)
      host = u.hostname
      path = u.pathname + u.search
    } catch {
      // not a URL — fine, fall through
    }

    for (const re of AI_VIDEO_HOSTS) {
      if (re.test(host)) {
        score = Math.max(score, 0.85)
        signals.push(`AI video host: ${host}`)
        break
      }
    }
    for (const re of AI_VIDEO_URL_HINTS) {
      if (re.test(path) || re.test(host)) {
        score = Math.max(score, 0.55)
        signals.push("AI-related video URL")
        break
      }
    }
  }

  // If poster looks AI-generated, fold its image score in.
  if (el.poster) {
    const posterScore = await scoreImage(el.poster)
    score = Math.max(score, posterScore.rating)
    for (const s of posterScore.signals) signals.push(`poster: ${s}`)
  }

  // TODO: read C2PA manifest from the video stream once c2pa-js is wired.
  // TODO: peek the <track kind="metadata"> children if any (rare but exists).

  return { rating: Math.max(0.05, Math.min(1, score)), signals }
}

export function isVideoLike(el: Element): boolean {
  if (el.tagName === "VIDEO") return true
  // YouTube/Vimeo iframe embeds
  if (el.tagName === "IFRAME") {
    const src = (el as HTMLIFrameElement).src || ""
    return /(?:youtube\.com\/embed|player\.vimeo\.com|tiktok\.com\/embed)/i.test(
      src
    )
  }
  return false
}

export async function scoreIframeEmbed(
  el: HTMLIFrameElement
): Promise<ImageScore> {
  const signals: string[] = []
  let score = 0
  const src = el.src || ""

  // We can't read the inside of cross-origin iframes, but the src URL itself
  // is often enough to identify AI-content channels (e.g. someone embeds a
  // known AI-generator share link).
  let host = ""
  try {
    host = new URL(src).hostname
  } catch {
    /* ignore */
  }
  for (const re of AI_VIDEO_HOSTS) {
    if (re.test(host)) {
      score = Math.max(score, 0.85)
      signals.push(`AI video host: ${host}`)
      break
    }
  }
  for (const re of AI_VIDEO_URL_HINTS) {
    if (re.test(src)) {
      score = Math.max(score, 0.55)
      signals.push("AI-related embed URL")
      break
    }
  }

  // Some embeds expose title via the iframe's title attribute.
  const title = el.title || el.getAttribute("aria-label") || ""
  if (title) {
    const t = scoreText(title)
    if (t.rating > score) {
      score = t.rating
      for (const s of t.signals) signals.push(`title: ${s}`)
    }
  }

  return { rating: Math.max(0.05, Math.min(1, score)), signals }
}
