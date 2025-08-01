import { useLoader } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OBJLoader as ThreeOBJLoader } from "three-stdlib";

interface OBJLoaderProps {
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

export function OBJLoader({ src, metalType = "steel" }: OBJLoaderProps) {
  const obj = useLoader(ThreeOBJLoader, src);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (obj && groupRef.current) {
      // Calculate bounding box
      const bbox = new THREE.Box3().setFromObject(obj);
      const center = bbox.getCenter(new THREE.Vector3());
      const size = bbox.getSize(new THREE.Vector3());

      // Center the object
      obj.position.sub(center);

      // Scale to fit in view
      const maxDimension = Math.max(size.x, size.y, size.z);
      const scale = 3 / maxDimension; // Scale to fit in a 3-unit cube
      obj.scale.setScalar(scale);

      const metalPreset = METAL_PRESETS[metalType];

      // Apply materials to all meshes
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: metalPreset.color,
            metalness: metalPreset.metalness,
            roughness: metalPreset.roughness,
            side: THREE.DoubleSide,
            envMapIntensity: 0.8,
          });

          // Compute normals for proper lighting
          if (child.geometry) {
            child.geometry.computeVertexNormals();
          }
        }
      });

      // Clear any existing children and add the loaded object
      while (groupRef.current.children.length > 0) {
        groupRef.current.remove(groupRef.current.children[0]);
      }
      groupRef.current.add(obj);
    }
  }, [obj, metalType]);

  return <group ref={groupRef} />;
}
