"use client";

import { useAnimations, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { BufferGeometry, Group, MeshToonMaterial } from "three";

function CharacterModel() {
  const group = useRef<Group>(null);
  const { scene, animations } = useGLTF("/models/character.glb");
  const { actions, mixer } = useAnimations(animations, group);

  useEffect(() => {
    if (!actions || !group.current) return;

    // Position character behind camera initially, on the ground
    group.current.position.set(-2, -0.1, -5);
    group.current.rotation.y = 0; // Face forward initially

    // Helper function to smoothly crossfade between animations
    const crossFadeToAction = (fromAction: any, toAction: any, duration: number = 0.3) => {
      if (fromAction && toAction && fromAction !== toAction) {
        toAction.reset().fadeIn(duration).play();
        fromAction.fadeOut(duration);
      } else if (toAction) {
        toAction.reset().play();
      }
    };

    // Character will be visible immediately since scene handles fade

    const runSequence = async () => {
      const walkAction = actions["Walk"];
      const idleAction = actions["Idle"];
      const waveAction = actions["Wave"];

      let currentAction = null;

      // Fade in character
      const fadeIn = () => {
        return new Promise<void>((resolve) => {
          const startTime = Date.now();
          const duration = 800; // 0.8 seconds

          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            scene.traverse((child: any) => {
              if (child.isMesh && child.material) {
                child.material.opacity = progress;
              }
            });

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              resolve();
            }
          };
          animate();
        });
      };

      // Start walking animation immediately
      if (walkAction) {
        currentAction = walkAction;
        walkAction.reset().play();
      }

      // Walk forward and fade in simultaneously - "walking through fog" effect
      const walkAndFadeIn = () => {
        return new Promise<void>((resolve) => {
          const startTime = Date.now();
          const startPosZ = -5;
          const endPosZ = 1; // Stop in front position
          const distance = Math.abs(endPosZ - startPosZ);
          const walkSpeed = 1.2; // units per second - slower, more natural speed
          const walkDuration = (distance / walkSpeed) * 1000; // convert to milliseconds
          const fadeDuration = 1500; // 1.5 seconds for fade in

          const animate = () => {
            const elapsed = Date.now() - startTime;
            const walkProgress = Math.min(elapsed / walkDuration, 1);
            const fadeProgress = Math.min(elapsed / fadeDuration, 1);

            // Update position
            const currentPosZ = startPosZ + (endPosZ - startPosZ) * walkProgress;
            if (group.current) {
              group.current.position.z = currentPosZ;
            }

            // Scene opacity handled at Canvas level now

            if (walkProgress < 1) {
              requestAnimationFrame(animate);
            } else {
              resolve();
            }
          };
          animate();
        });
      };

      await walkAndFadeIn();

      // Smoothly transition from walk to idle
      crossFadeToAction(currentAction, idleAction, 0.5);
      currentAction = idleAction;

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

          // Replace with ToonMaterial for authentic cartoon look
          if (child.material && child.geometry) {
            // Smooth the geometry for better cartoon look
            const geometry = child.geometry as BufferGeometry;
            geometry.computeVertexNormals();

            // Store original material properties
            const originalColor = child.material.color ? child.material.color.clone() : null;
            const originalMap = child.material.map || null;

            // Replace with MeshToonMaterial for cartoon shading
            const toonMaterial = new MeshToonMaterial({
              color: originalColor || 0xffffff,
              map: originalMap,
              transparent: child.material.transparent || false,
              opacity: child.material.opacity || 1,
            });

            // Enhance color saturation for more cartoon-like appearance
            if (originalColor) {
              toonMaterial.color.multiplyScalar(1.15);
            }

            child.material = toonMaterial;
          }
        }
      });
    }
  }, [scene]);

  return <primitive object={scene} ref={group} scale={[0.5, 0.5, 0.5]} />;
}

export function Character() {
  const [sceneOpacity, setSceneOpacity] = useState(0);

  useEffect(() => {
    // Fade in the entire scene
    const fadeInScene = () => {
      const startTime = Date.now();
      const duration = 1500; // 1.5 seconds

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setSceneOpacity(progress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      animate();
    };

    fadeInScene();
  }, []);

  return (
    <div className="h-screen w-full">
      <Canvas
        camera={{
          position: [0, 2, 8],
          fov: 45,
          near: 0.1,
          far: 1000,
        }}
        style={{ background: "#fff", opacity: sceneOpacity }}
        shadows
      >
        {/* High ambient lighting for cartoon look - reduces harsh shadows */}
        <ambientLight intensity={1.2} color="#f8f9ff" />

        {/* Main key light - positioned for cartoon styling */}
        <directionalLight
          position={[6, 12, 6]}
          intensity={0.6}
          castShadow
          shadow-mapSize={[4096, 4096]}
          shadow-camera-far={25}
          shadow-camera-left={-12}
          shadow-camera-right={12}
          shadow-camera-top={12}
          shadow-camera-bottom={-12}
          shadow-bias={-0.0005}
          shadow-normalBias={0.02}
        />

        {/* Strong fill light from opposite side - cartoon style lighting */}
        <directionalLight position={[-4, 8, 4]} intensity={0.5} color="#e6f3ff" />

        {/* Top light for extra brightness - very cartoony */}
        <directionalLight position={[0, 10, 0]} intensity={0.3} color="#fff8e1" />

        {/* Warm rim light */}
        <directionalLight position={[0, 4, -8]} intensity={0.4} color="#ffeb3b" />

        {/* Ground plane for shadows */}
        <mesh receiveShadow rotation-x={-Math.PI / 2} position-y={-0.1}>
          <planeGeometry args={[20, 20]} />
          <shadowMaterial opacity={0.1} />
        </mesh>

        <CharacterModel />
      </Canvas>
    </div>
  );
}
