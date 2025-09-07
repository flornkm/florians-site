"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { CharacterModel } from "./CharacterModel";

export function Clone() {
  const [sceneOpacity, setSceneOpacity] = useState(0);

  useEffect(() => {
    const fadeInScene = () => {
      const startTime = Date.now();
      const duration = 1500;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setSceneOpacity(progress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      animate();
    };

    fadeInScene();
  }, []);

  return (
    <div className="h-full w-full">
      <Canvas
        camera={{
          position: [0, 2, 8],
          fov: 45,
          near: 0.1,
          far: 1000,
        }}
        style={{ background: "transparent", opacity: sceneOpacity }}
        shadows
      >
        <ambientLight intensity={1.8} color="#f0f0f5" />
        <directionalLight
          position={[4, 8, 4]}
          intensity={0.8}
          castShadow
          color="#ffffff"
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={20}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
          shadow-bias={-0.001}
          shadow-normalBias={0.05}
        />
        <directionalLight position={[-3, 6, 3]} intensity={0.7} color="#f5f5ff" />
        <directionalLight position={[0, 8, 0]} intensity={0.5} color="#ffffff" />
        <mesh receiveShadow rotation-x={-Math.PI / 2} position-y={-0.1}>
          <planeGeometry args={[30, 30]} />
          <shadowMaterial opacity={0.15} />
        </mesh>

        <CharacterModel />
      </Canvas>
    </div>
  );
}
