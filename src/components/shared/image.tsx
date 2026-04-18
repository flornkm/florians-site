import { type CSSProperties, type ImgHTMLAttributes, useEffect, useRef, useState } from "react";
import { imageManifest } from "@/imageMap.gen";
import { cn } from "@/lib/utils";

type ObjectFit = "cover" | "contain" | "fill" | "none" | "scale-down";

export interface ImageProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "width" | "height" | "placeholder"
> {
  src: string;
  alt: string;
  /** Wrapper className. Controls size, aspect, rounding, outline. */
  className?: string;
  /** Extra className applied to the inner <img> only. */
  imgClassName?: string;
  /** Override the intrinsic aspect ratio. */
  width?: number;
  height?: number;
  objectFit?: ObjectFit;
  /** If true, loads eagerly with high priority (above-the-fold images). */
  priority?: boolean;
  /** Style for the wrapper. */
  style?: CSSProperties;
  /** Style for the inner <img>. */
  imgStyle?: CSSProperties;
}

/**
 * Shared image component that:
 *  - reserves layout space using intrinsic width/height from the build-time
 *    image manifest (no CLS);
 *  - shows a base64 blur placeholder that fades out once the real image loads;
 *  - lazy-loads by default (opt out via `priority`).
 *
 * SVGs and anything missing from the manifest fall back to a normal lazy <img>.
 */
export function Image({
  src,
  alt,
  className,
  imgClassName,
  width,
  height,
  objectFit = "cover",
  priority = false,
  style,
  imgStyle,
  loading,
  decoding,
  fetchPriority,
  onLoad,
  ...rest
}: ImageProps) {
  const entry = imageManifest[src];
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // If the image was already in cache, React may miss the load event.
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);

  const w = width ?? entry?.width;
  const h = height ?? entry?.height;
  const hasDims = typeof w === "number" && typeof h === "number";

  const effectiveLoading = loading ?? (priority ? "eager" : "lazy");
  const effectiveDecoding = decoding ?? "async";
  const effectiveFetchPriority = fetchPriority ?? (priority ? "high" : "auto");

  // Fallback: no manifest entry and no explicit dims — render a plain img.
  // Still lazy by default so we at least get deferred network work.
  if (!hasDims) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn(className, imgClassName)}
        style={{ ...style, ...imgStyle }}
        loading={effectiveLoading}
        decoding={effectiveDecoding}
        fetchPriority={effectiveFetchPriority}
        onLoad={onLoad}
        {...rest}
      />
    );
  }

  const wrapperStyle: CSSProperties = {
    aspectRatio: `${w} / ${h}`,
    ...style,
  };

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={wrapperStyle}
      data-loaded={loaded ? "true" : "false"}
    >
      {entry?.blurDataURL && !loaded && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 scale-110"
          style={{
            backgroundImage: `url(${entry.blurDataURL})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(20px)",
          }}
        />
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        width={w}
        height={h}
        loading={effectiveLoading}
        decoding={effectiveDecoding}
        fetchPriority={effectiveFetchPriority}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        className={cn(
          "absolute inset-0 h-full w-full transition-opacity duration-300 ease-out",
          loaded ? "opacity-100" : "opacity-0",
          imgClassName,
        )}
        style={{ objectFit, ...imgStyle }}
        {...rest}
      />
    </div>
  );
}

export default Image;
