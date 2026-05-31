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
    // Safari UA contains "Safari" but not the Chrome/Edge/Firefox-iOS tokens.
    const isSafariLike =
      /Safari/i.test(ua) && !/Chrome|CriOS|Edg|EdgiOS|FxiOS|OPR|SamsungBrowser/i.test(ua);
    return isSafariLike;
  }, []);

  // Until mounted, attach no sources so the browser doesn't preload the wrong one during SSR.
  if (!mounted) {
    return (
      <video
        {...videoProps}
        muted={muted}
        loop={loop}
        autoPlay={autoPlay}
        playsInline={playsInline}
        preload="none"
      />
    );
  }

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

  return (
    <video
      {...videoProps}
      muted={muted}
      loop={loop}
      autoPlay={autoPlay}
      playsInline={playsInline}
      preload={preload}
    >
      {isSafari ? (
        // Safari prefers MP4 (hvc1), falling back to WebM.
        mp4 ? (
          <source src={mp4} type='video/mp4; codecs="hvc1"' />
        ) : webm ? (
          <source src={webm} type="video/webm" />
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
