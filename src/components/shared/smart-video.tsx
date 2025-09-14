import React, { useEffect, useMemo, useState } from "react";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isSafari = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent;
    // Safari on iOS/macOS: contains "Safari" but not Chrome/Edge/Firefox iOS tokens
    const isSafariLike = /Safari/i.test(ua) && !/Chrome|CriOS|Edg|EdgiOS|FxiOS|OPR|SamsungBrowser/i.test(ua);
    return isSafariLike;
  }, []);

  // Until mounted, avoid attaching sources to prevent the browser from preloading the wrong one during SSR
  if (!mounted) {
    return (
      <video {...videoProps} muted={muted} loop={loop} autoPlay={autoPlay} playsInline={playsInline} preload="none" />
    );
  }

  // If no dual sources provided, render plain <video> with given src (backward compatible)
  if (!webm && !mp4) {
    return (
      <video
        {...videoProps}
        muted={muted}
        loop={loop}
        autoPlay={autoPlay}
        playsInline={playsInline}
        preload={preload}
      />
    );
  }

  // Dual-source mode with Safari-aware ordering
  return (
    <video {...videoProps} muted={muted} loop={loop} autoPlay={autoPlay} playsInline={playsInline} preload={preload}>
      {isSafari ? (
        mp4 ? (
          <source src={mp4} type='video/mp4; codecs="hvc1"' />
        ) : null
      ) : (
        <>
          {webm ? <source src={webm} type="video/webm" /> : null}
          {mp4 ? <source src={mp4} type='video/mp4; codecs="hvc1"' /> : null}
        </>
      )}
    </video>
  );
}
