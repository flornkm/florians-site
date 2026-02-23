import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const PAPER_WIDTH = 3.0;
const PAPER_HEIGHT = 4.2;
const SEGMENTS_X = 64;
const SEGMENTS_Y = 300;
const CURL_RADIUS_MIN = 0.08;
const CURL_RADIUS_MAX = 0.38;
const MAX_ROLL = 0.95;

const paperVertexShader = `
  uniform float uRoll;
  uniform float uCurlRadius;
  uniform float uPaperHeight;
  uniform float uTime;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying float vCurlAmount;

  void main() {
    vUv = uv;
    vec3 pos = position;

    float rollLine = mix(uPaperHeight * 0.5, -uPaperHeight * 0.5, uRoll);
    float r = uCurlRadius;

    float transitionZone = r * 2.5;

    if (pos.y > rollLine - transitionZone * 0.1) {
      float dist = pos.y - rollLine;

      float leadIn = smoothstep(-transitionZone * 0.1, transitionZone * 0.3, dist);

      float angle = (dist / r) * leadIn;
      float maxAngle = 3.14159265 * 2.0 * 6.0;
      angle = min(angle, maxAngle);

      float layers = angle / (2.0 * 3.14159265);
      float layerThickness = 0.006;
      float currentR = r + layers * layerThickness;

      float bendAngle = angle * leadIn;

      pos.y = rollLine + sin(bendAngle) * currentR;
      pos.z = -(1.0 - cos(bendAngle)) * currentR;

      float gravityDroop = sin(3.14159 * vUv.x) * 0.008 * leadIn * (1.0 + layers * 0.5);
      pos.z -= gravityDroop;

      vCurlAmount = leadIn;

      float dA = 1.0 / r;
      vNormal = normalize(vec3(0.0, -sin(bendAngle + dA * 0.5), cos(bendAngle + dA * 0.5)));
    } else {
      vCurlAmount = 0.0;

      float distFromRoll = rollLine - pos.y;
      float nearBend = 1.0 - smoothstep(0.0, 1.0, distFromRoll);
      float waviness = sin(pos.y * 8.0 + uTime * 0.5) * 0.002 * nearBend;
      float cornerCurl = sin(3.14159 * vUv.x) * 0.003 * (1.0 - vUv.y);
      pos.z += waviness + cornerCurl;

      vec3 dx = vec3(1.0, 0.0, cos(3.14159 * vUv.x) * 3.14159 * 0.003 * (1.0 - vUv.y));
      vec3 dy = vec3(0.0, 1.0, cos(pos.y * 8.0 + uTime * 0.5) * 8.0 * 0.002 * nearBend);
      vNormal = normalize(cross(dx, dy));
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
  uniform vec3 uLightDir2;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying float vCurlAmount;

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

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 paperBase = vec3(0.97, 0.95, 0.91);

    float n = fbm(vUv * 80.0) * 0.035;
    float fiber = noise(vec2(vUv.x * 400.0, vUv.y * 60.0)) * 0.01;
    vec3 paperColor = paperBase + vec3(n + fiber) - vec3(0.01, 0.005, 0.0);

    float lineSpacing = 1.0 / 32.0;
    float lineY = mod(vUv.y + 0.001, lineSpacing);
    float line = 1.0 - smoothstep(0.0, 0.0012, abs(lineY - lineSpacing * 0.5));
    float lineNoise = noise(vUv * vec2(200.0, 10.0)) * 0.3;
    paperColor = mix(paperColor, vec3(0.72, 0.80, 0.92), line * (0.2 + lineNoise * 0.08));

    float marginX = 0.11;
    float margin = 1.0 - smoothstep(0.0, 0.002, abs(vUv.x - marginX));
    paperColor = mix(paperColor, vec3(0.88, 0.50, 0.50), margin * 0.35);

    vec3 normal = normalize(vNormal);
    vec3 lightDir1 = normalize(uLightDir);
    vec3 lightDir2n = normalize(uLightDir2);

    float diff1 = max(dot(normal, lightDir1), 0.0);
    float diff2 = max(dot(normal, lightDir2n), 0.0);
    float ambient = 0.38;
    float lighting = ambient + diff1 * 0.45 + diff2 * 0.17;

    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    vec3 halfDir1 = normalize(lightDir1 + viewDir);
    vec3 halfDir2 = normalize(lightDir2n + viewDir);
    float spec1 = pow(max(dot(normal, halfDir1), 0.0), 60.0) * 0.08;
    float spec2 = pow(max(dot(normal, halfDir2), 0.0), 30.0) * 0.04;

    vec3 finalColor = paperColor * lighting + vec3(spec1 + spec2);

    if (vCurlAmount > 0.1) {
      float backFacing = step(dot(normal, viewDir), 0.0);
      float shadow = mix(1.0, 0.68, backFacing);
      finalColor *= shadow;

      float edgeHighlight = pow(1.0 - abs(dot(normal, viewDir)), 3.0) * 0.06;
      finalColor += vec3(edgeHighlight);
    }

    float edgeX = smoothstep(0.0, 0.008, vUv.x) * smoothstep(0.0, 0.008, 1.0 - vUv.x);
    float edgeY = smoothstep(0.0, 0.005, vUv.y) * smoothstep(0.0, 0.005, 1.0 - vUv.y);
    float edgeDark = 1.0 - (1.0 - edgeX * edgeY) * 0.12;
    finalColor *= edgeDark;

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
    pos.y = min(pos.y, rollLine + uCurlRadius * 0.2);
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
    float shadowWidth = 0.06 + uCurlRadius * 0.3;
    float shadowIntensity = smoothstep(0.0, shadowWidth * 0.3, dist) * (1.0 - smoothstep(0.0, shadowWidth, dist));
    shadowIntensity *= 0.3 * smoothstep(0.0, 0.03, uRoll);

    float xFade = smoothstep(0.0, 0.1, vUv.x) * smoothstep(0.0, 0.1, 1.0 - vUv.x);
    shadowIntensity *= xFade;

    gl_FragColor = vec4(0.0, 0.0, 0.0, shadowIntensity);
  }
`;

interface PhysicsState {
  roll: number;
  velocity: number;
  targetRoll: number | null;
  isDragging: boolean;
  dragStartY: number;
  dragStartRoll: number;
  lastDragY: number;
  lastDragTime: number;
  dragVelocity: number;
}

function PaperMesh({
  physicsRef,
  onPointerDown,
}: {
  physicsRef: React.MutableRefObject<PhysicsState>;
  onPointerDown: (e: THREE.Event) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const shadowMatRef = useRef<THREE.ShaderMaterial>(null);
  const clockRef = useRef(0);

  const paperUniforms = useMemo(
    () => ({
      uRoll: { value: 0.0 },
      uCurlRadius: { value: CURL_RADIUS_MIN },
      uPaperHeight: { value: PAPER_HEIGHT },
      uLightDir: { value: new THREE.Vector3(0.3, 0.6, 1.0) },
      uLightDir2: { value: new THREE.Vector3(-0.5, 0.2, 0.8) },
      uTime: { value: 0.0 },
    }),
    []
  );

  const shadowUniforms = useMemo(
    () => ({
      uRoll: { value: 0.0 },
      uPaperHeight: { value: PAPER_HEIGHT },
      uCurlRadius: { value: CURL_RADIUS_MIN },
    }),
    []
  );

  useFrame((_, delta) => {
    const p = physicsRef.current;
    clockRef.current += delta;

    if (!p.isDragging) {
      const friction = 0.92;
      const bounceStiffness = 12.0;
      const bounceDamping = 6.0;

      p.velocity *= friction;

      if (p.roll < 0) {
        p.velocity += (-p.roll) * bounceStiffness * delta;
        p.velocity *= 1.0 - bounceDamping * delta;
      } else if (p.roll > MAX_ROLL) {
        p.velocity += (MAX_ROLL - p.roll) * bounceStiffness * delta;
        p.velocity *= 1.0 - bounceDamping * delta;
      }

      if (p.targetRoll !== null) {
        const diff = p.targetRoll - p.roll;
        p.velocity += diff * 8.0 * delta;
        p.velocity *= 0.94;
        if (Math.abs(diff) < 0.001 && Math.abs(p.velocity) < 0.001) {
          p.roll = p.targetRoll;
          p.velocity = 0;
          p.targetRoll = null;
        }
      }

      p.roll += p.velocity * delta;
      p.roll = Math.max(-0.03, Math.min(MAX_ROLL + 0.03, p.roll));

      if (Math.abs(p.velocity) < 0.0005 && p.targetRoll === null) {
        p.velocity = 0;
      }
    }

    const curlRadius =
      CURL_RADIUS_MIN + p.roll * (CURL_RADIUS_MAX - CURL_RADIUS_MIN);

    if (materialRef.current) {
      materialRef.current.uniforms.uRoll.value = Math.max(0, Math.min(MAX_ROLL, p.roll));
      materialRef.current.uniforms.uCurlRadius.value = curlRadius;
      materialRef.current.uniforms.uTime.value = clockRef.current;
    }
    if (shadowMatRef.current) {
      shadowMatRef.current.uniforms.uRoll.value = Math.max(0, Math.min(MAX_ROLL, p.roll));
      shadowMatRef.current.uniforms.uCurlRadius.value = curlRadius;
    }
  });

  return (
    <group>
      <mesh ref={shadowRef} position={[0, 0, -0.02]}>
        <planeGeometry
          args={[PAPER_WIDTH * 1.02, PAPER_HEIGHT, 1, SEGMENTS_Y]}
        />
        <shaderMaterial
          ref={shadowMatRef}
          vertexShader={shadowVertexShader}
          fragmentShader={shadowFragmentShader}
          uniforms={shadowUniforms}
          transparent
          depthWrite={false}
        />
      </mesh>

      <mesh ref={meshRef} onPointerDown={onPointerDown}>
        <planeGeometry
          args={[PAPER_WIDTH, PAPER_HEIGHT, SEGMENTS_X, SEGMENTS_Y]}
        />
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

function Scene({
  physicsRef,
  onPointerDown,
}: {
  physicsRef: React.MutableRefObject<PhysicsState>;
  onPointerDown: (e: THREE.Event) => void;
}) {
  const { camera } = useThree();

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.position.set(0, 0.1, 4.8);
      camera.lookAt(0, -0.1, 0);
    }
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 3, 5]} intensity={0.7} />
      <directionalLight position={[-3, 1, 3]} intensity={0.2} />
      <PaperMesh physicsRef={physicsRef} onPointerDown={onPointerDown} />
    </>
  );
}

export const PaperRollDemo = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const physicsRef = useRef<PhysicsState>({
    roll: 0.0,
    velocity: 0,
    targetRoll: null,
    isDragging: false,
    dragStartY: 0,
    dragStartRoll: 0,
    lastDragY: 0,
    lastDragTime: 0,
    dragVelocity: 0,
  });

  const screenToRoll = useCallback((deltaY: number) => {
    const el = canvasRef.current;
    if (!el) return 0;
    const height = el.clientHeight;
    return -(deltaY / height) * 1.8;
  }, []);

  const handlePointerDown = useCallback(
    (e: any) => {
      const p = physicsRef.current;
      p.isDragging = true;
      p.targetRoll = null;
      p.velocity = 0;
      p.dragVelocity = 0;

      const clientY = (e as any).clientY ?? (e as any).nativeEvent?.clientY ?? 0;
      p.dragStartY = clientY;
      p.dragStartRoll = p.roll;
      p.lastDragY = clientY;
      p.lastDragTime = performance.now();
    },
    []
  );

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const p = physicsRef.current;
      if (!p.isDragging) return;

      const now = performance.now();
      const dt = Math.max(now - p.lastDragTime, 1);
      const deltaY = e.clientY - p.dragStartY;
      const rollDelta = screenToRoll(deltaY);
      const newRoll = p.dragStartRoll + rollDelta;

      const instantVelocity = ((e.clientY - p.lastDragY) / dt) * 1000;
      p.dragVelocity = p.dragVelocity * 0.7 + instantVelocity * 0.3;

      p.roll = newRoll;
      p.lastDragY = e.clientY;
      p.lastDragTime = now;
    };

    const handlePointerUp = () => {
      const p = physicsRef.current;
      if (!p.isDragging) return;
      p.isDragging = false;

      const throwVelocity = screenToRoll(p.dragVelocity) * 0.8;
      p.velocity = throwVelocity;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [screenToRoll]);

  return (
    <div
      ref={canvasRef}
      className="flex flex-col items-center w-full h-full select-none"
      style={{ touchAction: "none" }}
    >
      <div className="w-full flex-1 min-h-0 cursor-grab active:cursor-grabbing">
        <Canvas
          gl={{ antialias: true, alpha: true }}
          style={{ width: "100%", height: "100%" }}
          camera={{ fov: 35, near: 0.1, far: 100 }}
        >
          <Scene physicsRef={physicsRef} onPointerDown={handlePointerDown} />
        </Canvas>
      </div>
      <p className="text-xs text-quaternary pb-4 opacity-60">
        Drag the paper to roll and unroll
      </p>
    </div>
  );
};
