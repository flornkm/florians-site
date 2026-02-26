import { Suspense, useEffect, useMemo, useRef, useState } from "react";

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

  const glassRef = useRef<any>(null);
  const groupRef = useRef<any>(null);

  useFrame(({ clock }: { clock: { getElapsedTime: () => number } }) => {
    const t = clock.getElapsedTime();

    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.25) * 0.18;
      groupRef.current.rotation.x = Math.cos(t * 0.2) * 0.08;
    }

    if (glassRef.current) {
      glassRef.current.rotation.z = Math.sin(t * 0.15) * 0.08;
    }
  });

  const glassColor = useMemo(() => "#f4f7ff", []);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 3, 3]} intensity={1.4} />
      <directionalLight position={[-3, 1.5, 2]} intensity={0.35} color="#b8c6ff" />
      <pointLight position={[0, 0, 2.2]} intensity={0.5} />

      <group ref={groupRef}>
        <mesh position={[0, 0, -0.25]}>
          <circleGeometry args={[1, 80]} />
          <meshStandardMaterial map={texture} roughness={0.45} metalness={0.0} toneMapped={false} />
        </mesh>

        <mesh ref={glassRef} position={[0, 0, 0.12]}>
          <cylinderGeometry args={[1.02, 1.02, 0.28, 80, 1, true]} />
          <MeshTransmissionMaterial
            samples={10}
            resolution={256}
            transmission={0.98}
            roughness={0.12}
            thickness={1.2}
            ior={1.5}
            chromaticAberration={0.08}
            anisotropy={0.35}
            distortion={0.35}
            distortionScale={0.22}
            temporalDistortion={0.18}
            clearcoat={1}
            clearcoatRoughness={0.0}
            attenuationDistance={0.35}
            attenuationColor="#e7ecff"
            color={glassColor}
            backside
            backsideThickness={0.4}
          />
        </mesh>

        <mesh position={[0, 0, 0.21]}>
          <ringGeometry args={[0.985, 1.02, 96]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} transparent opacity={0.55} />
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
      <div className="flex flex-wrap items-center justify-center gap-4">
        {AVATARS.map((avatar) => (
          <GlassAvatar3D
            key={avatar.src}
            src={avatar.src}
            alt={avatar.alt}
            size={84}
            className="bg-secondary border border-primary"
          />
        ))}
      </div>
    </div>
  );
}
