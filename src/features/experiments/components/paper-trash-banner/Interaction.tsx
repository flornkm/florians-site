import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { BIN_MOUTH_RADIUS } from "./Bin";
import { COLS, CRUMPLE_PROMOTE, ROWS, computeInfluenced } from "./physics";
import type { FlowRef, GrabRef } from "./types";

const BALL_GRAB_RADIUS = 0.22;

export function Interaction({ grab, flow }: { grab: GrabRef; flow: FlowRef }) {
  const { camera, gl, scene } = useThree();
  const paperMeshRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    const canvas = gl.domElement;
    const ndc = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const tmp = new THREE.Vector3();
    const planeZ0 = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    const findPaper = () => {
      if (paperMeshRef.current && paperMeshRef.current.parent) return paperMeshRef.current;
      let found: THREE.Mesh | null = null;
      scene.traverse((obj) => {
        if (found) return;
        if (
          obj instanceof THREE.Mesh &&
          obj.geometry?.getAttribute("position")?.count === COLS * ROWS
        ) {
          found = obj;
        }
      });
      paperMeshRef.current = found;
      return found;
    };

    const toNDC = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const screenToPlaneZ = (e: PointerEvent, z: number, out: THREE.Vector3) => {
      toNDC(e);
      raycaster.setFromCamera(ndc, camera);
      planeZ0.constant = -z;
      raycaster.ray.intersectPlane(planeZ0, out);
      return out;
    };

    const findNearestVertex = (point: THREE.Vector3, mesh: THREE.Mesh) => {
      const pa = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
      const wp = new THREE.Vector3();
      let best = -1;
      let bestD = Infinity;
      for (let i = 0; i < pa.count; i++) {
        wp.set(pa.getX(i), pa.getY(i), pa.getZ(i));
        mesh.localToWorld(wp);
        const d = wp.distanceToSquared(point);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
      return best;
    };

    const onDown = (e: PointerEvent) => {
      const f = flow.current;

      if (f.phase === "flat") {
        const paper = findPaper();
        if (!paper) return;
        toNDC(e);
        raycaster.setFromCamera(ndc, camera);
        const hits = raycaster.intersectObject(paper, false);
        if (hits.length === 0) return;
        const hit = hits[0];
        const pi = findNearestVertex(hit.point, paper);
        if (pi < 0) return;
        canvas.setPointerCapture(e.pointerId);
        grab.current.active = true;
        grab.current.idx = pi;
        grab.current.point.copy(hit.point);
        grab.current.start.copy(hit.point);
        grab.current.influenced = computeInfluenced(pi);
        grab.current.plane.setFromNormalAndCoplanarPoint(
          new THREE.Vector3(0, 0, 1).applyQuaternion(camera.quaternion),
          hit.point,
        );
        return;
      }

      if (f.phase === "ball") {
        screenToPlaneZ(e, f.ballPosition.z, tmp);
        if (tmp.distanceTo(f.ballPosition) > BALL_GRAB_RADIUS) return;
        canvas.setPointerCapture(e.pointerId);
        f.ballGrabActive = true;
        f.ballGrabOffset.copy(f.ballPosition).sub(tmp);
        f.ballVelocity.set(0, 0, 0);
        f.lastPointerPos.copy(tmp);
        f.lastPointerTime = performance.now();
      }
    };

    const onMove = (e: PointerEvent) => {
      const f = flow.current;

      if (f.phase === "flat" && grab.current.active) {
        toNDC(e);
        raycaster.setFromCamera(ndc, camera);
        if (raycaster.ray.intersectPlane(grab.current.plane, tmp)) {
          grab.current.point.copy(tmp);
        }
        return;
      }

      if (f.phase === "ball" && f.ballGrabActive) {
        screenToPlaneZ(e, f.ballPosition.z, tmp);
        const now = performance.now();
        const dtMs = Math.max(8, now - f.lastPointerTime);
        const dt = dtMs / 1000;
        f.ballVelocity.set(
          (tmp.x - f.lastPointerPos.x) / dt,
          (tmp.y - f.lastPointerPos.y) / dt,
          0,
        );
        f.lastPointerPos.copy(tmp);
        f.lastPointerTime = now;
        f.ballPosition.copy(tmp).add(f.ballGrabOffset);
      }
    };

    const onUp = (e: PointerEvent) => {
      const f = flow.current;

      if (f.phase === "flat" && grab.current.active) {
        try {
          canvas.releasePointerCapture(e.pointerId);
        } catch {}
        const dragLen = grab.current.point.distanceTo(grab.current.start);
        grab.current.active = false;
        grab.current.idx = -1;
        grab.current.influenced = [];
        if (dragLen > 0.04) {
          f.crumpleAmount = Math.min(1, f.crumpleAmount + 0.08 + dragLen * 0.18);
          f.pendingBake = true;
        }
        if (f.crumpleAmount >= CRUMPLE_PROMOTE) {
          f.phase = "ball";
        }
        return;
      }

      if (f.phase === "ball" && f.ballGrabActive) {
        try {
          canvas.releasePointerCapture(e.pointerId);
        } catch {}
        f.ballGrabActive = false;
        const maxV = 4.5;
        const v = f.ballVelocity.length();
        if (v > maxV) f.ballVelocity.multiplyScalar(maxV / v);
      }
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, [camera, gl, scene, grab, flow]);

  // Keep BIN_MOUTH_RADIUS referenced so the constant survives potential tree-shaking.
  void BIN_MOUTH_RADIUS;
  return null;
}
