import { cn } from "@/lib/utils";
import { ModelViewer } from "../3d/model-viewer";
import { BiomarkerShowcase } from "../superpower/biomarker-showcase";
import { SmartVideo } from "./smart-video";

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
  Video,
  Model,
  ModelViewer,
  SmartVideo,
  BiomarkerShowcase,
};
