import { Line, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const LINE_COUNT = 24;
const POINTS_PER_LINE = 120;
const MAGNET_HALF_LENGTH = 0.6;
const SEED_THETA = 0.12;
const EQUATOR_RADIUS = 3.2;

function traceFieldLine(phi: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const r0 = EQUATOR_RADIUS;

  for (let i = 0; i <= POINTS_PER_LINE; i++) {
    const theta = SEED_THETA + ((Math.PI - 2 * SEED_THETA) * i) / POINTS_PER_LINE;
    const sinT = Math.sin(theta);
    const r = r0 * sinT * sinT;
    const x = r * sinT * Math.cos(phi);
    const y = r * Math.cos(theta);
    const z = r * sinT * Math.sin(phi);
    points.push(new THREE.Vector3(x, y, z));
  }

  return points;
}

function colorForLine(pointCount: number): THREE.Color[] {
  const colors: THREE.Color[] = [];
  const warmPole = new THREE.Color("#ff6030");
  const coolMid = new THREE.Color("#30a0ff");
  const temp = new THREE.Color();

  for (let i = 0; i <= pointCount; i++) {
    const t = i / pointCount;
    const blend = Math.sin(t * Math.PI);
    temp.copy(warmPole).lerp(coolMid, blend);
    colors.push(temp.clone());
  }

  return colors;
}

function FieldLines() {
  const groupRef = useRef<THREE.Group>(null);

  const lines = useMemo(() => {
    const result: { points: THREE.Vector3[]; colors: THREE.Color[] }[] = [];
    for (let i = 0; i < LINE_COUNT; i++) {
      const phi = (i / LINE_COUNT) * Math.PI * 2;
      const points = traceFieldLine(phi);
      const colors = colorForLine(POINTS_PER_LINE);
      result.push({ points, colors });
    }
    return result;
  }, []);

  return (
    <group ref={groupRef}>
      {lines.map((line, i) => (
        <Line
          key={i}
          points={line.points}
          vertexColors={line.colors}
          lineWidth={1.5}
          transparent
          opacity={0.85}
        />
      ))}
    </group>
  );
}

function BarMagnet() {
  const northMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#e03030", roughness: 0.3, metalness: 0.6 }), []);
  const southMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3060e0", roughness: 0.3, metalness: 0.6 }), []);

  return (
    <group>
      <mesh position={[0, MAGNET_HALF_LENGTH / 2, 0]} material={northMat}>
        <capsuleGeometry args={[0.18, MAGNET_HALF_LENGTH, 8, 16]} />
      </mesh>
      <mesh position={[0, -MAGNET_HALF_LENGTH / 2, 0]} material={southMat}>
        <capsuleGeometry args={[0.18, MAGNET_HALF_LENGTH, 8, 16]} />
      </mesh>
    </group>
  );
}

function AutoRotate() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
  });

  return (
    <group ref={groupRef}>
      <BarMagnet />
      <FieldLines />
    </group>
  );
}

function Scene() {
  return (
    <>
      <color attach="background" args={["#0a0a0f"]} />
      <fog attach="fog" args={["#0a0a0f", 8, 18]} />
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-3, -3, 2]} intensity={0.4} color="#6080ff" />
      <AutoRotate />
      <OrbitControls enableZoom={false} enablePan={false} dampingFactor={0.1} />
    </>
  );
}

export function MagneticFieldDemo() {
  return (
    <div className="h-full w-full">
      <Canvas camera={{ position: [0, 2.5, 6], fov: 50, near: 0.1, far: 50 }} gl={{ antialias: true }}>
        <Scene />
      </Canvas>
    </div>
  );
}
