interface VideoPlayerProps {
  src: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  controls?: boolean;
  poster?: string;
}

export function VideoPlayer({
  src,
  width = "100%",
  height = "auto",
  className = "",
  autoPlay = false,
  muted = true,
  loop = false,
  playsInline = true,
  controls = false,
  poster,
}: VideoPlayerProps) {
  // Validate props
  if (!src) {
    return (
      <div className="flex items-center justify-center w-full h-64 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <div className="text-center p-4">
          <p className="text-sm text-red-600 dark:text-red-400">No video source provided</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width, height: height === "auto" ? undefined : height }}>
      <video
        src={src}
        width={typeof width === "number" ? width : undefined}
        height={typeof height === "number" ? height : undefined}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline={playsInline}
        controls={controls}
        poster={poster}
        className={`relative rounded-lg overflow-hidden ${className}`}
        style={{
          width: typeof width === "string" ? width : undefined,
          height: height === "auto" ? "auto" : typeof height === "string" ? height : undefined,
        }}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

export default VideoPlayer;
