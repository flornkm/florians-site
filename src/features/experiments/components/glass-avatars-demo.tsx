import { Suspense, useEffect, useRef, useState } from "react";

type Vec3 = [number, number, number];

interface GlassSettings {
  roughness: number;
  distortion: number;
  tint: string;
  imageSrc: string;
}

const DEFAULT_SETTINGS: GlassSettings = {
  roughness: 0.25,
  distortion: 0.08,
  tint: "#c8d8ff",
  imageSrc: "/images/avatars/florian_kiem.webp",
};

type ThreeModules = {
  Canvas: any;
  useFrame: any;
  useLoader: any;
  MeshTransmissionMaterial: any;
  Float: any;
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
          Float: drei.Float,
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

function AvatarPlane({ modules, src }: { modules: ThreeModules; src: string }) {
  const { useLoader, THREE } = modules;
  const texture = useLoader(THREE.TextureLoader, src);
  texture.colorSpace = THREE.SRGBColorSpace;

  return (
    <mesh position={[0, 0, -1.2] as Vec3}>
      <planeGeometry args={[2.4, 2.4]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function GlassSphere({ modules, settings }: { modules: ThreeModules; settings: GlassSettings }) {
  const { useFrame, MeshTransmissionMaterial, Float } = modules;

  const groupRef = useRef<any>(null);

  useFrame(({ clock }: { clock: { getElapsedTime: () => number } }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.06;
      groupRef.current.rotation.x = Math.cos(t * 0.25) * 0.03;
    }
  });

  return (
    <>
      <color attach="background" args={["#ffffff"]} />
      <ambientLight intensity={2.2} />
      <directionalLight position={[3, 3, 5]} intensity={0.4} color="#ffffff" />
      <directionalLight position={[-2, -1, 3]} intensity={0.15} color="#e8ecff" />

      <Float speed={1.5} rotationIntensity={0.02} floatIntensity={0.03} floatingRange={[-0.01, 0.01]}>
        <group ref={groupRef}>
          <Suspense fallback={null}>
            <AvatarPlane modules={modules} src={settings.imageSrc} />
          </Suspense>

          <mesh>
            <sphereGeometry args={[1.0, 128, 128]} />
            <MeshTransmissionMaterial
              samples={12}
              resolution={512}
              transmission={1}
              roughness={settings.roughness}
              thickness={0.4}
              ior={1.07}
              chromaticAberration={0.015}
              distortion={settings.distortion}
              distortionScale={0.15}
              temporalDistortion={0.05}
              attenuationDistance={3.0}
              attenuationColor={settings.tint}
              backside
              backsideThickness={0.15}
              envMapIntensity={0}
              clearcoat={1}
              clearcoatRoughness={0.1}
            />
          </mesh>

          <mesh>
            <torusGeometry args={[1.005, 0.008, 16, 128]} />
            <meshStandardMaterial color="#ffffff" metalness={0.6} roughness={0.2} transparent opacity={0.5} />
          </mesh>
        </group>
      </Float>
    </>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="w-20 shrink-0 text-sm text-tertiary">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-surface-tertiary accent-white/80 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
      />
      <span className="w-10 shrink-0 text-right font-mono text-xs text-quaternary">{value.toFixed(2)}</span>
    </div>
  );
}

export function GlassAvatarsDemo() {
  const modules = useThreeModules();
  const [settings, setSettings] = useState<GlassSettings>(DEFAULT_SETTINGS);
  const [textureKey, setTextureKey] = useState(0);

  const update = <K extends keyof GlassSettings>(key: K) => (v: GlassSettings[K]) =>
    setSettings((prev) => ({ ...prev, [key]: v }));

  const handleImageChange = (src: string) => {
    setSettings((prev) => ({ ...prev, imageSrc: src }));
    setTextureKey((k) => k + 1);
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 px-6 py-8">
      <div
        style={{ width: 240, height: 240, borderRadius: 9999, overflow: "hidden" }}
        className="shadow-2xl shadow-black/10"
      >
        {modules ? (
          <modules.Canvas
            key={textureKey}
            camera={{ position: [0, 0, 3.8] as Vec3, fov: 28 }}
            dpr={[1, 2]}
            gl={{ antialias: true, powerPreference: "high-performance" }}
            style={{ width: "100%", height: "100%" }}
          >
            <Suspense fallback={null}>
              <GlassSphere modules={modules} settings={settings} />
            </Suspense>
          </modules.Canvas>
        ) : (
          <div className="h-full w-full animate-pulse rounded-full bg-surface-tertiary" />
        )}
      </div>

      <div className="flex w-full max-w-sm flex-col gap-3 rounded-xl border border-primary bg-secondary/50 p-4">
        <div className="flex items-center gap-3">
          <label className="w-20 shrink-0 text-sm text-tertiary">Source</label>
          <input
            type="text"
            value={settings.imageSrc}
            onChange={(e) => handleImageChange(e.target.value)}
            spellCheck={false}
            className="h-7 w-full rounded-md border border-primary bg-primary px-2 font-mono text-xs text-secondary outline-none transition-colors focus:border-secondary"
          />
        </div>

        <Slider label="Blur" value={settings.roughness} min={0} max={0.5} step={0.01} onChange={update("roughness")} />

        <Slider
          label="Distortion"
          value={settings.distortion}
          min={0}
          max={0.5}
          step={0.01}
          onChange={update("distortion")}
        />

        <div className="flex items-center gap-3">
          <label className="w-20 shrink-0 text-sm text-tertiary">Tint</label>
          <div className="flex flex-1 items-center gap-2">
            <input
              type="color"
              value={settings.tint}
              onChange={(e) => update("tint")(e.target.value)}
              className="h-7 w-7 shrink-0 cursor-pointer appearance-none overflow-hidden rounded-md border border-primary bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
            />
            <input
              type="text"
              value={settings.tint}
              onChange={(e) => update("tint")(e.target.value)}
              spellCheck={false}
              className="h-7 w-full rounded-md border border-primary bg-primary px-2 font-mono text-xs text-secondary outline-none transition-colors focus:border-secondary"
            />
          </div>
        </div>

        <button
          onClick={() => {
            setSettings(DEFAULT_SETTINGS);
            setTextureKey((k) => k + 1);
          }}
          className="mt-1 self-start rounded-lg px-2.5 py-1 text-xs text-tertiary transition-colors duration-150 hover:bg-interactive-hover hover:text-secondary"
        >
          Reset defaults
        </button>
      </div>
    </div>
  );
}
