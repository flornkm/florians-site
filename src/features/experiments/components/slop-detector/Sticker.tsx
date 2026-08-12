import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const STICKER_URL = "/images/experiments/slop-detector-sticker.png";

type Props = {
  bodyRoot: THREE.Object3D | null;
  position?: [number, number, number];
  size?: number;
  tilt?: number;
  segments?: number;
  lift?: number;
};

export function Sticker({
  bodyRoot,
  position = [0.042, 0.0192, -0.024],
  size = 0.014,
  tilt = 0.18,
  segments = 32,
  lift = 0.0002,
}: Props) {
  const texture = useTexture(STICKER_URL);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  const groupRef = useRef<THREE.Group>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);
  const installed = useRef(false);

  const matRef = useRef<THREE.MeshPhysicalMaterial>(null!);
  useFrame(({ clock }) => {
    if (matRef.current) {
      const t = clock.getElapsedTime();
      matRef.current.clearcoatRoughness = 0.1 + Math.sin(t * 0.6) * 0.03;
    }

    if (installed.current) return;
    if (!bodyRoot || !groupRef.current || !meshRef.current) return;

    let top: THREE.Object3D = bodyRoot;
    while (top.parent) top = top.parent;
    top.updateMatrixWorld(true);
    groupRef.current.updateMatrixWorld(true);

    const ray = new THREE.Raycaster();
    const tmp = new THREE.Vector3();
    const worldNormal = new THREE.Vector3(0, 1, 0)
      .transformDirection(bodyRoot.matrixWorld)
      .normalize();
    const worldDown = worldNormal.clone().negate();

    const bbox = new THREE.Box3().setFromObject(bodyRoot);
    const bodyCenter = bbox.getCenter(new THREE.Vector3());

    const groupMatrixInv = new THREE.Matrix4().copy(groupRef.current.matrixWorld).invert();

    const verts: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    let anyHit = false;

    for (let j = 0; j <= segments; j++) {
      for (let i = 0; i <= segments; i++) {
        const u = i / segments;
        const v = j / segments;
        const vx = (u - 0.5) * size;
        const vy = (v - 0.5) * size;

        tmp.set(vx, vy, 0);
        groupRef.current.localToWorld(tmp);

        const origin = tmp.clone().add(worldNormal.clone().multiplyScalar(0.5));
        ray.set(origin, worldDown);
        ray.far = 2;
        let hits = ray.intersectObject(bodyRoot, true);

        if (!hits.length) {
          const dir = bodyCenter.clone().sub(tmp).normalize();
          const back = tmp.clone().sub(dir.clone().multiplyScalar(0.5));
          ray.set(back, dir);
          ray.far = 2;
          hits = ray.intersectObject(bodyRoot, true);
        }

        let fx = vx;
        let fy = vy;
        let fz = 0;
        if (hits.length) {
          const hit = hits[0];
          const hitLocal = groupRef.current.worldToLocal(hit.point.clone());

          const nWorld = (hit.face?.normal.clone() ?? new THREE.Vector3(0, 1, 0))
            .transformDirection((hit.object as THREE.Mesh).matrixWorld)
            .normalize();
          const nLocal = nWorld.clone().transformDirection(groupMatrixInv).normalize();

          fx = hitLocal.x + nLocal.x * lift;
          fy = hitLocal.y + nLocal.y * lift;
          fz = hitLocal.z + nLocal.z * lift;
          anyHit = true;
        }

        verts.push(fx, fy, fz);
        uvs.push(u, v);
      }
    }

    if (!anyHit) return;

    for (let j = 0; j < segments; j++) {
      for (let i = 0; i < segments; i++) {
        const a = j * (segments + 1) + i;
        const b = a + 1;
        const c = a + (segments + 1);
        const d = c + 1;
        indices.push(a, b, c, b, d, c);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    meshRef.current.geometry.dispose();
    meshRef.current.geometry = geo;
    installed.current = true;
  });

  return (
    <group ref={groupRef} position={position} rotation={[-Math.PI / 2, 0, tilt]}>
      <mesh ref={meshRef} renderOrder={4} castShadow receiveShadow={false}>
        <planeGeometry args={[size, size, 1, 1]} />
        <meshPhysicalMaterial
          ref={matRef}
          map={texture}
          transparent
          alphaTest={0.05}
          side={THREE.DoubleSide}
          roughness={0.22}
          metalness={0}
          clearcoat={0.95}
          clearcoatRoughness={0.12}
          sheen={0.3}
          sheenColor={new THREE.Color(0xffffff)}
          sheenRoughness={0.4}
          envMapIntensity={1.4}
        />
      </mesh>
    </group>
  );
}
