import { useChatActionEvents, useChatStatusEvents } from "@/components/chat/chat-status";
import { useDarkmode } from "@/hooks/use-darkmode";
import { useAnimations, useGLTF } from "@react-three/drei";
import { RefObject, useEffect, useMemo, useRef } from "react";
import {
  AnimationAction,
  BufferGeometry,
  Color,
  Group,
  LoopOnce,
  Material,
  Mesh,
  MeshToonMaterial,
  Object3D,
  SkinnedMesh,
} from "three";
import { EdgeSplitModifier } from "three/examples/jsm/modifiers/EdgeSplitModifier.js";
import { TessellateModifier } from "three/examples/jsm/modifiers/TessellateModifier.js";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { clone as skeletonClone } from "three/examples/jsm/utils/SkeletonUtils.js";

type CharacterProps = {
  role?: "walker" | "idle" | "black";
  position?: [number, number, number];
  rotationY?: number;
  scale?: number;
  followRef?: RefObject<Group | null>;
  start?: boolean;
  // Geometry smoothing controls (non-skinned only)
  mergeVerticesEpsilon?: number | null; // set to null to disable
  edgeSplitAngle?: number | null; // radians; set to null to disable
  tessellate?: { maxEdgeLength?: number; iterations?: number } | null; // add triangles on long edges
};

export function CharacterModel({
  role = "walker",
  position = [-3, -0.1, -5],
  rotationY = Math.PI / 4,
  scale = 0.5,
  followRef,
  start = true,
  mergeVerticesEpsilon = 1e-4,
  edgeSplitAngle = Math.PI / 3,
  tessellate = { maxEdgeLength: 0.08, iterations: 3 },
}: CharacterProps) {
  const group = useRef<Group>(null);
  const { scene, animations } = useGLTF("/models/character.glb");
  const instance = useMemo(() => skeletonClone(scene) as Object3D, [scene]);
  const { actions, mixer } = useAnimations(animations, group);
  const { darkmode } = useDarkmode();

  const startedRef = useRef(false);
  const sequenceDoneRef = useRef(false);
  const actionInProgressRef = useRef(false);
  const chatEvents = useChatStatusEvents();
  const actionEvents = useChatActionEvents();
  const chatPhaseRef = useRef<0 | 1 | 2>(0);

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

  useEffect(() => {
    if (!actions || !group.current || startedRef.current) return;

    group.current.position.set(position[0], position[1], position[2]);
    group.current.rotation.y = rotationY;
    if (followRef) followRef.current = group.current;

    const runSequence = async () => {
      const getAction = (name: string): AnimationAction | null =>
        (actions[name] as AnimationAction | undefined) ?? null;
      const walkAction: AnimationAction | null = getAction("Walk");
      const idleAction: AnimationAction | null = getAction("Idle");
      const waveAction: AnimationAction | null = getAction("Wave");

      let currentAction: AnimationAction | null = null;
      const baseTimeScale = 0.8;
      const walkTimeScale = 3;

      if ((role === "walker" || role === "black") && !start) {
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
      sequenceDoneRef.current = true;
    };

    runSequence();

    return () => {
      if (mixer) mixer.stopAllAction();
    };
  }, [actions, mixer, role, start]);

  useEffect(() => {
    if (!actions) return;
    if (role !== "walker") return;
    const think = (actions["Think"] as AnimationAction | undefined) ?? null;
    const talk = (actions["Talk"] as AnimationAction | undefined) ?? null;
    const idle = (actions["Idle"] as AnimationAction | undefined) ?? null;

    const fadeOthersAndPlay = (to?: AnimationAction | null, fade = 0.25) => {
      if (!to) return;
      Object.values(actions).forEach((a) => {
        const act = a as AnimationAction | undefined;
        if (act && act !== to) act.fadeOut(fade);
      });
      to.reset().fadeIn(fade).play();
    };

    const handler = (status: string) => {
      if (!sequenceDoneRef.current) return;
      if (actionInProgressRef.current) return;
      if (status === "ready") {
        chatPhaseRef.current = 0;
        fadeOthersAndPlay(idle);
        return;
      }
      const nextPhase: 1 | 2 = status === "submitted" ? 1 : 2;
      if (chatPhaseRef.current !== 0 && nextPhase < chatPhaseRef.current) {
        return;
      }
      chatPhaseRef.current = nextPhase;
      if (nextPhase === 1) fadeOthersAndPlay(think);
      else fadeOthersAndPlay(talk);
    };

    handler(chatEvents.get());
    const unsubscribe = chatEvents.subscribe(handler);
    return unsubscribe;
  }, [actions, role, chatEvents]);

  useEffect(() => {
    if (!actions || !mixer) return;
    if (role !== "walker") return;

    const getAction = (name: string): AnimationAction | null => (actions[name] as AnimationAction | undefined) ?? null;
    const idle = getAction("Idle");

    const playOnce = (action: AnimationAction, fadeIn = 0.3) => {
      const onFinished = (e: { action: AnimationAction }) => {
        if (e.action === action) {
          mixer.removeEventListener("finished", onFinished);
          actionInProgressRef.current = false;
          crossFadeToAction(action, idle, 0.4);
          if (idle) idle.play();
        }
      };
      mixer.addEventListener("finished", onFinished);
      Object.values(actions).forEach((a) => {
        const act = a as AnimationAction | undefined;
        if (act && act !== action) act.fadeOut(0.2);
      });
      actionInProgressRef.current = true;
      action.reset();
      action.setLoop(LoopOnce, 1);
      action.clampWhenFinished = true;
      action.fadeIn(fadeIn).play();
    };

    const handler = (actionName: string) => {
      if (!sequenceDoneRef.current) return;
      if (actionName === "None") return;

      const action = getAction(actionName);
      if (action) playOnce(action);
    };

    handler(actionEvents.get());
    const unsubscribe = actionEvents.subscribe(handler);
    return unsubscribe;
  }, [actions, mixer, role, actionEvents]);

  useEffect(() => {
    if (!instance) return;
    const edgeSplit = edgeSplitAngle != null ? new EdgeSplitModifier() : null;
    const tess = tessellate
      ? new TessellateModifier(tessellate.maxEdgeLength ?? 0.08, tessellate.iterations ?? 3)
      : null;

    instance.traverse((child: Object3D) => {
      if (child instanceof Mesh || child instanceof SkinnedMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        const mesh = child as Mesh;
        const geometry = mesh.geometry as BufferGeometry;
        const isSkinned = geometry.getAttribute("skinIndex") != null;

        if (!isSkinned && geometry) {
          let working = geometry.clone();

          const tessellated = tess?.modify(working);
          if (tessellated) {
            working.dispose();
            working = tessellated;
          }

          if (mergeVerticesEpsilon) {
            const merged = BufferGeometryUtils.mergeVertices(working, mergeVerticesEpsilon);
            if (merged) {
              working.dispose();
              working = merged;
            }
          }

          if (edgeSplitAngle) {
            const split = edgeSplit?.modify(working, edgeSplitAngle, true);
            if (split) {
              working.dispose();
              working = split;
            }
          }

          working.computeVertexNormals();

          mesh.geometry.dispose();
          mesh.geometry = working;
        } else {
          try {
            geometry.computeVertexNormals();
          } catch (_) {
            console.error(_);
          }
        }

        const originalMat = (child as Mesh).material as Material | Material[] | undefined;
        let originalColor = new Color(0xffffff);

        if (originalMat && !Array.isArray(originalMat)) {
          const mat = originalMat as Material & { color?: Color };
          if (mat.color) originalColor = mat.color.clone();
        } else if (Array.isArray(originalMat) && originalMat.length > 0) {
          const mat = originalMat[0] as Material & { color?: Color };
          if (mat.color) originalColor = mat.color.clone();
        }

        // Non-walker color: darker in dark mode, a bit lighter in light mode
        const nonWalkerHex = darkmode ? 0x404040 : 0xf5f5f5; // mid-dark (neutral-700) / neutral-100 (light)
        const toonMaterial = new MeshToonMaterial({
          color: role === "walker" ? originalColor : new Color(nonWalkerHex),
          gradientMap: null,
        });

        (child as Mesh).material = toonMaterial;
      }
    });
  }, [instance, role, mergeVerticesEpsilon, edgeSplitAngle, darkmode]);

  return <primitive object={instance} ref={group} scale={[scale, scale, scale]} />;
}
