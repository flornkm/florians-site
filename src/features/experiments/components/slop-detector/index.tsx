import { useEffect, useRef, useState } from "react";
import { ContainerContext } from "./lib/container";
import { Scene } from "./Scene";

export function SlopDetector() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setContainer(containerRef.current);
  }, []);

  return (
    <ContainerContext.Provider value={container}>
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-hidden bg-primary text-primary select-none"
        style={{ touchAction: "none" }}
      >
        <div className="absolute inset-0 z-[10] pointer-events-none">
          <Scene />
        </div>
      </div>
    </ContainerContext.Provider>
  );
}
