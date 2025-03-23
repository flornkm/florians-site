import { useRive } from "@rive-app/react-canvas";
import { useEffect, useRef } from "react";
import { cn } from "../../lib/utils";

interface RiveResponsiveProps {
  src: string;
  artboardDesktop: string;
  artboardMobile: string;
  className?: string;
  mobileClassName?: string;
  autoplay?: boolean;
  observeScroll?: boolean;
  threshold?: number;
  rootMargin?: string;
}

export function RiveResponsive({
  src,
  artboardDesktop,
  artboardMobile,
  className = "w-full h-40",
  mobileClassName = "w-48 h-96",
  autoplay = false,
  observeScroll = true,
  threshold = 0.3,
  rootMargin = "0px 0px -50% 0px",
}: RiveResponsiveProps) {
  const { rive: riveDesktop, RiveComponent: RiveDesktop } = useRive({
    src,
    autoplay,
    artboard: artboardDesktop,
  });

  const { rive: riveMobile, RiveComponent: RiveMobile } = useRive({
    src,
    autoplay,
    artboard: artboardMobile,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!observeScroll || !containerRef.current || (!riveDesktop && !riveMobile) || typeof window === "undefined")
      return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (riveDesktop) riveDesktop.play();
            if (riveMobile) riveMobile.play();
          }
        });
      },
      { threshold, rootMargin },
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [riveDesktop, riveMobile, observeScroll, threshold, rootMargin]);

  return (
    <div ref={containerRef}>
      <div className="hidden lg:block">
        <RiveDesktop className={cn(className)} />
      </div>
      <div className="block lg:hidden w-full">
        <RiveMobile className={cn(mobileClassName, className)} />
      </div>
    </div>
  );
}
