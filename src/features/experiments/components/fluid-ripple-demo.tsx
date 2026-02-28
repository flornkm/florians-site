import { Canvas, ThreeEvent, useFrame } from "@react-three/fiber";
import { useCallback, useRef } from "react";
import * as THREE from "three";

const MAX_RIPPLES = 16;
const RIPPLE_LIFETIME = 4.0;

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec4 uRipples[16];
  uniform int uRippleCount;

  varying float vHeight;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 pos = position;
    float totalDisplacement = 0.0;

    for (int i = 0; i < 16; i++) {
      if (i >= uRippleCount) break;

      vec4 ripple = uRipples[i];
      vec2 center = ripple.xy;
      float startTime = ripple.z;
      float amplitude = ripple.w;

      float elapsed = uTime - startTime;
      if (elapsed < 0.0 || elapsed > ${RIPPLE_LIFETIME.toFixed(1)}) continue;

      float dist = distance(pos.xz, center);

      float speed = 3.0;
      float freq = 4.0;
      float waveFront = elapsed * speed;
      float frontDist = abs(dist - waveFront);

      float envelope = amplitude * exp(-0.6 * elapsed) * exp(-0.3 * frontDist);
      float wave = sin(dist * freq - elapsed * speed * freq) * envelope;

      totalDisplacement += wave;
    }

    pos.y += totalDisplacement;
    vHeight = totalDisplacement;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  varying float vHeight;
  varying vec2 vUv;

  void main() {
    vec3 deepBlue = vec3(0.02, 0.05, 0.12);
    vec3 midBlue = vec3(0.05, 0.15, 0.35);
    vec3 brightCyan = vec3(0.2, 0.7, 0.9);
    vec3 white = vec3(0.85, 0.95, 1.0);
    vec3 darkNavy = vec3(0.01, 0.02, 0.06);

    float h = vHeight;
    vec3 color;

    if (h > 0.0) {
      float t = clamp(h / 0.5, 0.0, 1.0);
      color = mix(midBlue, brightCyan, t);
      float whiteT = clamp((h - 0.3) / 0.4, 0.0, 1.0);
      color = mix(color, white, whiteT * whiteT);
    } else {
      float t = clamp(-h / 0.5, 0.0, 1.0);
      color = mix(midBlue, darkNavy, t);
    }

    vec2 grid = abs(fract(vUv * 50.0 - 0.5) - 0.5);
    float line = min(grid.x, grid.y);
    float gridAlpha = 1.0 - smoothstep(0.0, 0.04, line);
    vec3 gridColor = color + vec3(0.03, 0.06, 0.1) * gridAlpha;
    color = mix(color, gridColor, 0.4);

    float edgeFade = 1.0 - smoothstep(0.35, 0.5, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));
    color = mix(deepBlue, color, edgeFade);

    gl_FragColor = vec4(color, 1.0);
  }
`;

interface RippleData {
  x: number;
  z: number;
  startTime: number;
  amplitude: number;
}

function RipplePlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const ripplesRef = useRef<RippleData[]>([]);
  const clockRef = useRef(0);

  const uniforms = useRef({
    uTime: { value: 0 },
    uRipples: {
      value: Array.from({ length: MAX_RIPPLES }, () => new THREE.Vector4(0, 0, -100, 0)),
    },
    uRippleCount: { value: 0 },
  });

  useFrame((_, delta) => {
    clockRef.current += delta;
    const t = clockRef.current;
    uniforms.current.uTime.value = t;

    const active = ripplesRef.current.filter((r) => t - r.startTime < RIPPLE_LIFETIME);
    ripplesRef.current = active;

    const arr = uniforms.current.uRipples.value;
    for (let i = 0; i < MAX_RIPPLES; i++) {
      if (i < active.length) {
        arr[i].set(active[i].x, active[i].z, active[i].startTime, active[i].amplitude);
      } else {
        arr[i].set(0, 0, -100, 0);
      }
    }
    uniforms.current.uRippleCount.value = active.length;
  });

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const point = e.point;
    const ripples = ripplesRef.current;

    if (ripples.length >= MAX_RIPPLES) {
      ripples.shift();
    }

    ripples.push({
      x: point.x,
      z: point.z,
      startTime: clockRef.current,
      amplitude: 0.35 + Math.random() * 0.15,
    });
  }, []);

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} onClick={handleClick}>
      <planeGeometry args={[20, 20, 100, 100]} />
      <shaderMaterial
        uniforms={uniforms.current}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export const FluidRippleDemo = () => {
  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{ position: [0, 10, 6], fov: 50 }}
        gl={{ antialias: true }}
        style={{ background: "#050a14" }}
      >
        <RipplePlane />
      </Canvas>
      <div className="pointer-events-none absolute bottom-4 left-0 right-0 text-center">
        <span className="text-xs text-quaternary">Click to create ripples</span>
      </div>
    </div>
  );
};
