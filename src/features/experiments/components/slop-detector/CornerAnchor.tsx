import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const MARGIN_PX = 36;
const BODY_HALF_X = 0.05;
const BODY_HALF_Z = 0.03;

export function CornerAnchor({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null!);
  const { camera, size } = useThree();

  useFrame(() => {
    if (!ref.current) return;
    if (!(camera instanceof THREE.OrthographicCamera)) return;
    const halfW = size.width / camera.zoom / 2;
    const halfH = size.height / camera.zoom / 2;
    const px = MARGIN_PX / camera.zoom;
    ref.current.position.x = halfW - BODY_HALF_X - px;
    ref.current.position.z = halfH - BODY_HALF_Z - px;
  });

  return <group ref={ref}>{children}</group>;
}
