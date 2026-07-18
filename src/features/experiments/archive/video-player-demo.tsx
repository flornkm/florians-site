import Toggle from "@/components/ui/toggle";
import { VideoPlayer } from "@/components/ui/video-player";
import { useState } from "react";

const SRC = "/videos/stock-footage.mp4";

export const VideoPlayerExperiment = () => {
  const [custom, setCustom] = useState(true);

  return (
    <div className="relative flex h-full w-full max-w-md flex-col items-center justify-center px-6 py-6">
      <div className="w-full overflow-hidden rounded-md">
        {custom ? (
          <VideoPlayer src={SRC} />
        ) : (
          <video src={SRC} controls playsInline className="aspect-video w-full bg-black" />
        )}
      </div>

      <label className="absolute bottom-6 left-1/2 inline-flex -translate-x-1/2 select-none items-center gap-3 text-xs text-tertiary">
        <Toggle checked={custom} onCheckedChange={setCustom} />
        <span className="whitespace-nowrap">
          {custom ? "Custom media player" : "Native HTML player"}
        </span>
      </label>
    </div>
  );
};
