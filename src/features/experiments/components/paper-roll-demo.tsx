import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const PAPER_WIDTH = 3.0;
const PAPER_HEIGHT = 4.2;
const SEGMENTS_X = 1;
const SEGMENTS_Y = 200;
const CURL_RADIUS_MIN = 0.12;
const CURL_RADIUS_MAX = 0.45;

const paperVertexShader = `
  uniform float uRoll;
  uniform float uCurlRadius;
  uniform float uPaperHeight;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying float vIsCurled;

  void main() {
    vUv = uv;
    vec3 pos = position;

    float rollLine = mix(uPaperHeight * 0.5, -uPaperHeight * 0.5, uRoll);
    float r = uCurlRadius;

    if (pos.y > rollLine) {
      float dist = pos.y - rollLine;

      float circumference = 2.0 * 3.14159265 * r;
      float angle = dist / r;

      float maxAngle = 3.14159265 * 2.0 * 5.0;
      angle = min(angle, maxAngle);

      float layers = angle / (2.0 * 3.14159265);
      float currentR = r + layers * 0.008;

      pos.y = rollLine + sin(angle) * currentR;
      pos.z = -(1.0 - cos(angle)) * currentR;

      vIsCurled = 1.0;

      float dAngle = 1.0 / r;
      vec3 tangent = vec3(0.0, cos(angle), sin(angle));
      vNormal = normalize(vec3(0.0, -sin(angle), cos(angle)));
    } else {
      vIsCurled = 0.0;
      vNormal = vec3(0.0, 0.0, 1.0);
    }

    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const paperFragmentShader = `
  uniform float uRoll;
  uniform vec3 uLightDir;
  uniform float uPaperHeight;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying float vIsCurled;

  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    vec3 paperBase = vec3(0.96, 0.94, 0.90);

    float n = noise(vUv * 120.0) * 0.03;
    float n2 = noise(vUv * 40.0) * 0.015;
    vec3 paperColor = paperBase + vec3(n + n2);

    float lineSpacing = 1.0 / 30.0;
    float lineY = mod(vUv.y + 0.002, lineSpacing);
    float line = 1.0 - smoothstep(0.0, 0.0015, abs(lineY - lineSpacing * 0.5));
    paperColor = mix(paperColor, vec3(0.7, 0.78, 0.9), line * 0.25);

    float marginX = 0.12;
    float margin = 1.0 - smoothstep(0.0, 0.003, abs(vUv.x - marginX));
    paperColor = mix(paperColor, vec3(0.85, 0.55, 0.55), margin * 0.3);

    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(uLightDir);
    float diff = max(dot(normal, lightDir), 0.0);
    float ambient = 0.45;
    float lighting = ambient + diff * 0.55;

    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), 40.0) * 0.12;

    vec3 finalColor = paperColor * lighting + vec3(spec);

    if (vIsCurled > 0.5) {
      float backFacing = step(dot(normal, viewDir), 0.0);
      finalColor = mix(finalColor, finalColor * 0.75, backFacing);
    }

    float edgeFade = smoothstep(0.0, 0.01, vUv.x) * smoothstep(0.0, 0.01, 1.0 - vUv.x);
    finalColor *= mix(0.95, 1.0, edgeFade);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const shadowVertexShader = `
  uniform float uRoll;
  uniform float uPaperHeight;
  uniform float uCurlRadius;

  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 pos = position;
    float rollLine = mix(uPaperHeight * 0.5, -uPaperHeight * 0.5, uRoll);
    pos.y = min(pos.y, rollLine + uCurlRadius * 0.3);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const shadowFragmentShader = `
  uniform float uRoll;
  uniform float uPaperHeight;
  uniform float uCurlRadius;

  varying vec2 vUv;

  void main() {
    float rollLine = mix(0.0, 1.0, uRoll);
    float rollUv = 1.0 - rollLine;
    float dist = rollUv - vUv.y;
    float shadowIntensity = smoothstep(0.0, 0.08, dist) * (1.0 - smoothstep(0.0, 0.15, dist));
    shadowIntensity *= 0.25 * smoothstep(0.0, 0.02, uRoll);
    gl_FragColor = vec4(0.0, 0.0, 0.0, shadowIntensity);
  }
`;

function PaperMesh({ roll }: { roll: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const shadowMatRef = useRef<THREE.ShaderMaterial>(null);

  const curlRadius = CURL_RADIUS_MIN + roll * (CURL_RADIUS_MAX - CURL_RADIUS_MIN);

  const paperUniforms = useMemo(
    () => ({
      uRoll: { value: roll },
      uCurlRadius: { value: curlRadius },
      uPaperHeight: { value: PAPER_HEIGHT },
      uLightDir: { value: new THREE.Vector3(0.3, 0.5, 1.0) },
    }),
    []
  );

  const shadowUniforms = useMemo(
    () => ({
      uRoll: { value: roll },
      uPaperHeight: { value: PAPER_HEIGHT },
      uCurlRadius: { value: curlRadius },
    }),
    []
  );

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uRoll.value = roll;
      materialRef.current.uniforms.uCurlRadius.value = curlRadius;
    }
    if (shadowMatRef.current) {
      shadowMatRef.current.uniforms.uRoll.value = roll;
      shadowMatRef.current.uniforms.uCurlRadius.value = curlRadius;
    }
  });

  return (
    <group>
      <mesh ref={shadowRef} position={[0, 0, -0.01]}>
        <planeGeometry args={[PAPER_WIDTH, PAPER_HEIGHT, SEGMENTS_X, SEGMENTS_Y]} />
        <shaderMaterial
          ref={shadowMatRef}
          vertexShader={shadowVertexShader}
          fragmentShader={shadowFragmentShader}
          uniforms={shadowUniforms}
          transparent
          depthWrite={false}
        />
      </mesh>

      <mesh ref={meshRef}>
        <planeGeometry args={[PAPER_WIDTH, PAPER_HEIGHT, SEGMENTS_X, SEGMENTS_Y]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={paperVertexShader}
          fragmentShader={paperFragmentShader}
          uniforms={paperUniforms}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function Scene({ roll }: { roll: number }) {
  const { camera } = useThree();

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.position.set(0, 0.2, 4.5);
      camera.lookAt(0, 0, 0);
    }
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 3, 5]} intensity={0.8} />
      <PaperMesh roll={roll} />
    </>
  );
}

export const PaperRollDemo = () => {
  const [roll, setRoll] = useState(0.35);
  const [grabbing, setGrabbing] = useState(false);

  useEffect(() => {
    if (!grabbing) return;
    const release = () => setGrabbing(false);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, [grabbing]);

  return (
    <div className="flex flex-col items-center gap-6 w-full h-full px-6 select-none">
      <div className="w-full flex-1 min-h-0">
        <Canvas
          gl={{ antialias: true, alpha: true }}
          style={{ width: "100%", height: "100%" }}
          camera={{ fov: 35, near: 0.1, far: 100 }}
        >
          <Scene roll={roll} />
        </Canvas>
      </div>

      <div className="flex items-center gap-3 w-full max-w-[240px] pb-6">
        <span className="text-xs text-quaternary shrink-0">Flat</span>
        <div className="relative w-full flex items-center">
          <input
            type="range"
            min={0}
            max={0.92}
            step={0.005}
            value={roll}
            onChange={(e) => setRoll(parseFloat(e.target.value))}
            onPointerDown={() => setGrabbing(true)}
            className={[
              "w-full h-[3px] appearance-none rounded-full outline-none bg-surface-tertiary",
              grabbing ? "cursor-grabbing" : "cursor-grab",
              "[&::-webkit-slider-thumb]:appearance-none",
              "[&::-webkit-slider-thumb]:w-3",
              "[&::-webkit-slider-thumb]:h-3",
              "[&::-webkit-slider-thumb]:rounded-full",
              "[&::-webkit-slider-thumb]:bg-[var(--text-quaternary)]",
              "[&::-webkit-slider-thumb]:shadow-[0_0_0_2px_var(--bg-primary)]",
              "[&::-webkit-slider-thumb]:transition-transform",
              "[&::-webkit-slider-thumb]:duration-300",
              "[&::-webkit-slider-thumb]:[transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]",
              grabbing
                ? "[&::-webkit-slider-thumb]:scale-75"
                : "[&::-webkit-slider-thumb]:scale-100",
              grabbing
                ? "[&::-webkit-slider-thumb]:cursor-grabbing"
                : "[&::-webkit-slider-thumb]:cursor-grab",
              "[&::-moz-range-thumb]:w-3",
              "[&::-moz-range-thumb]:h-3",
              "[&::-moz-range-thumb]:rounded-full",
              "[&::-moz-range-thumb]:bg-[var(--text-quaternary)]",
              "[&::-moz-range-thumb]:border-[2px]",
              "[&::-moz-range-thumb]:border-solid",
              "[&::-moz-range-thumb]:[border-color:var(--bg-primary)]",
              "[&::-moz-range-thumb]:transition-transform",
              "[&::-moz-range-thumb]:duration-300",
              "[&::-moz-range-thumb]:[transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]",
              grabbing
                ? "[&::-moz-range-thumb]:scale-75"
                : "[&::-moz-range-thumb]:scale-100",
              grabbing
                ? "[&::-moz-range-thumb]:cursor-grabbing"
                : "[&::-moz-range-thumb]:cursor-grab",
            ].join(" ")}
          />
        </div>
        <span className="text-xs text-quaternary shrink-0">Rolled</span>
      </div>
    </div>
  );
};
