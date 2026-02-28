import { Canvas, useFrame } from "@react-three/fiber";
import { useCallback, useMemo, useRef } from "react";
import * as THREE from "three";

const PARTICLE_COUNT = 3000;
const G = 0.0015;
const SOFTENING = 0.05;
const BOUNDS = 8;
const SPAWN_RADIUS = 2;
const INITIAL_SPEED = 0.02;

const COLOR_SLOW = new THREE.Color("#3a0ca3");
const COLOR_MID = new THREE.Color("#4cc9f0");
const COLOR_FAST = new THREE.Color("#ffffff");
const COLOR_TEMP = new THREE.Color();

function TrailFade() {
  return (
    <mesh position={[0, 0, -1]} renderOrder={-1}>
      <planeGeometry args={[40, 40]} />
      <meshBasicMaterial color={0x000000} transparent opacity={0.08} depthTest={false} />
    </mesh>
  );
}

function GravityWell({ position }: { position: React.RefObject<THREE.Vector2> }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ringRef.current || !glowRef.current || !position.current) return;
    const t = clock.getElapsedTime();
    const pulse = 1 + 0.15 * Math.sin(t * 4);
    const x = position.current.x;
    const y = position.current.y;

    ringRef.current.position.set(x, y, 0);
    ringRef.current.scale.set(pulse, pulse, 1);

    glowRef.current.position.set(x, y, 0);
    glowRef.current.scale.set(pulse * 1.5, pulse * 1.5, 1);
    const mat = glowRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.15 + 0.05 * Math.sin(t * 4);
  });

  return (
    <>
      <mesh ref={ringRef} renderOrder={2}>
        <ringGeometry args={[0.12, 0.16, 32]} />
        <meshBasicMaterial color={0xffffff} transparent opacity={0.9} depthTest={false} />
      </mesh>
      <mesh ref={glowRef} renderOrder={1}>
        <circleGeometry args={[0.35, 32]} />
        <meshBasicMaterial color={0xffffff} transparent opacity={0.15} depthTest={false} />
      </mesh>
    </>
  );
}

function Particles({ wellPosition }: { wellPosition: React.RefObject<THREE.Vector2> }) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, velocities, colors } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const vel = new Float32Array(PARTICLE_COUNT * 2);
    const col = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * SPAWN_RADIUS;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = Math.sin(angle) * radius;
      pos[i * 3 + 2] = 0;

      const vAngle = Math.random() * Math.PI * 2;
      vel[i * 2] = Math.cos(vAngle) * INITIAL_SPEED;
      vel[i * 2 + 1] = Math.sin(vAngle) * INITIAL_SPEED;

      col[i * 3] = COLOR_SLOW.r;
      col[i * 3 + 1] = COLOR_SLOW.g;
      col[i * 3 + 2] = COLOR_SLOW.b;
    }

    return { positions: pos, velocities: vel, colors: col };
  }, []);

  const posRef = useRef(positions);
  const velRef = useRef(velocities);
  const colRef = useRef(colors);

  useFrame(() => {
    if (!pointsRef.current || !wellPosition.current) return;
    const pos = posRef.current;
    const vel = velRef.current;
    const col = colRef.current;
    const wx = wellPosition.current.x;
    const wy = wellPosition.current.y;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const ivx = i * 2;
      const ivy = i * 2 + 1;

      const dx = wx - pos[ix];
      const dy = wy - pos[iy];
      const distSq = dx * dx + dy * dy + SOFTENING;
      const dist = Math.sqrt(distSq);
      const force = G / distSq;
      const ax = (dx / dist) * force;
      const ay = (dy / dist) * force;

      vel[ivx] += ax;
      vel[ivy] += ay;

      pos[ix] += vel[ivx];
      pos[iy] += vel[ivy];

      const px = pos[ix];
      const py = pos[iy];
      if (px * px + py * py > BOUNDS * BOUNDS) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * SPAWN_RADIUS * 0.5;
        pos[ix] = Math.cos(angle) * radius;
        pos[iy] = Math.sin(angle) * radius;
        pos[i * 3 + 2] = 0;
        const vAngle = Math.random() * Math.PI * 2;
        vel[ivx] = Math.cos(vAngle) * INITIAL_SPEED;
        vel[ivy] = Math.sin(vAngle) * INITIAL_SPEED;
      }

      const speed = Math.sqrt(vel[ivx] * vel[ivx] + vel[ivy] * vel[ivy]);
      const t = Math.min(speed / 0.15, 1);
      if (t < 0.5) {
        COLOR_TEMP.copy(COLOR_SLOW).lerp(COLOR_MID, t / 0.5);
      } else {
        COLOR_TEMP.copy(COLOR_MID).lerp(COLOR_FAST, (t - 0.5) / 0.5);
      }
      col[ix] = COLOR_TEMP.r;
      col[iy] = COLOR_TEMP.g;
      col[i * 3 + 2] = COLOR_TEMP.b;
    }

    const geom = pointsRef.current.geometry;
    geom.attributes.position.needsUpdate = true;
    geom.attributes.color.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} renderOrder={3}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={PARTICLE_COUNT} itemSize={3} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} count={PARTICLE_COUNT} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.04} vertexColors transparent opacity={0.85} depthTest={false} sizeAttenuation />
    </points>
  );
}

function Scene() {
  const wellPosition = useRef(new THREE.Vector2(0, 0));

  const handlePointerMove = useCallback((e: { point: THREE.Vector3 }) => {
    wellPosition.current.set(e.point.x, e.point.y);
  }, []);

  return (
    <group onPointerMove={handlePointerMove}>
      <mesh visible={false}>
        <planeGeometry args={[40, 40]} />
        <meshBasicMaterial />
      </mesh>
      <TrailFade />
      <Particles wellPosition={wellPosition} />
      <GravityWell position={wellPosition} />
    </group>
  );
}

export function GravityAttractorDemo() {
  return (
    <div className="h-full w-full">
      <Canvas
        orthographic
        camera={{ zoom: 60, position: [0, 0, 10], near: 0.1, far: 100 }}
        gl={{ alpha: false, antialias: false, autoClear: false }}
        style={{ background: "#050510" }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color("#050510"), 1);
        }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
