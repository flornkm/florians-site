import { useLoader } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { STLLoader as ThreeSTLLoader } from "three-stdlib";

interface STLLoaderProps {
  src: string;
  metalType?: "steel" | "aluminum" | "copper" | "gold" | "chrome" | "titanium";
}

// Metal material presets - brighter and more reflective
const METAL_PRESETS = {
  steel: { color: "#D4D8E0", metalness: 0.9, roughness: 0.1 },
  aluminum: { color: "#F5F5F5", metalness: 0.95, roughness: 0.05 },
  copper: { color: "#D2691E", metalness: 0.9, roughness: 0.15 },
  gold: { color: "#FFE55C", metalness: 0.9, roughness: 0.03 },
  chrome: { color: "#E8E8E8", metalness: 0.95, roughness: 0.01 },
  titanium: { color: "#B8B8B8", metalness: 0.85, roughness: 0.2 },
};

export function STLLoader({ src, metalType = "steel" }: STLLoaderProps) {
  const geometry = useLoader(ThreeSTLLoader, src);
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (geometry && meshRef.current) {
      // Center the geometry
      geometry.computeBoundingBox();
      const bbox = geometry.boundingBox;
      if (bbox) {
        const center = bbox.getCenter(new THREE.Vector3());
        geometry.translate(-center.x, -center.y, -center.z);
      }

      // Compute normals for proper lighting
      geometry.computeVertexNormals();

      // Scale to fit in view
      const size = bbox ? bbox.getSize(new THREE.Vector3()) : new THREE.Vector3(1, 1, 1);
      const maxDimension = Math.max(size.x, size.y, size.z);
      const scale = 3 / maxDimension; // Scale to fit in a 3-unit cube
      meshRef.current.scale.setScalar(scale);
    }
  }, [geometry]);

  const metalPreset = METAL_PRESETS[metalType];

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial
        color={metalPreset.color}
        metalness={metalPreset.metalness}
        roughness={metalPreset.roughness}
        side={THREE.DoubleSide}
        envMapIntensity={0.8}
      />
    </mesh>
  );
}
