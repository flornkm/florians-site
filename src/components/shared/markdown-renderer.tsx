import { proseVariants } from "@/lib/prose-variants";
import { cn } from "@/lib/utils";
import React from "react";
import { ModelViewer } from "../3d/model-viewer";
import { VideoPlayer } from "../video/video-player";

interface MarkdownRendererProps {
  html: string;
  className?: string;
}

function parseHtmlToJsx(html: string): React.ReactNode {
  const modelRegex = /<div class="model-viewer" data-src="([^"]+)"><\/div>/g;
  const videoRegex = /<div class="video-player" data-src="([^"]+)" data-options="([^"]*)"><\/div>/g;

  // Collect all matches with their positions
  const matches: Array<{
    type: "model" | "video";
    index: number;
    length: number;
    src: string;
    options?: Record<string, string | boolean>;
  }> = [];

  let match;

  // Find all model matches
  while ((match = modelRegex.exec(html)) !== null) {
    matches.push({
      type: "model",
      index: match.index,
      length: match[0].length,
      src: match[1],
    });
  }

  // Find all video matches
  while ((match = videoRegex.exec(html)) !== null) {
    let options = {};
    try {
      options = JSON.parse(match[2].replace(/&quot;/g, '"'));
    } catch {
      // If parsing fails, use empty options
    }

    matches.push({
      type: "video",
      index: match.index,
      length: match[0].length,
      src: match[1],
      options,
    });
  }

  // Sort matches by position
  matches.sort((a, b) => a.index - b.index);

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  matches.forEach((matchItem) => {
    // Add HTML before the match
    if (matchItem.index > lastIndex) {
      const htmlBefore = html.slice(lastIndex, matchItem.index);
      if (htmlBefore.trim()) {
        parts.push(<div key={`html-${key++}`} dangerouslySetInnerHTML={{ __html: htmlBefore }} />);
      }
    }

    // Add the component
    if (matchItem.type === "model") {
      parts.push(
        <div key={`model-${key++}`} className="my-6">
          <ModelViewer
            src={matchItem.src}
            height={400}
            className="w-full"
            autoRotate={true}
            enableZoom={true}
            enablePan={true}
          />
        </div>,
      );
    } else if (matchItem.type === "video") {
      const options = matchItem.options || {};
      // Support both className: and class="" syntaxes
      const customClassName = (options.className as string) || "";

      // Check if custom className contains width classes (w-*, max-w-*, min-w-)
      const hasWidthClass = /\b(w-\w+|max-w-\w+|min-w-\w+)\b/.test(customClassName);
      const defaultWidth = hasWidthClass ? "" : "w-full";
      const finalClassName = `${defaultWidth} ${customClassName}`.trim();

      parts.push(
        <div key={`video-${key++}`} className="my-6">
          <VideoPlayer
            src={matchItem.src}
            className={finalClassName}
            width={typeof options.width === "string" ? options.width : "100%"}
            height={typeof options.height === "string" ? options.height : "auto"}
            autoPlay={options.autoplay === true}
            muted={options.muted !== false} // Default to muted
            loop={options.loop === true}
            playsInline={options.playsInline !== false} // Default to playsInline
            controls={options.controls === true} // Default to no controls
            poster={typeof options.poster === "string" ? options.poster : undefined}
          />
        </div>,
      );
    }

    lastIndex = matchItem.index + matchItem.length;
  });

  // Add remaining HTML
  if (lastIndex < html.length) {
    const htmlAfter = html.slice(lastIndex);
    if (htmlAfter.trim()) {
      parts.push(<div key={`html-${key++}`} dangerouslySetInnerHTML={{ __html: htmlAfter }} />);
    }
  }

  if (parts.length === 0) {
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  }

  return <>{parts}</>;
}

export function MarkdownRenderer({ html, className = "" }: MarkdownRendererProps) {
  const content = parseHtmlToJsx(html);

  return <article className={cn(proseVariants({ variant: "default" }), className)}>{content}</article>;
}

export default MarkdownRenderer;
