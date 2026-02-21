import { proseVariants } from "@/lib/prose-variants";
import { cn } from "@/lib/utils";
import { MDXProvider } from "@mdx-js/react";
import { ComponentType, ReactNode } from "react";
import { ModelViewer } from "../3d/model-viewer";
import { BiomarkerShowcase } from "../superpower/biomarker-showcase";
import { SVGShowcase } from "../superpower/svg-showcase";
import { SmartVideo } from "./smart-video";

// Generate a slug ID from heading text (matches extractHeadings in mdx.ts)
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
    return extractTextFromChildren((children as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

// Heading components with auto-generated IDs
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
  return (
    <div className="not-prose my-8">
      <div className="flex items-center justify-center rounded-sm bg-secondary p-8 md:p-12">
        <SmartVideo
          src={src}
          webm={webm}
          mp4={mp4}
          className={cn("w-full rounded-sm outline -outline-offset-1 outline-white/15", className)}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          playsInline={playsInline}
          controls={controls}
          poster={poster}
        />
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
  return (
    <div className="not-prose my-8 first:mt-0 last:mb-0">
      <div className="flex items-center justify-center rounded-lg bg-secondary p-8 md:p-12">
        <img
          src={src}
          alt={alt}
          className={cn(
            "h-full w-full rounded-sm object-contain outline -outline-offset-1 outline-white/15",
            className,
          )}
        />
      </div>
    </div>
  );
}

export function MobileImages({ images }: { images: { src: string; alt: string }[] }) {
  return (
    <div className="not-prose my-8">
      <div className="flex gap-3 rounded-lg bg-secondary p-4 md:p-8">
        {images.map((img) => (
          <div key={img.src} className="flex-1 min-w-0 px-4">
            <img
              src={img.src}
              alt={img.alt}
              className="w-full h-auto rounded-sm object-contain outline -outline-offset-1 outline-white/15"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export const mdxComponents = {
  // Heading components with auto-generated IDs
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
  img: Img,
  // Custom components
  Video,
  Model,
  ModelViewer,
  SmartVideo,
  BiomarkerShowcase,
  SVGShowcase,
  MobileImages,
};

// Pre-loaded MDX module maps (import.meta.glob must be at module level)
const workModules = import.meta.glob("/content/work/*.mdx", { eager: true }) as Record<
  string,
  { default: ComponentType }
>;

const collectionModules = import.meta.glob("/content/collection/*.mdx", { eager: true }) as Record<
  string,
  { default: ComponentType }
>;

const moduleMap = {
  work: workModules,
  collection: collectionModules,
} as const;

export function useMdxContent(category: "work" | "collection", slug: string, className?: string) {
  const modulePath = `/content/${category}/${slug}.mdx`;
  const MDXContent = moduleMap[category][modulePath]?.default;

  if (!MDXContent) return null;

  return (
    <article className={cn(proseVariants({ variant: "default" }), className)}>
      <MDXProvider components={mdxComponents}>
        <MDXContent />
      </MDXProvider>
    </article>
  );
}
