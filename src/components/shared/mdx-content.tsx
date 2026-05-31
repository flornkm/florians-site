import { proseVariants } from "@/lib/prose-variants";
import { cn } from "@/lib/utils";
import { MDXProvider } from "@mdx-js/react";
import { ComponentType, ReactNode, useMemo, useState } from "react";
import { thumbhashToDataURL } from "@/lib/thumbhash";
import { videoManifest } from "@/videoMap.gen";
import { ModelViewer } from "../3d/model-viewer";
import { Image } from "./image";
import { SmartVideo } from "./smart-video";

// Slug must match the IDs the table of contents links to.
function generateHeadingId(children: ReactNode): string {
  const text = extractTextFromChildren(children);
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractTextFromChildren(children: ReactNode): string {
  if (typeof children === "string") {
    return children;
  }
  if (typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join("");
  }
  if (children && typeof children === "object" && "props" in children) {
    return extractTextFromChildren(
      (children as { props: { children?: ReactNode } }).props.children,
    );
  }
  return "";
}

function H1({ children, ...props }: { children?: ReactNode }) {
  const id = generateHeadingId(children);
  return (
    <h1 id={id} {...props}>
      {children}
    </h1>
  );
}

function H2({ children, ...props }: { children?: ReactNode }) {
  const id = generateHeadingId(children);
  return (
    <h2 id={id} {...props}>
      {children}
    </h2>
  );
}

function H3({ children, ...props }: { children?: ReactNode }) {
  const id = generateHeadingId(children);
  return (
    <h3 id={id} {...props}>
      {children}
    </h3>
  );
}

function H4({ children, ...props }: { children?: ReactNode }) {
  const id = generateHeadingId(children);
  return (
    <h4 id={id} {...props}>
      {children}
    </h4>
  );
}

function H5({ children, ...props }: { children?: ReactNode }) {
  const id = generateHeadingId(children);
  return (
    <h5 id={id} {...props}>
      {children}
    </h5>
  );
}

function H6({ children, ...props }: { children?: ReactNode }) {
  const id = generateHeadingId(children);
  return (
    <h6 id={id} {...props}>
      {children}
    </h6>
  );
}

export function Video({
  src,
  webm,
  mp4,
  className,
  autoPlay = true,
  muted = true,
  loop = true,
  playsInline = true,
  controls,
  poster,
}: {
  src?: string;
  webm?: string;
  mp4?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  controls?: boolean;
  poster?: string;
}) {
  const [ready, setReady] = useState(false);
  const lookupKey = webm ?? mp4 ?? src;
  const entry = lookupKey ? videoManifest[lookupKey] : undefined;
  const placeholder = useMemo(() => thumbhashToDataURL(entry?.thumbhash), [entry?.thumbhash]);

  return (
    <div className="not-prose my-8">
      <div className="rounded-sm bg-secondary p-4 md:p-12">
        <div
          className="relative overflow-hidden w-full rounded-sm outline -outline-offset-1 outline-black/5 dark:outline-white/15"
          style={entry ? { aspectRatio: `${entry.width} / ${entry.height}` } : undefined}
          data-ready={ready ? "true" : "false"}
        >
          {placeholder && (
            <img
              src={placeholder}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover scale-110"
              style={{
                filter: "blur(20px)",
                opacity: ready ? 0 : 1,
                transition: "opacity 400ms ease-out",
              }}
            />
          )}
          <SmartVideo
            src={src}
            webm={webm}
            mp4={mp4}
            className={cn(
              entry
                ? "absolute inset-0 h-full w-full transition-opacity duration-300 ease-out"
                : "w-full transition-opacity duration-300 ease-out",
              "rounded-sm outline -outline-offset-1 outline-black/5 dark:outline-white/15",
              entry && !ready ? "opacity-0" : "opacity-100",
              className,
            )}
            autoPlay={autoPlay}
            muted={muted}
            loop={loop}
            playsInline={playsInline}
            controls={controls}
            poster={poster}
            onCanPlay={() => setReady(true)}
            onLoadedData={() => setReady(true)}
          />
        </div>
      </div>
    </div>
  );
}

export function Model({
  src,
  height = 400,
  className,
  autoRotate = true,
  enableZoom = true,
  enablePan = true,
  metalType = "titanium",
}: {
  src: string;
  height?: number;
  className?: string;
  autoRotate?: boolean;
  enableZoom?: boolean;
  enablePan?: boolean;
  metalType?: "steel" | "aluminum" | "copper" | "gold" | "chrome" | "titanium";
}) {
  return (
    <div className="my-8">
      <ModelViewer
        src={src}
        height={height}
        className={cn("w-full", className)}
        autoRotate={autoRotate}
        enableZoom={enableZoom}
        enablePan={enablePan}
        metalType={metalType}
      />
    </div>
  );
}

function Img({ src, alt, className }: { src?: string; alt?: string; className?: string }) {
  // SVGs render borderless on a panel; photos keep the framed look.
  const isDiagram = (src ?? "").toLowerCase().endsWith(".svg");
  return (
    <figure className={cn("not-prose my-8 first:mt-0 last:mb-0", isDiagram && "max-w-[640px]")}>
      <div className={cn(isDiagram ? "figure-dots p-4 md:p-8" : "rounded-lg bg-secondary p-4 md:p-12")}>
        <Image
          src={src ?? ""}
          alt={alt ?? ""}
          objectFit="contain"
          className={cn(
            "h-auto w-full",
            !isDiagram && "rounded-sm outline -outline-offset-1 outline-black/5 dark:outline-white/15",
            className,
          )}
        />
      </div>
      {isDiagram && alt && (
        <figcaption className="mx-auto mt-3 max-w-[460px] font-serif text-[11px] font-normal italic text-tertiary dark:text-secondary">
          {alt}
        </figcaption>
      )}
    </figure>
  );
}

export function MobileImages({ images }: { images: { src: string; alt: string }[] }) {
  return (
    <div className="not-prose my-8">
      <div className="flex gap-3 rounded-lg bg-secondary p-2 py-4 md:py-12 md:p-10">
        {images.map((img) => (
          <div key={img.src} className="flex-1 min-w-0 px-2 @container">
            <Image
              src={img.src}
              alt={img.alt}
              objectFit="contain"
              className="w-full h-auto rounded-[16cqi] outline -outline-offset-1 outline-black/5 dark:outline-white/15"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export const mdxComponents = {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
  img: Img,
  Image,
  Video,
  Model,
  ModelViewer,
  SmartVideo,
  MobileImages,
};

// import.meta.glob must be at module level.
const workModules = import.meta.glob("/src/work/*/article.mdx", { eager: true }) as Record<
  string,
  { default: ComponentType }
>;

const writingModules = import.meta.glob("/src/writing/*/article.mdx", { eager: true }) as Record<
  string,
  { default: ComponentType }
>;

const moduleMap = {
  work: workModules,
  writing: writingModules,
} as const;

export function useMdxContent(category: "work" | "writing", slug: string, className?: string) {
  const modulePath = `/src/${category}/${slug}/article.mdx`;
  const MDXContent = moduleMap[category][modulePath]?.default;

  if (!MDXContent) return null;

  return (
    <article className={cn("w-full", proseVariants({ variant: "default" }), className)}>
      <MDXProvider components={mdxComponents}>
        <MDXContent />
      </MDXProvider>
    </article>
  );
}
