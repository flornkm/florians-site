import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const STEP_COUNT = 60;
const HELIX_RADIUS = 1.2;
const HEIGHT_STEP = 0.15;
const ANGLE_STEP = (Math.PI * 2) / 20;
const TOTAL_HEIGHT = STEP_COUNT * HEIGHT_STEP;
const SPHERE_RADIUS = 0.08;
const RUNG_RADIUS = 0.02;

const COLOR_CYAN = new THREE.Color("#00e5ff");
const COLOR_LIME = new THREE.Color("#39ff14");
const COLOR_RUNG = new THREE.Color("#aaaaaa");

interface StrandSphere {
  position: THREE.Vector3;
  color: THREE.Color;
}

interface Rung {
  start: THREE.Vector3;
  end: THREE.Vector3;
}

function buildHelixData() {
  const spheres: StrandSphere[] = [];
  const rungs: Rung[] = [];

  for (let i = 0; i < STEP_COUNT; i++) {
    const angle = i * ANGLE_STEP;
    const y = i * HEIGHT_STEP - TOTAL_HEIGHT / 2;

    const ax = Math.sin(angle) * HELIX_RADIUS;
    const az = Math.cos(angle) * HELIX_RADIUS;
    const posA = new THREE.Vector3(ax, y, az);

    const bx = Math.sin(angle + Math.PI) * HELIX_RADIUS;
    const bz = Math.cos(angle + Math.PI) * HELIX_RADIUS;
    const posB = new THREE.Vector3(bx, y, bz);

    spheres.push({ position: posA, color: COLOR_CYAN });
    spheres.push({ position: posB, color: COLOR_LIME });

    if (i % 3 === 0) {
      rungs.push({ start: posA, end: posB });
    }
  }

  return { spheres, rungs };
}

function Helix() {
  const groupRef = useRef<THREE.Group>(null);
  const mouseXRef = useRef(0);
  const { gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    const container = canvas.parentElement;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseXRef.current = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    };

    const handleMouseLeave = () => {
      mouseXRef.current = 0;
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [gl]);

  const { spheres, rungs } = useMemo(() => buildHelixData(), []);

  const sphereGeometry = useMemo(() => new THREE.SphereGeometry(SPHERE_RADIUS, 12, 12), []);

  const rungMeshes = useMemo(() => {
    return rungs.map((rung) => {
      const mid = new THREE.Vector3().addVectors(rung.start, rung.end).multiplyScalar(0.5);
      const dir = new THREE.Vector3().subVectors(rung.end, rung.start);
      const length = dir.length();
      const orientation = new THREE.Quaternion();
      orientation.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
      return { mid, length, orientation };
    });
  }, [rungs]);

  const rungGeometry = useMemo(() => new THREE.CylinderGeometry(RUNG_RADIUS, RUNG_RADIUS, 1, 6, 1), []);

  const instancedRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (!instancedRef.current) return;
    const mesh = instancedRef.current;
    const colorAttr = new Float32Array(spheres.length * 3);

    for (let i = 0; i < spheres.length; i++) {
      const s = spheres[i];
      dummy.position.copy(s.position);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      colorAttr[i * 3] = s.color.r;
      colorAttr[i * 3 + 1] = s.color.g;
      colorAttr[i * 3 + 2] = s.color.b;
    }

    mesh.instanceMatrix.needsUpdate = true;
    mesh.geometry.setAttribute("color", new THREE.InstancedBufferAttribute(colorAttr, 3));
  }, [spheres, dummy]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const speed = 0.3 + mouseXRef.current * 0.5;
    groupRef.current.rotation.y += delta * speed;
    groupRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.15;
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={instancedRef} args={[sphereGeometry, undefined, spheres.length]}>
        <meshStandardMaterial vertexColors toneMapped={false} emissive="#ffffff" emissiveIntensity={0.4} />
      </instancedMesh>

      {rungMeshes.map((rung, i) => (
        <mesh key={i} position={rung.mid} quaternion={rung.orientation} scale={[1, rung.length, 1]}>
          <primitive object={rungGeometry} attach="geometry" />
          <meshStandardMaterial color={COLOR_RUNG} transparent opacity={0.35} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

export const DnaHelixDemo = () => {
  return (
    <div className="h-full w-full">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        gl={{ antialias: true }}
        style={{ background: "#050510" }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[3, 4, 5]} intensity={40} color="#00e5ff" />
        <pointLight position={[-3, -2, 4]} intensity={30} color="#39ff14" />
        <Helix />
      </Canvas>
    </div>
  );
};
