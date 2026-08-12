import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useContainer } from "./lib/container";
import { useStore } from "./lib/store";

const PRESS_DEPTH = 0.0009;

export function PowerButton({ node }: { node: THREE.Object3D }) {
  const { camera, gl } = useThree();
  const togglePower = useStore((s) => s.togglePower);
  const container = useContainer();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const ndc = useMemo(() => new THREE.Vector2(), []);
  const restY = useRef(node.position.y);
  const press = useRef(0);

  useEffect(() => {
    restY.current = node.position.y;
  }, [node]);

  useEffect(() => {
    const target = container ?? gl.domElement;
    const onDown = (e: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      ndc.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObject(node, true);
      if (hits.length === 0) return;
      e.stopPropagation();
      e.preventDefault();
      togglePower();
    };
    target.addEventListener("pointerdown", onDown, true);
    return () => target.removeEventListener("pointerdown", onDown, true);
  }, [camera, gl, node, raycaster, ndc, togglePower, container]);

  useFrame(() => {
    const target = useStore.getState().powered ? 1 : 0;
    press.current += (target - press.current) * 0.18;
    node.position.y = restY.current - press.current * PRESS_DEPTH;
  });

  return null;
}
