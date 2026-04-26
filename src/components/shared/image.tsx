import {
  type CSSProperties,
  type ImgHTMLAttributes,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { imageManifest } from "@/imageMap.gen";
import { thumbhashToDataURL } from "@/lib/thumbhash";

type ObjectFit = "cover" | "contain" | "fill" | "none" | "scale-down";

export interface ImageProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "width" | "height" | "placeholder"
> {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  objectFit?: ObjectFit;
  priority?: boolean;
  style?: CSSProperties;
}

export function Image({
  src,
  alt,
  className,
  width,
  height,
  objectFit,
  priority = false,
  style,
  loading,
  decoding,
  fetchPriority,
  onLoad,
  ...rest
}: ImageProps) {
  const entry = imageManifest[src];
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const placeholder = useMemo(() => thumbhashToDataURL(entry?.thumbhash), [entry?.thumbhash]);

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);

  const w = width ?? entry?.width;
  const h = height ?? entry?.height;

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      width={w}
      height={h}
      loading={loading ?? (priority ? "eager" : "lazy")}
      decoding={decoding ?? "async"}
      fetchPriority={fetchPriority ?? (priority ? "high" : "auto")}
      onLoad={(e) => {
        setLoaded(true);
        onLoad?.(e);
      }}
      className={className}
      style={{
        objectFit,
        backgroundImage: placeholder && !loaded ? `url(${placeholder})` : undefined,
        backgroundSize: objectFit === "contain" ? "contain" : "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        ...style,
      }}
      {...rest}
    />
  );
}

export default Image;
