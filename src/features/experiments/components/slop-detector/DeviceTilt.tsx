import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { bodyState } from "./lib/bodyState";
import { useStore } from "./lib/store";

const TILT_Z = 0.045;
const TILT_Y = -0.012;
const TILT_X_REST = -0.025;
const PUSH_MAX = 0.04;
const SPRING_K = 0.06;
const DAMPING = 0.92;
const PUSH_IMPULSE = -0.55;

const INITIAL_OFFSET_X = 0.1;
const DOCK_EASE = 0.06;
const DOCKED_THRESHOLD = 0.0008;

const YAW_PER_OFFSET_X = 6.5;
const PITCH_PER_OFFSET_Z = -5.5;
const MAX_YAW = 0.55;
const MAX_OFFSET_PITCH = 0.4;

export function DeviceTilt({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null!);

  const wasPowered = useRef(false);
  const x = useRef(0);
  const v = useRef(0);

  const offX = useRef(INITIAL_OFFSET_X);
  const offZ = useRef(0);
  const docked = useRef(false);

  bodyState.dragStarted = true;

  useFrame(() => {
    const powered = useStore.getState().powered;
    if (powered !== wasPowered.current) {
      wasPowered.current = powered;
      v.current = PUSH_IMPULSE;
    }
    v.current += -x.current * SPRING_K;
    v.current *= DAMPING;
    x.current += v.current;

    if (!docked.current) {
      offX.current += (0 - offX.current) * DOCK_EASE;
      offZ.current += (0 - offZ.current) * DOCK_EASE;

      if (
        Math.abs(offX.current) < DOCKED_THRESHOLD &&
        Math.abs(offZ.current) < DOCKED_THRESHOLD
      ) {
        offX.current = 0;
        offZ.current = 0;
        docked.current = true;
        useStore.getState().setBodyDocked(true);
      }
    }

    bodyState.offsetX = offX.current;
    bodyState.offsetZ = offZ.current;

    if (ref.current) {
      const yawFromOffset = THREE.MathUtils.clamp(
        offX.current * YAW_PER_OFFSET_X,
        -MAX_YAW,
        MAX_YAW,
      );
      const pitchFromOffset = THREE.MathUtils.clamp(
        offZ.current * PITCH_PER_OFFSET_Z,
        -MAX_OFFSET_PITCH,
        MAX_OFFSET_PITCH,
      );

      ref.current.position.x = offX.current;
      ref.current.position.z = offZ.current;
      ref.current.rotation.x =
        TILT_X_REST + x.current * PUSH_MAX + pitchFromOffset;
      ref.current.rotation.y = TILT_Y + yawFromOffset;
      ref.current.rotation.z = TILT_Z;
    }
  });

  return (
    <group
      ref={ref}
      position={[INITIAL_OFFSET_X, 0, 0]}
      rotation={[TILT_X_REST, TILT_Y, TILT_Z]}
    >
      {children}
    </group>
  );
}
