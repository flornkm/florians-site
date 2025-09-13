import { ContactShadows, Environment, Lightformer, Text } from "@react-three/drei";
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
      <Text
        position={[-3, 2.5, -5]}
        fontSize={0.12}
        color="black"
        anchorX="center"
        font="/fonts/commit-mono/commit-mono-regular.otf"
      >
        Clone 2903
      </Text>
      <CharacterModel role="idle" position={[-4.07, -0.1, -4.46]} rotationY={Math.PI / 4} />
      <Text
        position={[-4.07, 2.5, -4.46]}
        fontSize={0.12}
        color="#A1A1A1"
        anchorX="center"
        font="/fonts/commit-mono/commit-mono-regular.otf"
      >
        Clone 2902
      </Text>
      <CharacterModel role="idle" position={[-1.93, -0.1, -5.54]} rotationY={Math.PI / 4} />
      <Text
        position={[-1.93, 2.5, -5.54]}
        fontSize={0.12}
        color="#A1A1A1"
        anchorX="center"
        font="/fonts/commit-mono/commit-mono-regular.otf"
      >
        Clone 2904
      </Text>
      <CharacterModel role="idle" position={[-0.86, -0.1, -6.07]} rotationY={Math.PI / 4} />
      <Text
        position={[-0.86, 2.5, -6.07]}
        fontSize={0.12}
        color="#A1A1A1"
        anchorX="center"
        font="/fonts/commit-mono/commit-mono-regular.otf"
      >
        Clone 2905
      </Text>
      <CharacterModel role="idle" position={[0.21, -0.1, -6.6]} rotationY={Math.PI / 4} />
      <Text
        position={[0.21, 2.5, -6.6]}
        fontSize={0.12}
        color="#A1A1A1"
        anchorX="center"
        font="/fonts/commit-mono/commit-mono-regular.otf"
      >
        Clone 2906
      </Text>
    </>
  );
}

function CameraRig({ onComplete }: { onComplete?: () => void }) {
  const { camera } = useThree();
  const start = useRef<number | null>(null);
  const duration = 2800;
  const target = useMemo(() => new THREE.Vector3(-3, 0.8, -5), []);
  const endPos = useMemo(() => new THREE.Vector3(0, 2, 6), []);
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
    <div className="lg:h-full h-[512px] w-full">
      <Canvas
        camera={{ position: [-1.44, 1.8, -3.44], fov: 45, near: 0.1, far: 1000 }}
        style={{ background: "transparent", opacity: sceneOpacity }}
        dpr={[1, 2]}
        gl={{
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.3,
          shadowMapType: THREE.PCFSoftShadowMap,
        }}
        shadows
      >
        <ambientLight intensity={0.7} color="#ffffff" />
        <hemisphereLight intensity={0.6} color="#ffe9c9" groundColor="#d8f3ff" />
        <directionalLight
          position={[5, 8, 4]}
          intensity={0.8}
          castShadow
          color="#fff8e1"
          shadow-mapSize={[1024, 1024]}
          shadow-camera-far={25}
          shadow-camera-left={-8}
          shadow-camera-right={8}
          shadow-camera-top={8}
          shadow-camera-bottom={-8}
          shadow-bias={-0.0001}
          shadow-normalBias={0.02}
        />
        <directionalLight position={[-4, 6, 2]} intensity={0.25} color="#e8f4ff" />
        <directionalLight position={[-1, 5, -3]} intensity={0.2} color="#ffffff" />

        <Environment preset="studio" background={false} blur={0.95}>
          <Lightformer intensity={0.8} color="#ffffff" position={[3, 4, 3]} scale={[12, 12, 1]} />
          <Lightformer intensity={0.5} color="#f0f8ff" position={[-4, 3, -2]} scale={[10, 10, 1]} />
        </Environment>

        <mesh receiveShadow rotation-x={-Math.PI / 2} position-y={-0.1}>
          <planeGeometry args={[30, 30]} />
          <shadowMaterial opacity={0.12} />
        </mesh>

        <ContactShadows opacity={0.18} scale={18} blur={3.2} far={15} color="#000000" />

        <SceneCharacters cameraDone={cameraDone} onCameraDone={() => setCameraDone(true)} />
      </Canvas>
    </div>
  );
}
