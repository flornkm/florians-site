import { useEffect, useRef, useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { TimelineItem } from "./types";

export default function Page() {
  const pageContext = usePageContext();
  const [activeIndex, setActiveIndex] = useState(0);

  const items = pageContext.data as TimelineItem[];

  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    observer.current = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setActiveIndex(index);
        }
      });
    });

    return () => observer.current?.disconnect();
  }, [items.length]);

  return (
    <div className="w-full px-4">
      <div className="w-full max-w-5xl mx-auto mb-40">
        <h1 className="text-lg font-semibold text-center mb-6">What has happened?</h1>
        <div
          style={{
            height: `${items.length * 100}vh`,
          }}
          ref={observer}
          className="w-full flex flex-col gap-4 relative"
        >
          <div className="sticky top-40 flex flex-col items-center gap-4 h-dvh">
            {items.map((item, index) => (
              <div
                style={{
                  zIndex: items.length - index,
                  top: `-${index * 80}px`,
                  scrollSnapAlign: "end",
                  transform: `scale(${100 - index * 10}%)`,
                }}
                key={item.slug}
                className="w-full absolute h-[calc(100vh-16rem)] bg-white rounded-2xl p-8 border border-neutral-200"
              >
                <h2 className="text-lg font-semibold">{item.title}</h2>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
