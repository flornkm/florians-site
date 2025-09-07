"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { ShaderMaterial, Vector3 } from "three";
import {
  PATH_COLOR,
  PATH_END_Z,
  PATH_START_Z,
  PATH_WIDTH,
  PATH_START_X,
  PATH_END_X,
  PATH_CONTROL_X,
  PATH_CONTROL_Z,
  PATH_SPOTLIGHT_RADIUS,
  PATH_FADE_RADIUS,
  hexToRgb,
  getCurvedPathPosition,
} from "./constants";

export function WalkingPath() {
  const meshRef = useRef();

  // Create blurred path shader material
  const pathShaderMaterial = useMemo(() => {
    return new ShaderMaterial({
      uniforms: {
        uCharacterPos: { value: new Vector3(-3, 0, -5) },
        uPathColor: { value: hexToRgb(PATH_COLOR) },
        uSpotlightRadius: { value: PATH_SPOTLIGHT_RADIUS },
        uFadeRadius: { value: PATH_FADE_RADIUS },
        uPathWidth: { value: PATH_WIDTH },
        uPathStart: { value: new Vector3(PATH_START_X, 0, PATH_START_Z) },
        uPathEnd: { value: new Vector3(PATH_END_X, 0, PATH_END_Z) },
        uPathControl: { value: new Vector3(PATH_CONTROL_X, 0, PATH_CONTROL_Z) },
      },
      transparent: true,
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uCharacterPos;
        uniform vec3 uPathColor;
        uniform float uSpotlightRadius;
        uniform float uFadeRadius;
        uniform float uPathWidth;
        uniform vec3 uPathStart;
        uniform vec3 uPathEnd;
        uniform vec3 uPathControl;
        varying vec3 vWorldPosition;

        // Simple noise function for randomness
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        void main() {
          // Find closest point on curved path using iterative approach
          vec2 currentPos = vWorldPosition.xz;
          float minDistance = 10000.0;
          float bestT = 0.0;
          
          // Sample the bezier curve to find closest point
          for (int i = 0; i <= 50; i++) {
            float t = float(i) / 50.0;
            
            // Calculate bezier curve position at t
            float oneMinusT = 1.0 - t;
            vec2 curvePoint = oneMinusT * oneMinusT * uPathStart.xz + 
                             2.0 * oneMinusT * t * uPathControl.xz + 
                             t * t * uPathEnd.xz;
            
            float dist = distance(currentPos, curvePoint);
            if (dist < minDistance) {
              minDistance = dist;
              bestT = t;
            }
          }
          
          // Add minimal randomness to path width for natural look
          vec2 pathPoint = (1.0 - bestT) * (1.0 - bestT) * uPathStart.xz + 
                          2.0 * (1.0 - bestT) * bestT * uPathControl.xz + 
                          bestT * bestT * uPathEnd.xz;
          
          float pathNoise = noise(pathPoint * 8.0) * 0.1;
          float organicPathWidth = uPathWidth + pathNoise;
          
          // Create soft path edges
          float pathEdge = smoothstep(organicPathWidth * 0.8, organicPathWidth * 0.4, minDistance);
          
          if (pathEdge < 0.05) {
            discard;
          }
          
          // Apply character spotlight effect like before
          float dist = distance(vWorldPosition.xz, uCharacterPos.xz);
          float intensity = 1.0;

          if (dist > uSpotlightRadius) {
            float fadeProgress = (dist - uSpotlightRadius) / (uFadeRadius - uSpotlightRadius);
            intensity = max(0.0, 1.0 - pow(fadeProgress, 0.5));
          }
          
          // Light grey path color
          vec3 pathColor = uPathColor;
          
          // Fade out at start (where character begins) and end
          float pathProgress = bestT;
          float startFade = smoothstep(0.0, 0.3, pathProgress); // Strong fade at start
          float endFade = smoothstep(1.0, 0.9, pathProgress);
          float overallFade = startFade * endFade;
          
          // Add path variation like before
          float pathVariation = noise(vWorldPosition.xz * 6.0) * 0.1 + 0.9;
          
          float finalAlpha = pathEdge * intensity * pathVariation * overallFade * 0.9;
          gl_FragColor = vec4(pathColor, finalAlpha);
        }
      `,
    });
  }, []);

  // Update character position in shader
  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const time = clock.getElapsedTime();

    // Same character position calculation as character model - curved movement
    let characterPos = { x: 0, z: 1 };

    // Calculate actual walk duration to match character movement
    const distance = Math.sqrt((-3 - 0)**2 + (-5 - 1)**2);
    const walkSpeed = 0.8;
    const walkDurationSeconds = distance / walkSpeed;
    
    if (time < walkDurationSeconds + 1) {
      const walkProgress = Math.min(time / walkDurationSeconds, 1);
      const eased = 1 - Math.pow(1 - walkProgress, 3); // ease out cubic
      
      // Use curved path position
      const curvedPos = getCurvedPathPosition(eased);
      characterPos = { x: curvedPos.x, z: curvedPos.z };
    }

    pathShaderMaterial.uniforms.uCharacterPos.value.set(characterPos.x, 0, characterPos.z);
  });

  return (
    <mesh ref={meshRef} receiveShadow rotation-x={-Math.PI / 2} position-y={-0.105}>
      <planeGeometry args={[30, 30]} />
      <primitive object={pathShaderMaterial} />
    </mesh>
  );
}
