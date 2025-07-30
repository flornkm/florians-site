import { forwardRef, lazy, Suspense, useEffect, useImperativeHandle, useRef } from "react";
import type { GlobeMethods, GlobeProps as ReactGlobeProps } from "react-globe.gl";

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

// Promise-based globe initialization
function waitForGlobeReady(globe: GlobeInstance): Promise<GlobeInstance> {
  return new Promise((resolve) => {
    const checkReady = () => {
      const isReady = globe && typeof globe === "object" && globe.scene && (globe.controls || globe.scene().rotation);

      if (isReady) {
        resolve(globe);
      } else {
        requestAnimationFrame(checkReady);
      }
    };

    // Start checking immediately
    checkReady();
  });
}

// Auto-rotation setup with promise
async function setupAutoRotation(
  globe: GlobeInstance,
  options: {
    autoRotate: boolean;
    autoRotateSpeed: number;
    enableZoom: boolean;
    enablePan: boolean;
    enableRotate: boolean;
  },
): Promise<() => void> {
  if (!options.autoRotate) return () => {};

  // Wait for globe to be fully ready
  await waitForGlobeReady(globe);

  let animationFrameId: number | null = null;

  const cleanup = () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  };

  try {
    // Try controls first
    if (globe.controls && typeof globe.controls === "function") {
      const controls = globe.controls();
      if (controls && typeof controls === "object") {
        controls.autoRotate = true;
        controls.autoRotateSpeed = options.autoRotateSpeed;
        controls.enableZoom = options.enableZoom;
        controls.enablePan = options.enablePan;
        controls.enableRotate = options.enableRotate;
        controls.enabled = true;

        const animate = () => {
          if (controls && controls.update) {
            controls.update();
            animationFrameId = requestAnimationFrame(animate);
          }
        };
        animate();
        return cleanup;
      }
    }
  } catch (error) {
    console.warn("Controls setup failed:", error);
  }

  // Fallback to manual rotation
  try {
    if (globe.scene && typeof globe.scene === "function") {
      const scene = globe.scene();
      if (scene && scene.rotation) {
        const rotateGlobe = () => {
          const currentScene = globe.scene();
          if (currentScene && currentScene.rotation) {
            currentScene.rotation.y += 0.005 * options.autoRotateSpeed;
            animationFrameId = requestAnimationFrame(rotateGlobe);
          }
        };
        rotateGlobe();
        return cleanup;
      }
    }
  } catch (error) {
    console.warn("Scene rotation setup failed:", error);
  }

  return cleanup;
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
  const cleanupRef = useRef<(() => void) | null>(null);

  useImperativeHandle(ref, () => globeRef.current!, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  const handleGlobeReady = async () => {
    if (globeRef.current) {
      const globe = globeRef.current as GlobeInstance;

      // Set up auto-rotation with promise-based approach
      try {
        cleanupRef.current = await setupAutoRotation(globe, {
          autoRotate,
          autoRotateSpeed,
          enableZoom,
          enablePan,
          enableRotate,
        });
      } catch (error) {
        console.error("Failed to setup auto-rotation:", error);
      }

      // Call user's onGlobeReady if provided
      if (onGlobeReady) {
        onGlobeReady(globe);
      }
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
