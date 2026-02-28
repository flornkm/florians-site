import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const PARTICLE_COUNT = 8000;
const TUNNEL_DEPTH = 400;
const RESET_Z = -200;
const PASS_Z = 5;

const COLOR_WHITE = new THREE.Color(1, 1, 1);
const COLOR_LIGHT_BLUE = new THREE.Color("#a0c4ff");
const COLOR_PURPLE = new THREE.Color("#c77dff");
const COLOR_TEMP = new THREE.Color();

function lerpColor(colArr: Float32Array, index: number, radius: number) {
  const t = (radius - 1) / 3;
  if (t < 0.4) {
    COLOR_TEMP.copy(COLOR_WHITE).lerp(COLOR_LIGHT_BLUE, t / 0.4);
  } else {
    COLOR_TEMP.copy(COLOR_LIGHT_BLUE).lerp(COLOR_PURPLE, (t - 0.4) / 0.6);
  }
  colArr[index * 3] = COLOR_TEMP.r;
  colArr[index * 3 + 1] = COLOR_TEMP.g;
  colArr[index * 3 + 2] = COLOR_TEMP.b;
}

function Particles({ speed }: { speed: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const groupRef = useRef<THREE.Group>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const { gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    const container = canvas.parentElement;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = 0;
      mouseRef.current.y = 0;
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [gl]);

  const { positions, colors, speeds } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const col = new Float32Array(PARTICLE_COUNT * 3);
    const spd = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1 + Math.random() * 3;
      const z = (Math.random() - 0.5) * TUNNEL_DEPTH;

      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = Math.sin(angle) * radius;
      pos[i * 3 + 2] = z;

      spd[i] = 0.5 + Math.random() * 1.5;

      lerpColor(col, i, radius);
    }

    return { positions: pos, colors: col, speeds: spd };
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current || !groupRef.current) return;

    const posAttr = pointsRef.current.geometry.getAttribute("position") as THREE.BufferAttribute;
    const colAttr = pointsRef.current.geometry.getAttribute("color") as THREE.BufferAttribute;
    const posArr = posAttr.array as Float32Array;
    const colArr = colAttr.array as Float32Array;

    const dt = delta * 60;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      posArr[i * 3 + 2] += speeds[i] * speed * dt;

      if (posArr[i * 3 + 2] > PASS_Z) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 1 + Math.random() * 3;
        posArr[i * 3] = Math.cos(angle) * radius;
        posArr[i * 3 + 1] = Math.sin(angle) * radius;
        posArr[i * 3 + 2] = RESET_Z + Math.random() * 20;

        lerpColor(colArr, i, radius);
      }
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;

    const targetRotX = mouseRef.current.y * 0.3;
    const targetRotY = mouseRef.current.x * 0.3;
    groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.05;
    groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.05;
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} count={PARTICLE_COUNT} itemSize={3} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} count={PARTICLE_COUNT} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial vertexColors transparent opacity={0.9} size={0.2} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
}

const MIN_SPEED = 0.2;
const MAX_SPEED = 3;
const DEFAULT_SPEED = 1.2;

export const ParticleWormholeDemo = () => {
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [grabbing, setGrabbing] = useState(false);

  useEffect(() => {
    if (!grabbing) return;
    const release = () => setGrabbing(false);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, [grabbing]);

  const handleSpeedChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSpeed(parseFloat(e.target.value));
  }, []);

  return (
    <div className="relative flex h-full w-full flex-col items-center">
      <div className="h-full w-full bg-black">
        <Canvas
          camera={{ position: [0, 0, 4], fov: 75, near: 0.1, far: 300 }}
          gl={{ alpha: true, antialias: false }}
          style={{ background: "transparent" }}
        >
          <Particles speed={speed} />
        </Canvas>
      </div>

      <div className="absolute bottom-6 flex items-center gap-3 w-full max-w-[240px]">
        <span className="text-xs text-neutral-500 shrink-0 select-none">Slow</span>
        <div className="relative w-full flex items-center">
          <input
            type="range"
            min={MIN_SPEED}
            max={MAX_SPEED}
            step={0.1}
            value={speed}
            onChange={handleSpeedChange}
            onPointerDown={() => setGrabbing(true)}
            className={[
              "w-full h-[3px] appearance-none rounded-full outline-none bg-white/10",
              grabbing ? "cursor-grabbing" : "cursor-grab",
              "[&::-webkit-slider-thumb]:appearance-none",
              "[&::-webkit-slider-thumb]:w-3",
              "[&::-webkit-slider-thumb]:h-3",
              "[&::-webkit-slider-thumb]:rounded-full",
              "[&::-webkit-slider-thumb]:bg-neutral-400",
              "[&::-webkit-slider-thumb]:shadow-[0_0_0_2px_black]",
              "[&::-webkit-slider-thumb]:transition-transform",
              "[&::-webkit-slider-thumb]:duration-300",
              "[&::-webkit-slider-thumb]:[transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]",
              grabbing ? "[&::-webkit-slider-thumb]:scale-75" : "[&::-webkit-slider-thumb]:scale-100",
              grabbing ? "[&::-webkit-slider-thumb]:cursor-grabbing" : "[&::-webkit-slider-thumb]:cursor-grab",
              "[&::-moz-range-thumb]:w-3",
              "[&::-moz-range-thumb]:h-3",
              "[&::-moz-range-thumb]:rounded-full",
              "[&::-moz-range-thumb]:bg-neutral-400",
              "[&::-moz-range-thumb]:border-[2px]",
              "[&::-moz-range-thumb]:border-solid",
              "[&::-moz-range-thumb]:[border-color:black]",
              "[&::-moz-range-thumb]:transition-transform",
              "[&::-moz-range-thumb]:duration-300",
              "[&::-moz-range-thumb]:[transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]",
              grabbing ? "[&::-moz-range-thumb]:scale-75" : "[&::-moz-range-thumb]:scale-100",
              grabbing ? "[&::-moz-range-thumb]:cursor-grabbing" : "[&::-moz-range-thumb]:cursor-grab",
            ].join(" ")}
          />
        </div>
        <span className="text-xs text-neutral-500 shrink-0 select-none">Fast</span>
      </div>
    </div>
  );
};
