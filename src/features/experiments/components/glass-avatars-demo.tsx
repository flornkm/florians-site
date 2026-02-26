import { Suspense, useEffect, useRef, useState } from "react";

type Vec3 = [number, number, number];

interface GlassSettings {
  roughness: number;
  thickness: number;
  chromaticAberration: number;
  distortion: number;
  ior: number;
  transmission: number;
  clearcoat: number;
  attenuationDistance: number;
  lightIntensity: number;
  rimIntensity: number;
}

const DEFAULT_SETTINGS: GlassSettings = {
  roughness: 0.15,
  thickness: 3.5,
  chromaticAberration: 0.08,
  distortion: 0.4,
  ior: 1.5,
  transmission: 0.95,
  clearcoat: 1,
  attenuationDistance: 0.5,
  lightIntensity: 1.8,
  rimIntensity: 0.6,
};

type ThreeModules = {
  Canvas: any;
  useFrame: any;
  useLoader: any;
  MeshTransmissionMaterial: any;
  Environment: any;
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

function InnerAvatar({ modules, src, settings }: { modules: ThreeModules; src: string; settings: GlassSettings }) {
  const { useFrame, useLoader, MeshTransmissionMaterial, Environment, THREE } = modules;
  const texture = useLoader(THREE.TextureLoader, src);

  const glassRef = useRef<any>(null);
  const groupRef = useRef<any>(null);

  useFrame(({ clock }: { clock: { getElapsedTime: () => number } }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.25) * 0.08;
      groupRef.current.rotation.x = Math.cos(t * 0.2) * 0.04;
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 4, 5]} intensity={settings.lightIntensity} color="#ffffff" />
      <directionalLight position={[-3, 2, 4]} intensity={0.5} color="#d0d8ff" />
      <pointLight position={[2, -1, 4]} intensity={0.3} color="#ffffff" />
      <pointLight position={[-1, 3, 3]} intensity={settings.rimIntensity} color="#e0e8ff" />

      <group ref={groupRef}>
        <mesh position={[0, 0, -0.6] as Vec3}>
          <circleGeometry args={[1.15, 128]} />
          <meshStandardMaterial map={texture} roughness={0.6} metalness={0.0} toneMapped={false} />
        </mesh>

        <mesh ref={glassRef} position={[0, 0, 0.3] as Vec3} scale={[1.15, 1.15, 0.7] as Vec3}>
          <sphereGeometry args={[1, 128, 128]} />
          <MeshTransmissionMaterial
            samples={24}
            resolution={1024}
            transmission={settings.transmission}
            roughness={settings.roughness}
            thickness={settings.thickness}
            ior={settings.ior}
            chromaticAberration={settings.chromaticAberration}
            anisotropy={0.3}
            distortion={settings.distortion}
            distortionScale={0.25}
            temporalDistortion={0.15}
            clearcoat={settings.clearcoat}
            clearcoatRoughness={0.0}
            attenuationDistance={settings.attenuationDistance}
            attenuationColor="#d8e2ff"
            color="#f0f4ff"
            backside
            backsideThickness={1.0}
            envMapIntensity={1.2}
          />
        </mesh>

        <mesh position={[0, 0, 0.62] as Vec3}>
          <ringGeometry args={[1.06, 1.15, 256]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.08}
            metalness={0.4}
            transparent
            opacity={0.45}
          />
        </mesh>

        <mesh position={[0, 0, 0.63] as Vec3}>
          <ringGeometry args={[1.12, 1.16, 256]} />
          <meshStandardMaterial color="#ffffff" roughness={0.02} metalness={0.6} transparent opacity={0.2} />
        </mesh>
      </group>

      <Environment preset="studio" />
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
      <label className="w-28 shrink-0 text-sm text-tertiary">{label}</label>
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

  const update = (key: keyof GlassSettings) => (v: number) => setSettings((prev) => ({ ...prev, [key]: v }));

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 px-6 py-8">
      <div className="flex items-center justify-center">
        <div
          style={{ width: 200, height: 200, borderRadius: 9999, overflow: "hidden" }}
          className="shadow-2xl shadow-black/10"
        >
          {modules ? (
            <modules.Canvas
              camera={{ position: [0, 0, 2.8] as Vec3, fov: 35 }}
              dpr={[1, 2]}
              gl={{ antialias: true, alpha: true }}
              style={{ width: "100%", height: "100%", background: "transparent" }}
            >
              <Suspense fallback={null}>
                <InnerAvatar modules={modules} src="/images/avatars/florian_kiem.webp" settings={settings} />
              </Suspense>
            </modules.Canvas>
          ) : (
            <div className="h-full w-full animate-pulse bg-surface-tertiary" />
          )}
        </div>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-2.5 rounded-xl border border-primary bg-secondary/50 p-4">
        <p className="mb-1 text-sm font-medium text-secondary">Glass Settings</p>
        <Slider label="Blur" value={settings.roughness} min={0} max={0.5} step={0.01} onChange={update("roughness")} />
        <Slider
          label="Thickness"
          value={settings.thickness}
          min={0.5}
          max={8}
          step={0.1}
          onChange={update("thickness")}
        />
        <Slider
          label="Chromatic"
          value={settings.chromaticAberration}
          min={0}
          max={0.5}
          step={0.01}
          onChange={update("chromaticAberration")}
        />
        <Slider
          label="Distortion"
          value={settings.distortion}
          min={0}
          max={1}
          step={0.01}
          onChange={update("distortion")}
        />
        <Slider label="IOR" value={settings.ior} min={1} max={2.5} step={0.01} onChange={update("ior")} />
        <Slider
          label="Transmission"
          value={settings.transmission}
          min={0.5}
          max={1}
          step={0.01}
          onChange={update("transmission")}
        />
        <Slider
          label="Attenuation"
          value={settings.attenuationDistance}
          min={0.1}
          max={3}
          step={0.05}
          onChange={update("attenuationDistance")}
        />
        <Slider
          label="Light"
          value={settings.lightIntensity}
          min={0}
          max={4}
          step={0.1}
          onChange={update("lightIntensity")}
        />
        <Slider
          label="Rim Light"
          value={settings.rimIntensity}
          min={0}
          max={2}
          step={0.05}
          onChange={update("rimIntensity")}
        />
        <button
          onClick={() => setSettings(DEFAULT_SETTINGS)}
          className="mt-1 self-start rounded-lg px-2.5 py-1 text-xs text-tertiary transition-colors duration-150 hover:bg-interactive-hover hover:text-secondary"
        >
          Reset defaults
        </button>
      </div>
    </div>
  );
}
