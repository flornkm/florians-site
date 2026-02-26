import { Suspense, useEffect, useRef, useState } from "react";

const AVATAR_PATHS = [
  "/images/avatars/florian_kiem.webp",
  "/images/avatars/felix_haeberle.jpg",
  "/images/avatars/anton_stallboerger.jpg",
  "/images/avatars/jan_johannes.jpg",
  "/images/avatars/niklas_buchfink.jpg",
  "/images/avatars/nils_eller.jpg",
];

const AVATAR_POSITIONS: [number, number, number][] = [
  [-1.4, 0.7, -0.5],
  [0, 0.7, -0.5],
  [1.4, 0.7, -0.5],
  [-1.4, -0.6, -0.5],
  [0, -0.6, -0.5],
  [1.4, -0.6, -0.5],
];

type Vec3 = [number, number, number];

interface ThreeModules {
  Canvas: any;
  useFrame: any;
  useLoader: any;
  MeshTransmissionMaterial: any;
  Environment: any;
  Float: any;
  THREE: typeof import("three");
}

let cachedModules: ThreeModules | null = null;

function useThreeModules() {
  const [modules, setModules] = useState<ThreeModules | null>(cachedModules);

  useEffect(() => {
    if (cachedModules) return;
    Promise.all([
      import("@react-three/fiber"),
      import("@react-three/drei"),
      import("three"),
    ]).then(([fiber, drei, THREE]) => {
      cachedModules = {
        Canvas: fiber.Canvas,
        useFrame: fiber.useFrame,
        useLoader: fiber.useLoader,
        MeshTransmissionMaterial: drei.MeshTransmissionMaterial,
        Environment: drei.Environment,
        Float: drei.Float,
        THREE: THREE as unknown as typeof import("three"),
      };
      setModules(cachedModules);
    });
  }, []);

  return modules;
}

function AvatarPlane({ url, position }: { url: string; position: Vec3 }) {
  const { useLoader, THREE } = cachedModules!;
  const texture = useLoader(THREE.TextureLoader, url);

  return (
    <mesh position={position}>
      <circleGeometry args={[0.52, 64]} />
      <meshStandardMaterial map={texture} toneMapped={false} roughness={0.5} metalness={0.0} />
    </mesh>
  );
}

function GlassPanel() {
  const { useFrame, MeshTransmissionMaterial } = cachedModules!;
  const glassRef = useRef<any>(null);

  useFrame(({ clock }: { clock: { getElapsedTime: () => number } }) => {
    if (!glassRef.current) return;
    const t = clock.getElapsedTime();
    glassRef.current.rotation.y = Math.sin(t * 0.35) * 0.12;
    glassRef.current.rotation.x = Math.cos(t * 0.25) * 0.04;
  });

  return (
    <mesh ref={glassRef} position={[0, 0.05, 0.65]}>
      <boxGeometry args={[4.8, 3.2, 0.06]} />
      <MeshTransmissionMaterial
        samples={16}
        resolution={512}
        transmission={0.96}
        roughness={0.08}
        thickness={1.5}
        ior={1.5}
        chromaticAberration={0.06}
        anisotropy={0.2}
        distortion={0.2}
        distortionScale={0.3}
        temporalDistortion={0.12}
        clearcoat={1}
        clearcoatRoughness={0.0}
        attenuationDistance={0.5}
        attenuationColor="#dde4ff"
        color="#f0f4ff"
        backside
        backsideThickness={0.3}
      />
    </mesh>
  );
}

function InnerScene() {
  const { Float, Environment } = cachedModules!;

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <directionalLight position={[-4, 3, 2]} intensity={0.4} color="#a8b8ff" />
      <pointLight position={[0, 0, 4]} intensity={0.5} />
      <spotLight position={[2, 3, 4]} angle={0.4} penumbra={1} intensity={0.8} color="#ffffff" />

      <Float speed={1.0} rotationIntensity={0.06} floatIntensity={0.15}>
        <group>
          {AVATAR_PATHS.map((url, i) => (
            <AvatarPlane key={url} url={url} position={AVATAR_POSITIONS[i]} />
          ))}
        </group>
        <GlassPanel />
      </Float>

      <Environment preset="studio" />
    </>
  );
}

export function GlassAvatarsDemo() {
  const modules = useThreeModules();

  if (!modules) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <p className="text-sm text-tertiary">Loading 3D scene...</p>
      </div>
    );
  }

  const { Canvas } = modules;

  return (
    <Canvas
      camera={{ position: [0, 0, 4.5] as Vec3, fov: 40 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
    >
      <color attach="background" args={["#09090b"]} />
      <Suspense fallback={null}>
        <InnerScene />
      </Suspense>
    </Canvas>
  );
}
