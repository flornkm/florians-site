import type * as THREE from "three";

export type Phase = "flat" | "ball" | "disposed";

export interface GrabState {
  active: boolean;
  idx: number;
  plane: THREE.Plane;
  point: THREE.Vector3;
  start: THREE.Vector3;
  influenced: { idx: number; weight: number }[];
}

export interface FlowState {
  phase: Phase;
  crumpleAmount: number;
  displayedCrumple: number;
  pendingBake: boolean;
  ballPosition: THREE.Vector3;
  ballVelocity: THREE.Vector3;
  ballGrabActive: boolean;
  ballGrabOffset: THREE.Vector3;
  lastPointerPos: THREE.Vector3;
  lastPointerTime: number;
  binProgress: number;
  disposeProgress: number;
  disposedAtMs: number;
  resetAtMs: number;
}

export type GrabRef = React.MutableRefObject<GrabState>;
export type FlowRef = React.MutableRefObject<FlowState>;
