"use client";

import { useAnimations, useGLTF } from "@react-three/drei";
import { RefObject, useEffect, useMemo, useRef } from "react";
import { AnimationAction, Color, Group, LoopOnce, Material, Mesh, Object3D, SkinnedMesh } from "three";
import { clone as skeletonClone } from "three/examples/jsm/utils/SkeletonUtils.js";

type CharacterProps = {
  role?: "walker" | "idle";
  position?: [number, number, number];
  rotationY?: number;
  scale?: number;
  followRef?: RefObject<Group | null>;
  start?: boolean;
};

export function CharacterModel({
  role = "walker",
  position = [-3, -0.1, -5],
  rotationY = Math.PI / 4,
  scale = 0.5,
  followRef,
  start = true,
}: CharacterProps) {
  const group = useRef<Group>(null);
  const { scene, animations } = useGLTF("/models/character.glb");
  const instance = useMemo(() => skeletonClone(scene) as Object3D, [scene]);
  const { actions, mixer } = useAnimations(animations, group);

  const startedRef = useRef(false);

  useEffect(() => {
    if (!actions || !group.current || startedRef.current) return;

    group.current.position.set(position[0], position[1], position[2]);
    group.current.rotation.y = rotationY;
    if (followRef) followRef.current = group.current;

    const crossFadeToAction = (
      fromAction: AnimationAction | null | undefined,
      toAction: AnimationAction | null | undefined,
      duration: number = 0.3,
    ) => {
      if (fromAction && toAction && fromAction !== toAction) {
        toAction.reset().fadeIn(duration).play();
        fromAction.fadeOut(duration);
      } else if (toAction) {
        toAction.reset().play();
      }
    };

    const runSequence = async () => {
      const getAction = (name: string): AnimationAction | null =>
        (actions[name] as AnimationAction | undefined) ?? null;
      const walkAction: AnimationAction | null = getAction("Walk");
      const idleAction: AnimationAction | null = getAction("Idle");
      const waveAction: AnimationAction | null = getAction("Wave");

      let currentAction: AnimationAction | null = null;
      const baseTimeScale = 0.8;
      const walkTimeScale = 3;

      if (role === "walker" && !start) {
        if (idleAction) idleAction.reset().play();
        return;
      }

      if (role === "walker" && walkAction) {
        if (idleAction) idleAction.play();
        currentAction = walkAction;
        if (typeof walkAction.setEffectiveTimeScale === "function") walkAction.setEffectiveTimeScale(walkTimeScale);
        walkAction.reset();
        crossFadeToAction(idleAction, walkAction, 0.4);
        startedRef.current = true;
      } else if (idleAction) {
        currentAction = idleAction;
        idleAction.reset().play();
      }

      if (role !== "walker") return;

      const walkAndMove = () => {
        return new Promise<void>((resolve) => {
          const startTime = Date.now();
          const startPosX = position[0];
          const startPosZ = position[2];
          const endPosX = 0;
          const endPosZ = 1;
          const controlPosX = 0.0;
          const controlPosZ = -1.0;

          const approxCurveLength = (segments = 24) => {
            let length = 0;
            let prevX = startPosX;
            let prevZ = startPosZ;
            for (let i = 1; i <= segments; i++) {
              const t = i / segments;
              const omt = 1 - t;
              const x = omt * omt * startPosX + 2 * omt * t * controlPosX + t * t * endPosX;
              const z = omt * omt * startPosZ + 2 * omt * t * controlPosZ + t * t * endPosZ;
              const dx = x - prevX;
              const dz = z - prevZ;
              length += Math.sqrt(dx * dx + dz * dz);
              prevX = x;
              prevZ = z;
            }
            return length;
          };

          const curveLength = approxCurveLength();
          const baseWalkSpeed = 0.7;
          const walkSpeed = baseWalkSpeed * (walkTimeScale / baseTimeScale);
          const walkDuration = (curveLength / walkSpeed) * 1000;

          const animate = () => {
            const elapsed = Date.now() - startTime;
            const walkProgress = Math.min(elapsed / walkDuration, 1);

            const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
            const easeAmount = 0.25;
            const t = walkProgress * (1 - easeAmount) + easeInOutCubic(walkProgress) * easeAmount;

            const omt = 1 - t;
            const currentPosX = omt * omt * startPosX + 2 * omt * t * controlPosX + t * t * endPosX;
            const currentPosZ = omt * omt * startPosZ + 2 * omt * t * controlPosZ + t * t * endPosZ;

            const dxdt = 2 * (1 - t) * (controlPosX - startPosX) + 2 * t * (endPosX - controlPosX);
            const dzdt = 2 * (1 - t) * (controlPosZ - startPosZ) + 2 * t * (endPosZ - controlPosZ);
            const pathYaw = Math.atan2(dxdt, dzdt);
            const blendWindow = 0.12;
            const yawBlend = Math.min(t / blendWindow, 1);
            const yawEarly = rotationY * (1 - yawBlend) + pathYaw * yawBlend;
            const alignWindowStart = 0.85;
            const alignT = Math.max(0, Math.min(1, (walkProgress - alignWindowStart) / (1 - alignWindowStart)));
            const currentRotation = yawEarly * (1 - alignT);

            if (group.current) {
              group.current.position.x = currentPosX;
              group.current.position.z = currentPosZ;
              group.current.rotation.y = currentRotation;
            }

            if (walkProgress >= 0.9 && currentAction === walkAction) {
              crossFadeToAction(currentAction, idleAction, 0.2);
              currentAction = idleAction;
            }

            if (walkProgress < 1) requestAnimationFrame(animate);
            else resolve();
          };
          animate();
        });
      };

      await walkAndMove();

      await new Promise((resolve) => setTimeout(resolve, 600));

      const playOnce = (action: AnimationAction, fadeIn: number = 0.4) => {
        return new Promise<void>((resolve) => {
          const onFinished = (e: { action: AnimationAction }) => {
            if (e.action === action) {
              mixer?.removeEventListener("finished", onFinished);
              resolve();
            }
          };
          mixer?.addEventListener("finished", onFinished);
          action.reset();
          action.setLoop(LoopOnce, 1);
          action.clampWhenFinished = true;
          action.fadeIn(fadeIn).play();
        });
      };

      if (waveAction) {
        const previous = currentAction;
        currentAction = waveAction;
        if (previous && previous !== waveAction) previous.fadeOut(0.4);
        await playOnce(waveAction, 0.4);
      }

      crossFadeToAction(currentAction, idleAction, 0.4);
    };

    runSequence();

    return () => {
      if (mixer) mixer.stopAllAction();
    };
  }, [actions, mixer, role, start]);

  useEffect(() => {
    if (!instance) return;
    instance.traverse((child: Object3D) => {
      if (child instanceof Mesh || child instanceof SkinnedMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        const geo = (child as Mesh).geometry as { computeVertexNormals?: () => void };
        if (geo && typeof geo.computeVertexNormals === "function") geo.computeVertexNormals();
        type ColorishMaterial = Material & {
          color?: Color;
          emissive?: Color;
          emissiveIntensity?: number;
          skinning?: boolean;
          needsUpdate?: boolean;
          flatShading?: boolean;
        };
        const applyTo = (m: Material) => {
          const mat = m as ColorishMaterial;
          if (child instanceof SkinnedMesh && typeof mat.skinning !== "undefined") mat.skinning = true;
          if (typeof mat.flatShading === "boolean") mat.flatShading = false;
          if (role !== "walker") {
            if (mat.color) mat.color.set(0xffffff);
            if (mat.emissive) mat.emissive.set(0x000000);
            if (typeof mat.emissiveIntensity === "number") mat.emissiveIntensity = 0;
            mat.needsUpdate = true;
          }
        };
        const mat = (child as Mesh).material as Material | Material[] | undefined;
        if (Array.isArray(mat)) {
          const clones = mat.map((m) => m.clone());
          (child as Mesh).material = clones as Material[];
          clones.forEach(applyTo);
        } else if (mat) {
          const cloneMat = mat.clone();
          (child as Mesh).material = cloneMat as Material;
          applyTo(cloneMat);
        }
      }
    });
  }, [instance, role]);

  return <primitive object={instance} ref={group} scale={[scale, scale, scale]} />;
}
