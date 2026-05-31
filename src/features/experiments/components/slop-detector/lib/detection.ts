import { scoreImage, type ImageScore } from "./imageDetect";
import {
  findSocialPostText,
  isTwitterTweet,
  isVideoLike,
  scoreIframeEmbed,
  scoreSocialImage,
  scoreTwitterTweet,
  scoreVideoElement,
} from "./socialDetect";
import { scoreText, type TextScore } from "./textHeuristic";

const IMAGE_TAGS = new Set(["IMG", "PICTURE", "FIGURE"]);

export type DetectResult = TextScore | ImageScore;

export async function detectAI(el: Element): Promise<DetectResult | null> {
  if (isTwitterTweet(el)) {
    return scoreTwitterTweet(el);
  }

  if (isVideoLike(el)) {
    if (el.tagName === "VIDEO") {
      return scoreVideoElement(el as HTMLVideoElement);
    }
    if (el.tagName === "IFRAME") {
      return scoreIframeEmbed(el as HTMLIFrameElement);
    }
  }

  // On social hosts, fold surrounding post text into the image rating (max merge).
  if (el.tagName === "IMG") {
    const img = el as HTMLImageElement;
    const src = img.currentSrc || img.src;
    const postText = findSocialPostText(el);
    return postText ? scoreSocialImage(src, postText) : scoreImage(src);
  }
  if (IMAGE_TAGS.has(el.tagName)) {
    const inner = el.querySelector("img") as HTMLImageElement | null;
    const src = inner?.currentSrc || inner?.src || "";
    if (src) {
      const postText = findSocialPostText(el);
      return postText ? scoreSocialImage(src, postText) : scoreImage(src);
    }
    // fall through to text
  }

  if (el.tagName === "A") {
    const text = el.textContent?.trim() ?? "";
    return text ? scoreText(text) : null;
  }

  const text = el.textContent?.trim() ?? "";
  if (!text) return null;
  return scoreText(text);
}
