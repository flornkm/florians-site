"use client";

import { useAnimations, useGLTF } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { BufferGeometry, Group, MeshToonMaterial } from "three";

export function CharacterModel() {
  const group = useRef<Group>(null);
  const { scene, animations } = useGLTF("/models/character.glb");
  const { actions, mixer } = useAnimations(animations, group);
  const materialsRef = useRef<MeshToonMaterial[]>([]);
  const [showParticles, setShowParticles] = useState(false);
  const [characterVisible, setCharacterVisible] = useState(true);

  useEffect(() => {
    if (!actions || !group.current) return;

    // Position character at back left initially, on the ground
    group.current.position.set(-3, -0.1, -5);
    group.current.rotation.y = Math.PI / 4; // Face diagonally forward initially (45 degrees)

    // Helper function to smoothly crossfade between animations
    const crossFadeToAction = (fromAction: any, toAction: any, duration: number = 0.3) => {
      if (fromAction && toAction && fromAction !== toAction) {
        toAction.reset().fadeIn(duration).play();
        fromAction.fadeOut(duration);
      } else if (toAction) {
        toAction.reset().play();
      }
    };

    // Character starts invisible, particle effect will make it appear

    const runSequence = async () => {
      const walkAction = actions["Walk"];
      const idleAction = actions["Idle"];
      const waveAction = actions["Wave"];

      let currentAction = null;

      // Start walking animation immediately
      if (walkAction) {
        currentAction = walkAction;
        walkAction.reset().play();
      }

      // Skip particle effect wait for now

      // Walking animation with movement - stop walking when movement stops
      const walkAndMove = () => {
        return new Promise<void>((resolve) => {
          const startTime = Date.now();
          const startPosX = -3;
          const startPosZ = -5;
          const endPosX = 0; // End in center
          const endPosZ = 1; // Stop in front position
          const startRotation = Math.PI / 4; // 45 degrees
          const endRotation = 0; // Face forward
          
          const distance = Math.sqrt((endPosX - startPosX)**2 + (endPosZ - startPosZ)**2);
          const walkSpeed = 0.8; // units per second - slower to match animation
          const walkDuration = (distance / walkSpeed) * 1000;

          const animate = () => {
            const elapsed = Date.now() - startTime;
            const walkProgress = Math.min(elapsed / walkDuration, 1);

            // Smooth easing function
            const eased = 1 - Math.pow(1 - walkProgress, 3); // ease out cubic

            // Update position with diagonal movement
            const currentPosX = startPosX + (endPosX - startPosX) * eased;
            const currentPosZ = startPosZ + (endPosZ - startPosZ) * eased;
            const currentRotation = startRotation + (endRotation - startRotation) * eased;
            
            if (group.current) {
              group.current.position.x = currentPosX;
              group.current.position.z = currentPosZ;
              group.current.rotation.y = currentRotation;
            }

            // Stop walking animation much earlier to match movement
            if (walkProgress >= 0.8 && currentAction === walkAction) {
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

      // Character is already facing forward, no rotation needed

      // Wait a moment in idle
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Wave for several seconds
      if (waveAction) {
        crossFadeToAction(currentAction, waveAction, 0.4);
        currentAction = waveAction;

        waveAction.clampWhenFinished = true;
        waveAction.setLoop(2200, 1); // Play once

        // Wave for 2 seconds - faster
        await new Promise((resolve) => setTimeout(resolve, 1400));
      }

      // Final transition back to idle and stay there
      crossFadeToAction(currentAction, idleAction, 0.4);
    };

    runSequence();

    return () => {
      if (mixer) mixer.stopAllAction();
    };
  }, [actions, mixer, scene]);

  useEffect(() => {
    if (scene) {
      // Traverse the scene and enable shadows, improve materials
      scene.traverse((child: any) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          // Create dissolve shader for particle materialization effect
          if (child.material && child.geometry) {
            // Smooth the geometry for better cartoon look
            const geometry = child.geometry as BufferGeometry;
            geometry.computeVertexNormals();

            // Store original material properties
            const originalColor = child.material.color ? child.material.color.clone() : null;
            const originalMap = child.material.map || null;

            // Use MeshToonMaterial that works with animations
            const toonMaterial = new MeshToonMaterial({
              color: originalColor || 0xffffff,
              map: originalMap,
              transparent: true,
              opacity: characterVisible ? 1 : 0,
            });

            // Enhance color saturation for more cartoon-like appearance
            if (originalColor) {
              toonMaterial.color.setRGB(
                Math.min(originalColor.r * 1.2, 1),
                Math.min(originalColor.g * 1.2, 1),
                Math.min(originalColor.b * 1.2, 1),
              );
            }

            child.material = toonMaterial;
            materialsRef.current.push(toonMaterial);
          }
        }
      });
    }
  }, [scene, characterVisible]);

  // Update material opacity when character visibility changes
  useEffect(() => {
    materialsRef.current.forEach((material) => {
      material.opacity = characterVisible ? 1 : 0;
    });
  }, [characterVisible]);

  return (
    <>
      <primitive object={scene} ref={group} scale={[0.5, 0.5, 0.5]} />
    </>
  );
}
