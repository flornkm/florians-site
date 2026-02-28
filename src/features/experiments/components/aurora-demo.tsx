import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float u_time;
  uniform vec2 u_mouse;
  uniform vec2 u_resolution;

  varying vec2 vUv;

  float hash(vec2 p) {
    float h = dot(p, vec2(127.1, 311.7));
    return fract(sin(h) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 6; i++) {
      value += amplitude * noise(p * frequency);
      frequency *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 st = vec2(uv.x * aspect, uv.y);

    float t = u_time * 0.15;

    vec2 mouseWarp = u_mouse * 0.08;
    st += mouseWarp * smoothstep(0.0, 1.0, 1.0 - length(uv - 0.5) * 1.2);

    float baseY = uv.y;
    float verticalBias = smoothstep(0.15, 0.55, baseY) * smoothstep(0.95, 0.65, baseY);

    float n1 = fbm(vec2(st.x * 1.5 + t * 0.8, st.y * 3.0 + t * 0.3));
    float n2 = fbm(vec2(st.x * 2.2 - t * 0.6, st.y * 2.5 + t * 0.5 + 3.7));
    float n3 = fbm(vec2(st.x * 1.8 + t * 0.4 + 7.1, st.y * 4.0 - t * 0.2));
    float n4 = fbm(vec2(st.x * 3.0 - t * 1.0, st.y * 1.5 + t * 0.7 + 11.3));

    float curtain1 = smoothstep(0.35, 0.65, n1) * verticalBias;
    float curtain2 = smoothstep(0.40, 0.70, n2) * verticalBias;
    float curtain3 = smoothstep(0.38, 0.68, n3) * verticalBias;
    float curtain4 = smoothstep(0.42, 0.72, n4) * verticalBias * 0.6;

    vec3 green  = vec3(0.0, 1.0, 0.533);
    vec3 cyan   = vec3(0.0, 0.812, 1.0);
    vec3 purple = vec3(0.667, 0.267, 1.0);
    vec3 white  = vec3(0.85, 0.95, 0.9);

    float heightGrad = smoothstep(0.2, 0.8, baseY);
    vec3 greenCyan = mix(green, cyan, heightGrad * 0.5 + n1 * 0.3);

    vec3 col = vec3(0.0);
    col += greenCyan * curtain1 * 0.7;
    col += purple * curtain2 * 0.4;
    col += cyan * curtain3 * 0.35;
    col += white * curtain4 * 0.3;

    float shimmer = noise(vec2(st.x * 8.0 + t * 2.0, st.y * 12.0 - t)) * 0.15;
    col += col * shimmer;

    float intensity = length(col);
    col += col * intensity * 0.5;

    float glow = smoothstep(0.0, 0.3, intensity) * verticalBias * 0.08;
    col += green * glow;

    vec3 bg = mix(vec3(0.0, 0.0, 0.02), vec3(0.02, 0.01, 0.04), baseY);
    col += bg;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function AuroraPlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const smoothMouse = useRef({ x: 0, y: 0 });
  const { gl, size } = useThree();

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_mouse: { value: new THREE.Vector2(0, 0) },
      u_resolution: { value: new THREE.Vector2(size.width, size.height) },
    }),
    [],
  );

  useEffect(() => {
    uniforms.u_resolution.value.set(size.width, size.height);
  }, [size, uniforms]);

  useEffect(() => {
    const canvas = gl.domElement;
    const container = canvas.parentElement;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = 0;
      mouseRef.current.y = 0;
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [gl]);

  useFrame((_, delta) => {
    uniforms.u_time.value += delta;

    smoothMouse.current.x += (mouseRef.current.x - smoothMouse.current.x) * 0.05;
    smoothMouse.current.y += (mouseRef.current.y - smoothMouse.current.y) * 0.05;
    uniforms.u_mouse.value.set(smoothMouse.current.x, smoothMouse.current.y);
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} />
    </mesh>
  );
}

export const AuroraDemo = () => {
  return (
    <div className="h-full w-full">
      <Canvas
        camera={{ position: [0, 0, 1], fov: 45, near: 0.1, far: 10 }}
        gl={{ alpha: false, antialias: false }}
        style={{ background: "#000005" }}
      >
        <AuroraPlane />
      </Canvas>
    </div>
  );
};

export default AuroraDemo;
