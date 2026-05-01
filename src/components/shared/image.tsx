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
  onLoad,
  ...rest
}: ImageProps) {
  const entry = imageManifest[src];
  const imgRef = useRef<HTMLImageElement>(null);
  const wasPreloaded = loadedSrcs.has(src);
  const [loaded, setLoaded] = useState(wasPreloaded);
  const skipFadeRef = useRef(wasPreloaded);
  const placeholder = useMemo(() => thumbhashToDataURL(entry?.thumbhash), [entry?.thumbhash]);

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

  const effectiveLoading = loading ?? (priority ? "eager" : "lazy");
  const effectiveDecoding = decoding ?? "async";
  const effectiveFetchPriority = fetchPriority ?? (priority ? "high" : "auto");

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
        src={src}
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
