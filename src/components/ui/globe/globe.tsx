import { forwardRef, lazy, Suspense, useCallback, useImperativeHandle, useRef } from "react";
import type { GlobeMethods, GlobeProps as ReactGlobeProps } from "react-globe.gl";
import "./globe.css";

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
  animateEntrance?: boolean;
}

// Expo out easing: fast start, smooth deceleration
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
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
    animateEntrance = false,
    ...props
  },
  ref,
) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const animationFrameRef = useRef<number | null>(null);

  useImperativeHandle(ref, () => globeRef.current!, []);

  const handleGlobeReady = useCallback(() => {
    const globe = globeRef.current;
    if (!globe) return;

    if (onGlobeReady) {
      onGlobeReady(globe);
    }

    // Animate the scene scale from 0 to 1
    if (animateEntrance) {
      try {
        const scene = globe.scene?.();
        if (scene) {
          scene.scale.set(0, 0, 0);
          const duration = 900;
          const start = performance.now();

          const animateScale = (now: number) => {
            const elapsed = now - start;
            const t = Math.min(elapsed / duration, 1);
            const scale = easeOutExpo(t);
            scene.scale.set(scale, scale, scale);
            if (t < 1) {
              requestAnimationFrame(animateScale);
            }
          };
          requestAnimationFrame(animateScale);
        }
      } catch {
        // Scene not available, skip entrance animation
      }
    }

    if (!autoRotate) return;

    // Clean up any previous animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Try OrbitControls first
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
            if (controls?.update) {
              controls.update();
              animationFrameRef.current = requestAnimationFrame(animate);
            }
          };
          animate();
          return;
        }
      }
    } catch {
      // Fall through to manual rotation
    }

    // Fallback: manual scene rotation
    try {
      if (globe.scene && typeof globe.scene === "function") {
        const scene = globe.scene();
        if (scene?.rotation) {
          const rotateGlobe = () => {
            const currentScene = globe.scene();
            if (currentScene?.rotation) {
              currentScene.rotation.y += 0.005 * autoRotateSpeed;
              animationFrameRef.current = requestAnimationFrame(rotateGlobe);
            }
          };
          rotateGlobe();
        }
      }
    } catch {
      // Rotation setup failed silently
    }
  }, [animateEntrance, autoRotate, autoRotateSpeed, enableZoom, enablePan, enableRotate, onGlobeReady]);

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
