"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { CharacterModel } from "./CharacterModel";

function SceneCharacters({ cameraDone, onCameraDone }: { cameraDone: boolean; onCameraDone: () => void }) {
  const walkerRef = useRef<THREE.Group | null>(null);
  return (
    <>
      <CameraRig onComplete={onCameraDone} />
      <CharacterModel
        role="walker"
        position={[-3, -0.1, -5]}
        rotationY={Math.PI / 4}
        followRef={walkerRef}
        start={cameraDone}
      />
      <CharacterModel role="idle" position={[-4.07, -0.1, -4.46]} rotationY={Math.PI / 4} />
      <CharacterModel role="idle" position={[-1.93, -0.1, -5.54]} rotationY={Math.PI / 4} />
      <CharacterModel role="idle" position={[-0.86, -0.1, -6.07]} rotationY={Math.PI / 4} />
      <CharacterModel role="idle" position={[0.21, -0.1, -6.6]} rotationY={Math.PI / 4} />
    </>
  );
}

function CameraRig({ onComplete }: { onComplete?: () => void }) {
  const { camera } = useThree();
  const start = useRef<number | null>(null);
  const duration = 2800;
  const target = useMemo(() => new THREE.Vector3(-3, 0.8, -5), []);
  const endPos = useMemo(() => new THREE.Vector3(0, 2, 8), []);
  const endLook = useMemo(() => new THREE.Vector3(0, 0.8, 1), []);
  const startPos = useMemo(() => {
    const dir = endPos.clone().sub(target).normalize();
    const startDist = 5.0;
    const p = target.clone().add(dir.multiplyScalar(startDist));
    p.y = 1.8;
    return p;
  }, [endPos, target]);
  const done = useRef(false);
  const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  useFrame(({ clock }) => {
    if (start.current === null) start.current = clock.getElapsedTime();
    const t = Math.min(((clock.getElapsedTime() - (start.current ?? 0)) * 1000) / duration, 1);
    const k = easeInOutCubic(t);
    const camPos = startPos.clone().lerp(endPos, k);
    camera.position.copy(camPos);
    const look = target.clone().lerp(endLook, k * 0.9);
    camera.lookAt(look.x, look.y, look.z);
    camera.updateProjectionMatrix();
    if (t >= 1 && !done.current) {
      done.current = true;
      onComplete?.();
    }
  });
  return null;
}

export function Clone() {
  const [sceneOpacity, setSceneOpacity] = useState(0);
  const [cameraDone, setCameraDone] = useState(false);

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
        camera={{ position: [-1.44, 1.8, -3.44], fov: 45, near: 0.1, far: 1000 }}
        style={{ background: "transparent", opacity: sceneOpacity }}
        dpr={[1, 2]}
        gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.3, shadowMapType: THREE.PCFSoftShadowMap, physicallyCorrectLights: false }}
        shadows
      >
        <ambientLight intensity={0.35} color="#ffffff" />
        <hemisphereLight intensity={0.8} color="#ffe9c9" groundColor="#d8f3ff" />
        <directionalLight
          position={[5, 7.5, 4]}
          intensity={1.6}
          castShadow
          color="#fff1d6"
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={30}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
          shadow-bias={-0.0002}
          shadow-normalBias={0.01}
        />
        <directionalLight position={[-6, 5, 2]} intensity={0.6} color="#dfefff" />
        <directionalLight position={[-2, 6, -4]} intensity={0.6} color="#ffffff" />
        <mesh receiveShadow rotation-x={-Math.PI / 2} position-y={-0.1}>
          <planeGeometry args={[30, 30]} />
          <shadowMaterial opacity={0.15} />
        </mesh>

        <SceneCharacters cameraDone={cameraDone} onCameraDone={() => setCameraDone(true)} />
      </Canvas>
    </div>
  );
}
