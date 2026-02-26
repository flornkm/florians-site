import { Suspense, useEffect, useRef, useState } from "react";

export interface GlassAvatar3DProps {
  src: string;
  alt?: string;
  size?: number;
  className?: string;
}

type Vec3 = [number, number, number];

type ThreeModules = {
  Canvas: any;
  useFrame: any;
  useLoader: any;
  MeshTransmissionMaterial: any;
  Environment: any;
  OrbitControls: any;
  THREE: typeof import("three");
};

function useThreeModules() {
  const [modules, setModules] = useState<ThreeModules | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([import("@react-three/fiber"), import("@react-three/drei"), import("three")]).then(
      ([fiber, drei, THREE]) => {
        if (cancelled) return;
        setModules({
          Canvas: fiber.Canvas,
          useFrame: fiber.useFrame,
          useLoader: fiber.useLoader,
          MeshTransmissionMaterial: drei.MeshTransmissionMaterial,
          Environment: drei.Environment,
          OrbitControls: drei.OrbitControls,
          THREE: THREE as unknown as typeof import("three"),
        });
      },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  return modules;
}

function InnerAvatar({
  modules,
  src,
}: {
  modules: ThreeModules;
  src: string;
}) {
  const { useFrame, useLoader, MeshTransmissionMaterial, Environment, THREE } = modules;
  const texture = useLoader(THREE.TextureLoader, src);

  const groupRef = useRef<any>(null);

  useFrame(({ clock }: { clock: { getElapsedTime: () => number } }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.15;
      groupRef.current.rotation.x = Math.cos(t * 0.25) * 0.06;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 3, 4]} intensity={1.6} />
      <directionalLight position={[-2, 2, 3]} intensity={0.4} color="#c4d0ff" />
      <pointLight position={[0, 0, 3]} intensity={0.6} color="#ffffff" />

      <group ref={groupRef}>
        <mesh position={[0, 0, -0.35]}>
          <circleGeometry args={[1.05, 96]} />
          <meshStandardMaterial map={texture} roughness={0.5} metalness={0.0} toneMapped={false} />
        </mesh>

        <mesh position={[0, 0, 0.15]} scale={[1.05, 1.05, 0.55]}>
          <sphereGeometry args={[1, 96, 96]} />
          <MeshTransmissionMaterial
            samples={16}
            resolution={512}
            transmission={0.97}
            roughness={0.05}
            thickness={2.0}
            ior={1.45}
            chromaticAberration={0.06}
            anisotropy={0.2}
            distortion={0.2}
            distortionScale={0.15}
            temporalDistortion={0.12}
            clearcoat={1}
            clearcoatRoughness={0.0}
            attenuationDistance={0.6}
            attenuationColor="#e8edff"
            color="#f8faff"
            backside
            backsideThickness={0.5}
          />
        </mesh>

        <mesh position={[0, 0, 0.58]}>
          <ringGeometry args={[0.98, 1.06, 128]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.15}
            metalness={0.15}
            transparent
            opacity={0.35}
          />
        </mesh>
      </group>

      <Environment preset="studio" />
    </>
  );
}

export function GlassAvatar3D({ src, alt, size = 64, className }: GlassAvatar3DProps) {
  const modules = useThreeModules();

  if (!modules) {
    return (
      <div
        className={className}
        style={{ width: size, height: size, borderRadius: 9999, overflow: "hidden" }}
        aria-label={alt}
      />
    );
  }

  const { Canvas, OrbitControls } = modules;

  return (
    <div
      className={className}
      style={{ width: size, height: size, borderRadius: 9999, overflow: "hidden" }}
      aria-label={alt}
    >
      <Canvas
        camera={{ position: [0, 0, 2.6] as Vec3, fov: 35 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
      >
        <Suspense fallback={null}>
          <InnerAvatar modules={modules} src={src} />
        </Suspense>
        <OrbitControls enablePan={false} enableZoom={false} rotateSpeed={0.6} />
      </Canvas>
    </div>
  );
}

const AVATARS: { src: string; alt: string }[] = [
  { src: "/images/avatars/florian_kiem.webp", alt: "Florian" },
  { src: "/images/avatars/felix_haeberle.jpg", alt: "Felix" },
  { src: "/images/avatars/anton_stallboerger.jpg", alt: "Anton" },
  { src: "/images/avatars/jan_johannes.jpg", alt: "Jan" },
  { src: "/images/avatars/niklas_buchfink.jpg", alt: "Niklas" },
  { src: "/images/avatars/nils_eller.jpg", alt: "Nils" },
];

export function GlassAvatarsDemo() {
  return (
    <div className="w-full h-full flex items-center justify-center px-6">
      <div className="flex flex-wrap items-center justify-center gap-6">
        {AVATARS.map((avatar) => (
          <GlassAvatar3D
            key={avatar.src}
            src={avatar.src}
            alt={avatar.alt}
            size={120}
            className="bg-secondary border border-primary"
          />
        ))}
      </div>
    </div>
  );
}
