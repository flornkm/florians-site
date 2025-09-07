"use client";

import { useAnimations, useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { AnimationAction, BufferGeometry, Group, Mesh, MeshToonMaterial, Object3D } from "three";

export function CharacterModel() {
  const group = useRef<Group>(null);
  const { scene, animations } = useGLTF("/models/character.glb");
  const { actions, mixer } = useAnimations(animations, group);

  useEffect(() => {
    if (!actions || !group.current) return;

    group.current.position.set(-3, -0.1, -5);
    group.current.rotation.y = Math.PI / 4;

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

      if (walkAction) {
        currentAction = walkAction;
        if (typeof walkAction.setEffectiveTimeScale === "function") {
          walkAction.setEffectiveTimeScale(walkTimeScale);
        }
        walkAction.reset().play();
      }

      const walkAndMove = () => {
        return new Promise<void>((resolve) => {
          const startTime = Date.now();
          const startPosX = -3;
          const startPosZ = -5;
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
            const yaw = Math.atan2(dxdt, dzdt);
            const alignWindowStart = 0.85;
            const alignT = Math.max(0, Math.min(1, (walkProgress - alignWindowStart) / (1 - alignWindowStart)));
            const currentRotation = yaw * (1 - alignT) + 0 * alignT;

            if (group.current) {
              group.current.position.x = currentPosX;
              group.current.position.z = currentPosZ;
              group.current.rotation.y = currentRotation;
            }

            if (walkProgress >= 0.9 && currentAction === walkAction) {
              crossFadeToAction(currentAction, idleAction, 0.2);
              currentAction = idleAction;
            }

            if (walkProgress < 1) {
              requestAnimationFrame(animate);
            } else {
              resolve();
            }
          };
          animate();
        });
      };

      await walkAndMove();

      await new Promise((resolve) => setTimeout(resolve, 800));

      if (waveAction) {
        crossFadeToAction(currentAction, waveAction, 0.4);
        currentAction = waveAction;

        waveAction.clampWhenFinished = true;
        waveAction.setLoop(2200, 1);

        await new Promise((resolve) => setTimeout(resolve, 1400));
      }

      crossFadeToAction(currentAction, idleAction, 0.4);
    };

    runSequence();

    return () => {
      if (mixer) mixer.stopAllAction();
    };
  }, [actions, mixer, scene]);

  useEffect(() => {
    if (scene) {
      scene.traverse((child: Object3D) => {
        if (child instanceof Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material && child.geometry) {
            const geometry = child.geometry as BufferGeometry;
            geometry.computeVertexNormals();
            const originalColor = child.material.color ? child.material.color.clone() : null;
            const originalMap = child.material.map || null;
            const toonMaterial = new MeshToonMaterial({
              color: originalColor || 0xffffff,
              map: originalMap,
              transparent: true,
              opacity: 1,
            });
            if (originalColor) {
              toonMaterial.color.setRGB(
                Math.min(originalColor.r * 1.2, 1),
                Math.min(originalColor.g * 1.2, 1),
                Math.min(originalColor.b * 1.2, 1),
              );
            }
            child.material = toonMaterial;
          }
        }
      });
    }
  }, [scene]);

  return <primitive object={scene} ref={group} scale={[0.5, 0.5, 0.5]} />;
}
