import { Environment, Lightformer, OrthographicCamera } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import * as THREE from "three";
import { GeigerCounter } from "./GeigerCounter";
import { SoundManager } from "./SoundManager";

// Zoom set imperatively each frame: drei's OrthographicCamera ignores zoom prop changes after makeDefault.
function ResponsiveCamera() {
  const cameraRef = useRef<THREE.OrthographicCamera>(null);
  const { size } = useThree();
  useFrame(() => {
    const cam = cameraRef.current;
    if (!cam) return;
    const target = size.width < 768 ? 1700 : 3400;
    if (cam.zoom !== target) {
      cam.zoom = target;
      cam.updateProjectionMatrix();
    }
  });
  return (
    <OrthographicCamera
      ref={cameraRef}
      makeDefault
      position={[0, 0.5, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      zoom={3400}
      near={0.01}
      far={3}
    />
  );
}

export function Scene() {
  return (
    <Canvas
      dpr={[1, 2]}
      shadows={{ type: THREE.VSMShadowMap }}
      gl={{
        alpha: true,
        antialias: true,
        toneMapping: THREE.NeutralToneMapping,
        toneMappingExposure: 1.0,
        powerPreference: "high-performance",
        outputColorSpace: THREE.SRGBColorSpace,
        stencil: false,
      }}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        filter:
          "drop-shadow(0 4px 10px rgba(20,30,35,0.10)) " +
          "drop-shadow(12px 22px 40px rgba(20,30,35,0.14))",
      }}
    >
      <ResponsiveCamera />

      <hemisphereLight args={["#fff4e0", "#23282a", 0.55]} />
      <ambientLight intensity={0.18} color="#f4ead8" />

      <pointLight
        position={[-0.8, 0.35, 0]}
        intensity={0.55}
        color="#fff2dc"
        distance={2.5}
        decay={1.4}
      />
      <pointLight
        position={[0.8, 0.35, 0]}
        intensity={0.55}
        color="#eef2f8"
        distance={2.5}
        decay={1.4}
      />
      <pointLight
        position={[0, 0.3, 0.9]}
        intensity={0.35}
        color="#f4ead8"
        distance={2.2}
        decay={1.6}
      />
      <pointLight
        position={[0, 0.3, -0.9]}
        intensity={0.3}
        color="#e8eef5"
        distance={2.2}
        decay={1.6}
      />

      <Suspense fallback={null}>
        <Environment frames={1} resolution={512} background={false}>
          <Lightformer
            form="rect"
            intensity={1.4}
            color="#f8f9fc"
            position={[-0.35, 1.4, -0.15]}
            scale={[4.0, 2.4, 1]}
            rotation={[-Math.PI / 2, 0, 0]}
          />
          <Lightformer
            form="rect"
            intensity={0.55}
            color="#dde7f0"
            position={[1.1, 0.7, 0.4]}
            scale={[2.4, 1.4, 1]}
            rotation={[-Math.PI / 2, 0, 0]}
          />
          <Lightformer
            form="rect"
            intensity={0.45}
            color="#e8eef5"
            position={[-1.1, 0.7, 0.4]}
            scale={[2.0, 1.2, 1]}
            rotation={[-Math.PI / 2, 0, 0]}
          />
          <Lightformer
            form="circle"
            intensity={1.8}
            color="#ffffff"
            position={[-0.15, 0.9, -0.05]}
            scale={0.85}
            rotation={[-Math.PI / 2, 0, 0]}
          />
          <Lightformer
            form="rect"
            intensity={0.9}
            color="#ffffff"
            position={[0.25, 0.75, -0.1]}
            scale={[0.55, 0.22, 1]}
            rotation={[-Math.PI / 2, 0, 0]}
          />
        </Environment>
        <GeigerCounter />
        <SoundManager />
      </Suspense>
    </Canvas>
  );
}
