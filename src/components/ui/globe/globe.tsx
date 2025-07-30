import { forwardRef, lazy, Suspense, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import type { GlobeMethods, GlobeProps as ReactGlobeProps } from "react-globe.gl";
import "./globe.css";

// dynamic import of globegl for react
const GlobeComponent = lazy(() => import("react-globe.gl").then((module) => ({ default: module.default })));

export type GlobeInstance = GlobeMethods;

interface GlobeProps extends Omit<Partial<ReactGlobeProps>, "width" | "height" | "onGlobeReady"> {
  width: number;
  height: number;
  onGlobeReady?: (globe: GlobeInstance) => void;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  enableZoom?: boolean;
  enablePan?: boolean;
  enableRotate?: boolean;
}

export const Globe = forwardRef<GlobeMethods, GlobeProps>(function Globe(
  {
    width = 400,
    height = 400,
    onGlobeReady,
    autoRotate = true,
    autoRotateSpeed = 1.0,
    enableZoom = false,
    enablePan = false,
    enableRotate = true,
    ...props
  },
  ref,
) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const animationFrameRef = useRef<number | null>(null);

  useImperativeHandle(ref, () => globeRef.current!, []);

  const setupAutoRotation = useCallback(
    (globe: GlobeInstance) => {
      if (!autoRotate || !globe) return;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      try {
        if (globe.controls && typeof globe.controls === "function") {
          const controls = globe.controls();
          if (controls && typeof controls === "object") {
            controls.autoRotate = true;
            controls.autoRotateSpeed = autoRotateSpeed;
            controls.enableZoom = enableZoom;
            controls.enablePan = enablePan;
            controls.enableRotate = enableRotate;
            controls.enabled = true;

            const animate = () => {
              try {
                if (controls && controls.update) {
                  controls.update();
                  animationFrameRef.current = requestAnimationFrame(animate);
                }
              } catch (error) {
                console.warn("Controls animation failed:", error);
              }
            };
            animate();
            return;
          }
        }
      } catch (error) {
        console.warn("Controls setup failed:", error);
      }

      try {
        if (globe.scene && typeof globe.scene === "function") {
          const scene = globe.scene();
          if (scene && scene.rotation) {
            const rotateGlobe = () => {
              try {
                const currentScene = globe.scene();
                if (currentScene && currentScene.rotation) {
                  currentScene.rotation.y += 0.005 * autoRotateSpeed;
                  animationFrameRef.current = requestAnimationFrame(rotateGlobe);
                }
              } catch (error) {
                console.warn("Manual rotation failed:", error);
              }
            };
            rotateGlobe();
          }
        }
      } catch (error) {
        console.warn("Scene rotation setup failed:", error);
      }
    },
    [autoRotate, autoRotateSpeed, enableZoom, enablePan, enableRotate],
  );

  // poll dynamic import
  useEffect(() => {
    if (!autoRotate) return;

    let attempts = 0;
    const maxAttempts = 30;
    let pollInterval: NodeJS.Timeout;

    const trySetupRotation = () => {
      attempts++;

      if (globeRef.current) {
        const globe = globeRef.current as GlobeInstance;

        const isReady =
          globe &&
          typeof globe === "object" &&
          globe.scene &&
          (globe.controls || (globe.scene() && globe.scene().rotation));

        if (isReady) {
          clearInterval(pollInterval);
          setupAutoRotation(globe);
          return;
        }
      }

      if (attempts >= maxAttempts) {
        clearInterval(pollInterval);
      }
    };

    const initialTimeout = setTimeout(() => {
      trySetupRotation();
      pollInterval = setInterval(trySetupRotation, 100);
    }, 100);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(pollInterval);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [autoRotate, setupAutoRotation]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleGlobeReady = () => {
    if (globeRef.current && onGlobeReady) {
      onGlobeReady(globeRef.current as GlobeInstance);
    }
  };

  return (
    <div className="w-full flex items-center justify-center">
      <Suspense>
        <div className="cursor-grab active:cursor-grabbing">
          <GlobeComponent
            ref={globeRef}
            width={width}
            height={height}
            backgroundColor="rgba(0,0,0,0)"
            onGlobeReady={handleGlobeReady}
            {...props}
          />
        </div>
      </Suspense>
    </div>
  );
});
