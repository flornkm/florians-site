"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { CharacterModel } from "./CharacterModel";
import { WalkingPath } from "./WalkingPath";

export function Clone() {
  const [sceneOpacity, setSceneOpacity] = useState(0);

  useEffect(() => {
    // Fade in the entire scene
    const fadeInScene = () => {
      const startTime = Date.now();
      const duration = 1500; // 1.5 seconds

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
        {/* Very high ambient lighting for flat cartoon look */}
        <ambientLight intensity={1.8} color="#f0f0f5" />

        {/* Softer main light - less harsh shadows */}
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

        {/* Strong cartoon fill light - eliminates dark areas */}
        <directionalLight position={[-3, 6, 3]} intensity={0.7} color="#f5f5ff" />

        {/* Bright top light for cartoon flatness */}
        <directionalLight position={[0, 8, 0]} intensity={0.5} color="#ffffff" />

        {/* Walking path */}
        <WalkingPath />

        {/* Shadow plane on top of ground */}
        <mesh receiveShadow rotation-x={-Math.PI / 2} position-y={-0.1}>
          <planeGeometry args={[30, 30]} />
          <shadowMaterial opacity={0.15} />
        </mesh>

        <CharacterModel />
      </Canvas>
    </div>
  );
}
