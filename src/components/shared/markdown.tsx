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

  const matches: Array<{
    type: "model" | "video";
    index: number;
    length: number;
    src: string;
    options?: Record<string, string | boolean>;
  }> = [];

  let match;

  while ((match = modelRegex.exec(html)) !== null) {
    matches.push({
      type: "model",
      index: match.index,
      length: match[0].length,
      src: match[1],
    });
  }

  while ((match = videoRegex.exec(html)) !== null) {
    let options = {};
    try {
      options = JSON.parse(match[2].replace(/&quot;/g, '"'));
    } catch {
      // parsing fails, use empty options
    }

    matches.push({
      type: "video",
      index: match.index,
      length: match[0].length,
      src: match[1],
      options,
    });
  }

  matches.sort((a, b) => a.index - b.index);

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  matches.forEach((matchItem) => {
    if (matchItem.index > lastIndex) {
      const htmlBefore = html.slice(lastIndex, matchItem.index);
      if (htmlBefore.trim()) {
        parts.push(<div key={`html-${key++}`} dangerouslySetInnerHTML={{ __html: htmlBefore }} />);
      }
    }

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
      const customClassName = (options.className as string) || "";

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

export const Markdown = ({ html, className = "" }: MarkdownRendererProps) => {
  const content = parseHtmlToJsx(html);

  return <article className={cn(proseVariants({ variant: "default" }), className)}>{content}</article>;
};

export default Markdown;
