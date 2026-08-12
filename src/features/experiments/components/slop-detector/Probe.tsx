import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { bodyState } from "./lib/bodyState";
import { useContainer } from "./lib/container";
import { stepReading } from "./lib/reading";
import { useStore } from "./lib/store";

const FOLLOW = 0.22;
const ROT_FOLLOW = 0.2;
const PROBE_Y = 0.014;
const REST_ANGLE = Math.PI;
const ATTACHED_Z = -0.02;
const SLIDE_EASE = 0.06;
const SETTLED_THRESHOLD = 0.0008;

const BODY_HALF_X = 0.053;
const BODY_HALF_Z = 0.033;
const PROBE_HALF_LEN = 0.058;
const PROBE_RADIUS = 0.014;

export function Probe({ node }: { node: THREE.Object3D }) {
  const { camera, gl } = useThree();
  const container = useContainer();
  const setReading = useStore((s) => s.setReading);

  const rest = useMemo(() => {
    node.rotation.set(0, REST_ANGLE, 0);
    return new THREE.Vector3(0, PROBE_Y, -0.085);
  }, [node]);

  const target = useRef(new THREE.Vector3());
  const settled = useRef(false);

  useMemo(() => {
    const startX = bodyState.offsetX;
    const startZ = bodyState.offsetZ + ATTACHED_Z;
    node.position.set(startX, PROBE_Y, startZ);
    target.current.set(startX, PROBE_Y, startZ);
  }, [node]);

  const dragging = useRef(false);
  const offset = useRef(new THREE.Vector3());
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -PROBE_Y), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const ndc = useMemo(() => new THREE.Vector2(), []);
  const hit = useMemo(() => new THREE.Vector3(), []);
  const localHit = useMemo(() => new THREE.Vector3(), []);
  const reading = useRef(0);

  const setNDC = (e: PointerEvent) => {
    const rect = gl.domElement.getBoundingClientRect();
    ndc.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );
  };

  const toLocal = (worldPoint: THREE.Vector3) => {
    localHit.copy(worldPoint);
    if (node.parent) node.parent.worldToLocal(localHit);
    return localHit;
  };

  const clampOutsideBody = (v: THREE.Vector3) => {
    const yaw = node.rotation.y;
    const dirX = Math.abs(Math.cos(yaw));
    const dirZ = Math.abs(Math.sin(yaw));
    const probeHalfX = PROBE_HALF_LEN * dirX + PROBE_RADIUS * dirZ;
    const probeHalfZ = PROBE_HALF_LEN * dirZ + PROBE_RADIUS * dirX;
    const effHalfX = BODY_HALF_X + probeHalfX;
    const effHalfZ = BODY_HALF_Z + probeHalfZ;
    const overlapX = effHalfX - Math.abs(v.x);
    const overlapZ = effHalfZ - Math.abs(v.z);
    if (overlapX > 0 && overlapZ > 0) {
      if (overlapX < overlapZ) {
        v.x = (v.x >= 0 ? 1 : -1) * effHalfX;
      } else {
        v.z = (v.z >= 0 ? 1 : -1) * effHalfZ;
      }
    }
  };

  useEffect(() => {
    const targetEl = container ?? gl.domElement;
    let prevCursor = "";
    let cursorOverride = false;

    const setCursor = (c: string | null) => {
      if (c === null) {
        if (cursorOverride) {
          document.body.style.cursor = prevCursor;
          cursorOverride = false;
        }
        return;
      }
      if (!cursorOverride) {
        prevCursor = document.body.style.cursor;
        cursorOverride = true;
      }
      document.body.style.cursor = c;
    };

    const onDown = (e: PointerEvent) => {
      setNDC(e);
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObject(node, true);
      if (hits.length === 0) return;
      e.stopPropagation();
      e.preventDefault();
      dragging.current = true;
      useStore.getState().setDragging(true);
      setCursor("grabbing");
      const local = toLocal(hits[0].point).clone();
      offset.current.copy(node.position).sub(local);
    };
    const onMove = (e: PointerEvent) => {
      if (dragging.current) {
        e.stopPropagation();
        e.preventDefault();
        setNDC(e);
        raycaster.setFromCamera(ndc, camera);
        if (!raycaster.ray.intersectPlane(plane, hit)) return;
        const local = toLocal(hit);
        target.current.set(local.x + offset.current.x, PROBE_Y, local.z + offset.current.z);
        clampOutsideBody(target.current);
        return;
      }
      setNDC(e);
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObject(node, true);
      setCursor(hits.length > 0 ? "grab" : null);
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging.current) return;
      dragging.current = false;
      useStore.getState().setDragging(false);
      e.stopPropagation();
      e.preventDefault();
      setCursor(null);
      target.current.copy(rest);
    };
    targetEl.addEventListener("pointerdown", onDown, true);
    targetEl.addEventListener("pointermove", onMove, true);
    targetEl.addEventListener("pointerup", onUp, true);
    targetEl.addEventListener("pointercancel", onUp, true);
    return () => {
      setCursor(null);
      targetEl.removeEventListener("pointerdown", onDown, true);
      targetEl.removeEventListener("pointermove", onMove, true);
      targetEl.removeEventListener("pointerup", onUp, true);
      targetEl.removeEventListener("pointercancel", onUp, true);
    };
  }, [camera, gl, node, plane, raycaster, rest, container]);

  const lastPos = useMemo(() => new THREE.Vector3(), []);
  const velocity = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    node.visible = true;

    const prevX = node.position.x;
    const prevZ = node.position.z;

    if (!settled.current && !dragging.current) {
      node.position.x += (rest.x - node.position.x) * SLIDE_EASE;
      node.position.z += (rest.z - node.position.z) * SLIDE_EASE;
      node.position.y = PROBE_Y;

      if (
        Math.abs(rest.x - node.position.x) < SETTLED_THRESHOLD &&
        Math.abs(rest.z - node.position.z) < SETTLED_THRESHOLD
      ) {
        node.position.copy(rest);
        settled.current = true;
        target.current.copy(rest);
      }
    } else {
      if (!dragging.current) target.current.copy(rest);
      node.position.lerp(target.current, FOLLOW);
    }

    velocity.set(node.position.x - prevX, 0, node.position.z - prevZ);
    lastPos.copy(node.position);

    const t = clock.getElapsedTime();
    const px = node.position.x;
    const pz = node.position.z;

    let yawTarget: number;
    if (dragging.current) {
      yawTarget = Math.atan2(-pz, px);
    } else {
      yawTarget = REST_ANGLE + Math.sin(t * 0.55) * 0.05 + Math.sin(t * 1.13 + 1.7) * 0.025;
    }
    let diff = yawTarget - node.rotation.y;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    node.rotation.y += diff * ROT_FOLLOW;

    if (dragging.current) {
      const VEL_TILT = 32;
      const sway = Math.sin(t * 1.6) * 0.05 + Math.sin(t * 0.9 + 1.3) * 0.03;
      const tiltZTarget = THREE.MathUtils.clamp(-velocity.x * VEL_TILT, -0.7, 0.7);
      const tiltXTarget = THREE.MathUtils.clamp(velocity.z * VEL_TILT, -0.7, 0.7) + sway;
      node.rotation.z += (tiltZTarget - node.rotation.z) * 0.28;
      node.rotation.x += (tiltXTarget - node.rotation.x) * 0.28;
    } else {
      const rollTarget = Math.sin(t * 0.43 + 0.6) * 0.018;
      const pitchTarget = Math.sin(t * 0.71 + 2.2) * 0.022;
      node.rotation.x += (rollTarget - node.rotation.x) * 0.07;
      node.rotation.z += (pitchTarget - node.rotation.z) * 0.07;
    }

    if (useStore.getState().powered) {
      const aiRating = useStore.getState().aiRating;
      const jitter = aiRating > 0.05 ? (Math.random() - 0.5) * 0.04 : 0;
      const targetReading = Math.max(0, Math.min(1, aiRating + jitter));
      reading.current = stepReading(reading.current, targetReading);
      setReading(reading.current);
    } else if (reading.current !== 0) {
      reading.current *= 0.85;
      if (reading.current < 0.005) reading.current = 0;
      setReading(reading.current);
    }
  });

  return null;
}
