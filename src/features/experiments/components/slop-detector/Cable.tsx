import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { Line2 } from "three-stdlib";
import { CABLE_ORANGE } from "./lib/palette";
import { VerletRope } from "./lib/verletRope";

const N = 28;

export function Cable({
  from,
  to,
}: {
  from: THREE.Object3D | null;
  to: THREE.Object3D | null;
}) {
  const ref = useRef<Line2>(null!);
  const a = useMemo(() => new THREE.Vector3(), []);
  const b = useMemo(() => new THREE.Vector3(), []);
  const initial = useMemo(
    () => Array.from({ length: N }, (_, i) => new THREE.Vector3(i * 0.001, 0, 0)),
    [],
  );
  const rope = useMemo(() => new VerletRope(N, 0.22), []);
  const initialized = useRef(false);

  useFrame(() => {
    if (!from || !to || !ref.current) return;
    from.getWorldPosition(a);
    to.getWorldPosition(b);
    const parent = ref.current.parent;
    if (parent) {
      parent.worldToLocal(a);
      parent.worldToLocal(b);
    }
    const direct = a.distanceTo(b);
    rope.setLength(Math.max(direct + 0.022, direct * 1.06));

    if (!initialized.current) {
      rope.init(a.x, a.y, a.z, b.x, b.y, b.z);
      initialized.current = true;
    }
    rope.step(a.x, a.y, a.z, b.x, b.y, b.z);
    ref.current.geometry.setPositions(rope.pos);
  });

  return <Line ref={ref} points={initial} color={CABLE_ORANGE} lineWidth={4.4} />;
}
