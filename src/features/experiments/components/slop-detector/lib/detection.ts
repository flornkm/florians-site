import { scoreImage, type ImageScore } from "./imageDetect"
import {
  findSocialPostText,
  isTwitterTweet,
  isVideoLike,
  scoreIframeEmbed,
  scoreSocialImage,
  scoreTwitterTweet,
  scoreVideoElement
} from "./socialDetect"
import { scoreText, type TextScore } from "./textHeuristic"

const IMAGE_TAGS = new Set(["IMG", "PICTURE", "FIGURE"])

export type DetectResult = TextScore | ImageScore

export async function detectAI(el: Element): Promise<DetectResult | null> {
  // 1. Twitter / X tweets — extract clean tweet text + check author/AI labels
  if (isTwitterTweet(el)) {
    return scoreTwitterTweet(el)
  }

  // 2. Videos and known video embeds — URL-host fingerprinting
  if (isVideoLike(el)) {
    if (el.tagName === "VIDEO") {
      return scoreVideoElement(el as HTMLVideoElement)
    }
    if (el.tagName === "IFRAME") {
      return scoreIframeEmbed(el as HTMLIFrameElement)
    }
  }

  // 3. Images — on Twitter/LinkedIn, fold the surrounding post text into the
  //    rating (max merge). Elsewhere, plain URL heuristic.
  if (el.tagName === "IMG") {
    const img = el as HTMLImageElement
    const src = img.currentSrc || img.src
    const postText = findSocialPostText(el)
    return postText ? scoreSocialImage(src, postText) : scoreImage(src)
  }
  if (IMAGE_TAGS.has(el.tagName)) {
    const inner = el.querySelector("img") as HTMLImageElement | null
    const src = inner?.currentSrc || inner?.src || ""
    if (src) {
      const postText = findSocialPostText(el)
      return postText ? scoreSocialImage(src, postText) : scoreImage(src)
    }
    // fall through to text
  }

  // 4. Links — score the visible link text
  if (el.tagName === "A") {
    const text = el.textContent?.trim() ?? ""
    return text ? scoreText(text) : null
  }

  // 5. Default: text content
  const text = el.textContent?.trim() ?? ""
  if (!text) return null
  return scoreText(text)
}
