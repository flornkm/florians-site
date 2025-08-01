import React, { Suspense, useEffect, useState } from "react";

interface CanvasProps {
  children: React.ReactNode;
}

interface PerspectiveCameraProps {
  makeDefault?: boolean;
  position?: [number, number, number];
}

interface OrbitControlsProps {
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  enableZoom?: boolean;
  enablePan?: boolean;
  minDistance?: number;
  maxDistance?: number;
}

interface ModelViewerProps {
  src: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  autoRotate?: boolean;
  enableZoom?: boolean;
  enablePan?: boolean;
  cameraPosition?: [number, number, number];
  metalType?: "steel" | "aluminum" | "copper" | "gold" | "chrome" | "titanium";
}

function ErrorFallback({ error }: { error: string }) {
  return (
    <div className="flex items-center justify-center w-full h-96 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
      <div className="text-center p-4">
        <p className="text-sm text-red-600 dark:text-red-400">Failed to load 3D model</p>
        <p className="text-xs text-red-500 dark:text-red-500 mt-1">{error}</p>
      </div>
    </div>
  );
}

function Scene({
  src,
  autoRotate,
  enableZoom,
  enablePan,
  cameraPosition,
  metalType,
}: {
  src: string;
  autoRotate: boolean;
  enableZoom: boolean;
  enablePan: boolean;
  cameraPosition: [number, number, number];
  metalType: "steel" | "aluminum" | "copper" | "gold" | "chrome" | "titanium";
}) {
  const [ThreeComponents, setThreeComponents] = useState<{
    Canvas: React.ComponentType<
      CanvasProps & {
        style?: React.CSSProperties;
      }
    >;
    PerspectiveCamera: React.ComponentType<PerspectiveCameraProps>;
    OrbitControls: React.ComponentType<OrbitControlsProps>;
    STLLoader: React.ComponentType<{
      src: string;
      metalType?: "steel" | "aluminum" | "copper" | "gold" | "chrome" | "titanium";
    }>;
    OBJLoader: React.ComponentType<{
      src: string;
      metalType?: "steel" | "aluminum" | "copper" | "gold" | "chrome" | "titanium";
    }>;
  } | null>(null);

  useEffect(() => {
    // Dynamically import all Three.js dependencies on client side only
    Promise.all([
      import("@react-three/fiber"),
      import("@react-three/drei"),
      import("./loaders/stl-loader"),
      import("./loaders/obj-loader"),
    ]).then(([fiber, drei, stlModule, objModule]) => {
      setThreeComponents({
        Canvas: fiber.Canvas,
        PerspectiveCamera: drei.PerspectiveCamera,
        OrbitControls: drei.OrbitControls,
        STLLoader: stlModule.STLLoader,
        OBJLoader: objModule.OBJLoader,
      });
    });
  }, []);

  if (!ThreeComponents) {
    return null;
  }

  const { Canvas, PerspectiveCamera, OrbitControls, STLLoader, OBJLoader } = ThreeComponents;

  function ModelRenderer({ src }: { src: string }) {
    const fileExtension = src.split(".").pop()?.toLowerCase();

    if (fileExtension === "stl") {
      return <STLLoader src={src} metalType={metalType} />;
    } else if (fileExtension === "obj") {
      return <OBJLoader src={src} metalType={metalType} />;
    } else {
      throw new Error(`Unsupported file format: ${fileExtension}`);
    }
  }

  return (
    <Canvas className="bg-neutral-50 dark:bg-neutral-950">
      <PerspectiveCamera makeDefault position={cameraPosition} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={2.0} castShadow />
      <directionalLight position={[-10, -10, -5]} intensity={1.5} />
      <directionalLight position={[0, 10, 0]} intensity={1.0} />
      <pointLight position={[5, 5, 5]} intensity={1.2} />
      <pointLight position={[-5, -5, -5]} intensity={0.8} />

      <Suspense fallback={null}>
        <ModelRenderer src={src} />
      </Suspense>

      <OrbitControls
        autoRotate={autoRotate}
        autoRotateSpeed={1}
        enableZoom={enableZoom}
        enablePan={enablePan}
        minDistance={2}
        maxDistance={20}
      />
    </Canvas>
  );
}

export function ModelViewer({
  src,
  width = "100%",
  height = 400,
  className = "",
  autoRotate = true,
  enableZoom = true,
  enablePan = true,
  cameraPosition = [5, 5, 5],
  metalType = "titanium",
}: ModelViewerProps) {
  if (!src) {
    return <ErrorFallback error="No model source provided" />;
  }

  return (
    <div
      className={`relative cursor-grab active:cursor-grabbing dark:border-neutral-700 rounded-lg overflow-hidden ${className}`}
      style={{ width, height }}
    >
      <div className="absolute inset-0 -z-10 bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
      <Suspense>
        <Scene
          src={src}
          autoRotate={autoRotate}
          enableZoom={enableZoom}
          enablePan={enablePan}
          cameraPosition={cameraPosition}
          metalType={metalType}
        />
      </Suspense>
    </div>
  );
}

export default ModelViewer;
