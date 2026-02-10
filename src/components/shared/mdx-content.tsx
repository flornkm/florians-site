import { cn } from "@/lib/utils";
import { ReactNode } from "react";
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
    <div className="my-6">
      <SmartVideo
        src={src}
        webm={webm}
        mp4={mp4}
        className={cn("w-full", className)}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline={playsInline}
        controls={controls}
        poster={poster}
      />
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
    <div className="my-6">
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

export const mdxComponents = {
  // Heading components with auto-generated IDs
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
  // Custom components
  Video,
  Model,
  ModelViewer,
  SmartVideo,
  BiomarkerShowcase,
  SVGShowcase,
};
