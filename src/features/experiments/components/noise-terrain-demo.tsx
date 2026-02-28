import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uMouseX;

  varying float vHeight;
  varying vec2 vWorldXZ;

  float noise(vec2 p) {
    return sin(p.x * 1.3 + p.y * 0.9) * 0.5
         + sin(p.x * 2.1 - p.y * 1.7 + 0.8) * 0.25
         + sin(p.x * 0.7 + p.y * 3.1 - 1.2) * 0.15
         + sin(p.x * 4.3 - p.y * 0.5 + 2.1) * 0.1;
  }

  void main() {
    vec3 pos = position;

    float scrollSpeed = 0.3 + uMouseX * 0.08;
    vec2 noiseCoord = vec2(pos.x * 0.4 + uTime * scrollSpeed, pos.z * 0.4 + uTime * 0.15);

    float n1 = noise(noiseCoord);
    float n2 = noise(noiseCoord * 2.3 + vec2(5.2, 1.3)) * 0.4;
    float n3 = noise(noiseCoord * 4.7 + vec2(9.1, 3.7)) * 0.15;

    float height = (n1 + n2 + n3) * 2.0;

    float edgeFadeX = 1.0 - smoothstep(0.35, 0.5, abs(pos.x / 20.0));
    float edgeFadeZ = 1.0 - smoothstep(0.35, 0.5, abs(pos.z / 20.0));
    height *= edgeFadeX * edgeFadeZ;

    pos.y = height;
    vHeight = height;
    vWorldXZ = pos.xz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  varying float vHeight;
  varying vec2 vWorldXZ;

  vec3 heightColor(float h) {
    vec3 deepBlue   = vec3(0.039, 0.086, 0.157);
    vec3 blueGreen  = vec3(0.102, 0.290, 0.227);
    vec3 oliveGreen = vec3(0.176, 0.353, 0.106);
    vec3 greyBrown  = vec3(0.353, 0.290, 0.227);
    vec3 snow       = vec3(0.910, 0.910, 0.910);

    float normalized = clamp((h + 1.5) / 4.5, 0.0, 1.0);

    vec3 color;
    if (normalized < 0.2) {
      color = mix(deepBlue, blueGreen, normalized / 0.2);
    } else if (normalized < 0.45) {
      color = mix(blueGreen, oliveGreen, (normalized - 0.2) / 0.25);
    } else if (normalized < 0.7) {
      color = mix(oliveGreen, greyBrown, (normalized - 0.45) / 0.25);
    } else {
      color = mix(greyBrown, snow, (normalized - 0.7) / 0.3);
    }
    return color;
  }

  void main() {
    vec3 color = heightColor(vHeight);

    vec2 grid = abs(fract(vWorldXZ * 0.32) - 0.5);
    float line = min(grid.x, grid.y);
    float wireframe = 1.0 - smoothstep(0.0, 0.03, line);

    vec3 wireColor = color + vec3(0.08);
    color = mix(color, wireColor, wireframe * 0.5);

    float fogFactor = smoothstep(4.0, 10.0, length(vWorldXZ));
    vec3 fogColor = vec3(0.020, 0.039, 0.078);
    color = mix(color, fogColor, fogFactor * 0.6);

    gl_FragColor = vec4(color, 1.0);
  }
`;

function Terrain() {
  const meshRef = useRef<THREE.Mesh>(null);
  const clockRef = useRef(0);
  const mouseXRef = useRef(0);
  const { gl } = useThree();

  const uniforms = useRef({
    uTime: { value: 0 },
    uMouseX: { value: 0 },
  });

  useEffect(() => {
    const canvas = gl.domElement;
    const container = canvas.parentElement;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseXRef.current = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    };

    const handleMouseLeave = () => {
      mouseXRef.current = 0;
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [gl]);

  useFrame((_, delta) => {
    clockRef.current += delta;
    uniforms.current.uTime.value = clockRef.current;
    uniforms.current.uMouseX.value += (mouseXRef.current - uniforms.current.uMouseX.value) * 0.05;
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
      <planeGeometry args={[20, 20, 80, 80]} />
      <shaderMaterial
        uniforms={uniforms.current}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export const NoiseTerrainDemo = () => {
  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{ position: [0, 6, 10], fov: 55 }}
        gl={{ antialias: true }}
        style={{ background: "#050a14" }}
      >
        <Terrain />
      </Canvas>
      <div className="pointer-events-none absolute bottom-4 left-0 right-0 text-center">
        <span className="text-xs text-quaternary">Move mouse to interact</span>
      </div>
    </div>
  );
};
