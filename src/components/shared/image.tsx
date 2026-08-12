import {
  type CSSProperties,
  type ImgHTMLAttributes,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { imageManifest } from "@/imageMap.gen";
import { buildSrcSet, MAX_SRCSET_WIDTH, renditionUrl } from "@/lib/rendition";
import { thumbhashToDataURL } from "@/lib/thumbhash";
import { cn } from "@/lib/utils";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const loadedSrcs = new Set<string>();

type ObjectFit = "cover" | "contain" | "fill" | "none" | "scale-down";

export interface ImageProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "width" | "height" | "placeholder"
> {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  width?: number;
  height?: number;
  objectFit?: ObjectFit;
  priority?: boolean;
  style?: CSSProperties;
  imgStyle?: CSSProperties;
  /** Matches the layout so the browser picks the right rendition; defaults to 100vw. */
  sizes?: string;
}

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
  sizes,
  srcSet: _ignoredSrcSet,
  onLoad,
  ...rest
}: ImageProps) {
  const entry = imageManifest[src];
  const imgRef = useRef<HTMLImageElement>(null);
  const wasPreloaded = loadedSrcs.has(src);
  const [loaded, setLoaded] = useState(wasPreloaded);
  const skipFadeRef = useRef(wasPreloaded);
  // Cutouts get no blur-up: their thumbhash is a solid blob, so it shows through the transparent
  // areas as a stray glow over the page behind — worse than the plain fade-in it replaces.
  const placeholder = useMemo(
    () => (entry?.transparent ? null : thumbhashToDataURL(entry?.thumbhash)),
    [entry?.thumbhash, entry?.transparent],
  );

  useIsomorphicLayoutEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      skipFadeRef.current = true;
      loadedSrcs.add(src);
      if (!loaded) setLoaded(true);
    }
  }, [src, loaded]);

  const markLoaded = () => {
    loadedSrcs.add(src);
    setLoaded(true);
  };

  const fadeTransition = skipFadeRef.current ? undefined : "opacity 400ms ease-out";

  const w = width ?? entry?.width;
  const h = height ?? entry?.height;
  const hasDims = typeof w === "number" && typeof h === "number";

  // Serve the pre-rendered display-sized renditions when they exist. When the source is smaller than the next
  // rendition tier, only a downscaled rendition (often 640) gets generated — so append the original at its true
  // width as the top candidate, letting retina/large slots pick full resolution instead of upscaling a 640.
  const renditions = entry?.widths;
  const topRendition = renditions?.length ? renditions[renditions.length - 1] : 0;
  const useOriginal =
    !!renditions?.length && !!entry && entry.width > topRendition && entry.width <= MAX_SRCSET_WIDTH;
  const srcSet = renditions?.length
    ? useOriginal
      ? `${buildSrcSet(src, renditions)}, ${src} ${entry?.width}w`
      : buildSrcSet(src, renditions)
    : undefined;
  const imgSrc = !renditions?.length || useOriginal ? src : renditionUrl(src, topRendition);
  const imgSizes = srcSet ? (sizes ?? "100vw") : undefined;

  const effectiveLoading = loading ?? (priority ? "eager" : "lazy");
  const effectiveDecoding = decoding ?? "async";
  const effectiveFetchPriority = fetchPriority ?? (priority ? "high" : "auto");

  if (!hasDims) {
    return (
      <img
        src={imgSrc}
        srcSet={srcSet}
        sizes={imgSizes}
        alt={alt}
        className={cn(className, imgClassName)}
        style={{ ...style, ...imgStyle }}
        loading={effectiveLoading}
        decoding={effectiveDecoding}
        fetchPriority={effectiveFetchPriority}
        onLoad={(e) => {
          loadedSrcs.add(src);
          onLoad?.(e);
        }}
        {...rest}
      />
    );
  }

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ aspectRatio: `${w} / ${h}`, ...style }}
    >
      {placeholder && (
        <img
          src={placeholder}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 m-0! h-full w-full scale-110"
          style={{
            objectFit,
            filter: "blur(20px)",
            opacity: loaded ? 0 : 1,
            transition: fadeTransition,
          }}
        />
      )}
      <img
        ref={imgRef}
        src={imgSrc}
        srcSet={srcSet}
        sizes={imgSizes}
        alt={alt}
        width={w}
        height={h}
        loading={effectiveLoading}
        decoding={effectiveDecoding}
        fetchPriority={effectiveFetchPriority}
        onLoad={(e) => {
          markLoaded();
          onLoad?.(e);
        }}
        className={cn("absolute inset-0 m-0! h-full w-full", className, imgClassName)}
        style={{
          objectFit,
          opacity: loaded ? 1 : 0,
          transition: fadeTransition,
          ...imgStyle,
        }}
        {...rest}
      />
    </div>
  );
}

export default Image;
