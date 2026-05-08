import * as THREE from "three";
import { makeGrainNormalMap } from "./grain";
import { CABLE_ORANGE } from "./palette";

const GRAIN_PROFILE: Record<
  string,
  {
    repeat: number;
    normalScale: number;
    envMapIntensity: number;
    clearcoat?: number;
  }
> = {
  GC_PlasticBody: { repeat: 16, normalScale: 0.32, envMapIntensity: 0.22 },
  GC_Button: { repeat: 12, normalScale: 0.26, envMapIntensity: 0.28 },
  GC_Orange: { repeat: 11, normalScale: 0.20, envMapIntensity: 0.22 },
  GC_Green: { repeat: 11, normalScale: 0.20, envMapIntensity: 0.22 },
  GC_PlasticDark: { repeat: 14, normalScale: 0.24, envMapIntensity: 0.2 },
};

export function applyTexturedMaterials(root: THREE.Object3D) {
  const grain = makeGrainNormalMap(256, 32, 11);

  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;

    if (mesh.geometry?.attributes.uv && !mesh.geometry.attributes.tangent) {
      try {
        mesh.geometry.computeTangents();
      } catch {}
    }

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const m = mesh.material;
    if (!m || Array.isArray(m)) return;
    const std = m as THREE.MeshStandardMaterial;
    if (!std.isMeshStandardMaterial) return;

    if (std.name === "GC_Orange") std.color.set(CABLE_ORANGE);
    if (std.name === "GC_PlasticBody") std.color.set("#d6cfc4");
    if (std.name === "GC_Button") std.color.set("#dcd5ca");

    const profile = GRAIN_PROFILE[std.name];

    if (profile?.clearcoat) {
      const physical = new THREE.MeshPhysicalMaterial({
        color: std.color.clone(),
        roughness: std.roughness,
        metalness: std.metalness,
        envMapIntensity: profile.envMapIntensity,
        clearcoat: profile.clearcoat,
        clearcoatRoughness: 0.4,
      });
      physical.name = std.name;
      const tex = grain.clone();
      tex.needsUpdate = true;
      tex.repeat.set(profile.repeat, profile.repeat);
      physical.normalMap = tex;
      physical.normalScale = new THREE.Vector2(profile.normalScale, profile.normalScale);
      mesh.material = physical;
      return;
    }

    if (profile) {
      const tex = grain.clone();
      tex.needsUpdate = true;
      tex.repeat.set(profile.repeat, profile.repeat);
      std.normalMap = tex;
      std.normalScale = new THREE.Vector2(profile.normalScale, profile.normalScale);
      std.envMapIntensity = profile.envMapIntensity;
    } else if (std.name === "GC_Metal") {
      std.envMapIntensity = 1.1;
    } else if (std.name === "GC_Screen") {
      std.envMapIntensity = 1.4;
    } else if (std.name === "GC_HoleInterior") {
      std.color.set("#0a0c0d");
      std.roughness = 0.55;
      std.metalness = 0.0;
      std.envMapIntensity = 0.05;
    }

    std.needsUpdate = true;
  });
}
