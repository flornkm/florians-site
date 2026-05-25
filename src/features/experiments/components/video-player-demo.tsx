import Toggle from "@/components/ui/toggle";
import { VideoPlayer } from "@/components/ui/video-player";
import { useState } from "react";

const SRC = "/videos/stock-footage.mp4";

export const VideoPlayerExperiment = () => {
  const [custom, setCustom] = useState(true);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md px-6 py-6">
      <div className="w-full overflow-hidden rounded-md">
        {custom ? (
          <VideoPlayer src={SRC} />
        ) : (
          <video src={SRC} controls playsInline className="aspect-video w-full bg-black" />
        )}
      </div>

      <Toggle checked={custom} onCheckedChange={setCustom} className="select-none">
        <span className="text-xs text-secondary">
          {custom ? "Custom media player" : "Native HTML player"}
        </span>
      </Toggle>
    </div>
  );
};
