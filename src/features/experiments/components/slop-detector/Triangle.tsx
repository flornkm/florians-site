import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useStore } from "./lib/store";

const X_LEFT = -0.038;
const X_RIGHT = -0.012;
const FOLLOW = 0.18;

export function Triangle({ node }: { node: THREE.Object3D }) {
  useFrame(() => {
    const state = useStore.getState();
    const r = state.powered ? state.reading : 0;
    const target = X_LEFT + (X_RIGHT - X_LEFT) * r;
    node.position.x += (target - node.position.x) * FOLLOW;
    node.rotation.y = 0;
  });
  return null;
}
