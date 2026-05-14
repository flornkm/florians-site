import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { FlowRef } from "./types";

const MODEL_URL = "/models/trash-bin.glb";
useGLTF.preload(MODEL_URL);

export const BIN_SCALE = 1.5;
export const BIN_HEIGHT = 0.3 * BIN_SCALE;
export const BIN_RESTING_Y = -0.62;
export const BIN_HIDDEN_Y = -1.6;
export const BIN_MOUTH_Y = BIN_RESTING_Y + BIN_HEIGHT;
export const BIN_MOUTH_RADIUS = 0.122 * BIN_SCALE + 0.05;
export const BIN_FLOOR_Y = BIN_RESTING_Y + 0.01;

function tuneAeroMaterials(root: THREE.Object3D) {
  // The exported glTF gives us metallic/transmission materials that go dark
  // without an environment map. We rebuild as MeshStandardMaterial tuned to
  // look right under directional lights only (no envmap).
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    const name = (mesh.name || "").toLowerCase();
    let mat: THREE.MeshStandardMaterial;
    if (name.includes("body")) {
      mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color("#cbe5ff"),
        metalness: 0.0,
        roughness: 0.06,
        emissive: new THREE.Color("#9cd0ff"),
        emissiveIntensity: 0.55,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
    } else if (name.includes("recycle")) {
      mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color("#1454d2"),
        metalness: 0.0,
        roughness: 0.42,
        emissive: new THREE.Color("#3a8aff"),
        emissiveIntensity: 0.7,
      });
    } else {
      mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color("#f0f4f9"),
        metalness: 0.2,
        roughness: 0.14,
        emissive: new THREE.Color("#bcc8d6"),
        emissiveIntensity: 0.4,
      });
    }
    mesh.material = mat;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
  });
}

export function Bin({ flow }: { flow: FlowRef }) {
  const { scene } = useGLTF(MODEL_URL);
  const ref = useRef<THREE.Group>(null);
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    tuneAeroMaterials(c);
    return c;
  }, [scene]);

  useFrame(() => {
    const f = flow.current;
    const wantsVisible = f.phase !== "flat";
    const target = wantsVisible ? 1 : 0;
    f.binProgress += (target - f.binProgress) * 0.07;
    if (ref.current) {
      const y = BIN_HIDDEN_Y + (BIN_RESTING_Y - BIN_HIDDEN_Y) * f.binProgress;
      ref.current.position.y = y;
      ref.current.scale.setScalar(BIN_SCALE);
      ref.current.visible = f.binProgress > 0.002;
    }
  });

  return <primitive object={cloned} ref={ref} />;
}
