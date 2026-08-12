import React from "react";

type SmartVideoProps = Omit<React.VideoHTMLAttributes<HTMLVideoElement>, "children"> & {
  webm?: string;
  mp4?: string;
};

export function SmartVideo({
  webm,
  mp4,
  muted = true,
  loop = true,
  autoPlay = true,
  playsInline = true,
  preload = "metadata",
  ...videoProps
}: SmartVideoProps) {
  // Render <source> children in the SSR HTML so the browser starts loading at
  // parse time instead of waiting for hydration. The browser skips any source
  // whose `type` it can't decode, so listing webm first then mp4 is correct for
  // every engine — Chrome/Firefox/Android pick webm, Safari/iOS fall through to
  // the mp4. The mp4 is H.264, so it must NOT be advertised as hvc1/HEVC or
  // non-HEVC browsers drop the source and the video renders empty.
  return (
    <video
      {...videoProps}
      muted={muted}
      loop={loop}
      autoPlay={autoPlay}
      playsInline={playsInline}
      preload={preload}
    >
      {webm ? <source src={webm} type="video/webm" /> : null}
      {mp4 ? <source src={mp4} type="video/mp4" /> : null}
    </video>
  );
}
