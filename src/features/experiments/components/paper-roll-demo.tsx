import { useEffect, useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const PAPER_WIDTH = 3.0;
const PAPER_HEIGHT = 4.2;
const HALF_H = PAPER_HEIGHT / 2;
const SEGMENTS_X = 80;
const SEGMENTS_Y = 400;
const MIN_ROLL_Y = -HALF_H;
const MAX_ROLL_Y = HALF_H * 0.98;
const BASE_RADIUS = 0.06;
const LAYER_THICKNESS = 0.004;

const paperVertexShader = `
  uniform float uRollY;
  uniform float uRadius;
  uniform float uTime;
  uniform float uPaperHeight;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying float vCurlFactor;

  #define PI 3.14159265359

  void main() {
    vUv = uv;
    vec3 pos = position;
    float rollY = uRollY;
    float r = uRadius;

    if (pos.y > rollY) {
      float dist = pos.y - rollY;
      float angle = dist / r;

      float wraps = angle / (2.0 * PI);
      float currentR = r + wraps * ${LAYER_THICKNESS.toFixed(4)};

      float cx = 0.0;
      float cy = rollY;
      float cz = -currentR;

      pos.y = cy + sin(angle) * currentR;
      pos.z = cz + cos(angle) * currentR;

      float dAngle = 0.01;
      float nAngle = angle + dAngle;
      float nR = r + (nAngle / (2.0 * PI)) * ${LAYER_THICKNESS.toFixed(4)};
      vec3 tangent = normalize(vec3(0.0, cos(nAngle) * nR - cos(angle) * currentR, -sin(nAngle) * nR + sin(angle) * currentR));
      vNormal = normalize(vec3(0.0, sin(angle), cos(angle)));

      vCurlFactor = clamp(dist / (r * 3.0), 0.0, 1.0);
    } else {
      float distBelow = rollY - pos.y;
      float totalFlat = rollY - (-uPaperHeight * 0.5);
      float normalizedDist = distBelow / max(totalFlat, 0.001);

      float cornerLift = (1.0 - normalizedDist) * 0.003;
      float xEdge = abs(vUv.x - 0.5) * 2.0;
      cornerLift *= xEdge * xEdge;

      float subtleWave = sin(pos.y * 6.0 + uTime * 0.3) * 0.001 * (1.0 - normalizedDist * 0.5);
      pos.z += cornerLift + subtleWave;

      vNormal = vec3(0.0, 0.0, 1.0);
      vCurlFactor = 0.0;
    }

    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const paperFragmentShader = `
  uniform float uRollY;
  uniform float uPaperHeight;
  uniform vec3 uLightDir;
  uniform vec3 uLightDir2;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying float vCurlFactor;

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

    float n = fbm(vUv * 80.0) * 0.04;
    float fiber = noise(vec2(vUv.x * 500.0, vUv.y * 50.0)) * 0.012;
    vec3 paperColor = paperBase + vec3(n + fiber) - vec3(0.012, 0.006, 0.0);

    float lineSpacing = 1.0 / 30.0;
    float lineY = mod(vUv.y + lineSpacing * 0.5, lineSpacing);
    float lineMask = 1.0 - smoothstep(0.0, 0.001, abs(lineY - lineSpacing * 0.5));
    float lineNoise = noise(vUv * vec2(300.0, 8.0)) * 0.2;
    paperColor = mix(paperColor, vec3(0.70, 0.78, 0.90), lineMask * (0.22 + lineNoise * 0.06));

    float marginX = 0.10;
    float margin = 1.0 - smoothstep(0.0, 0.0018, abs(vUv.x - marginX));
    paperColor = mix(paperColor, vec3(0.85, 0.45, 0.45), margin * 0.4);

    vec3 normal = normalize(vNormal);
    if (!gl_FrontFacing) {
      normal = -normal;
    }

    vec3 l1 = normalize(uLightDir);
    vec3 l2 = normalize(uLightDir2);

    float diff1 = max(dot(normal, l1), 0.0);
    float diff2 = max(dot(normal, l2), 0.0);
    float ambient = 0.35;
    float lighting = ambient + diff1 * 0.50 + diff2 * 0.15;

    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    vec3 h1 = normalize(l1 + viewDir);
    vec3 h2 = normalize(l2 + viewDir);
    float spec1 = pow(max(dot(normal, h1), 0.0), 80.0) * 0.10;
    float spec2 = pow(max(dot(normal, h2), 0.0), 40.0) * 0.04;

    vec3 finalColor = paperColor * lighting + vec3(spec1 + spec2);

    if (!gl_FrontFacing) {
      finalColor *= 0.60;
      float n2 = fbm(vUv * 40.0 + 7.0) * 0.03;
      finalColor += vec3(n2 * 0.5);
    }

    if (vCurlFactor > 0.0) {
      float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 4.0) * 0.07;
      finalColor += vec3(fresnel);
    }

    float edgeX = smoothstep(0.0, 0.006, vUv.x) * smoothstep(0.0, 0.006, 1.0 - vUv.x);
    float edgeY = smoothstep(0.0, 0.004, vUv.y) * smoothstep(0.0, 0.004, 1.0 - vUv.y);
    finalColor *= mix(0.90, 1.0, edgeX * edgeY);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const shadowVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const shadowFragmentShader = `
  uniform float uRollY;
  uniform float uPaperHeight;
  uniform float uRadius;

  varying vec2 vUv;

  void main() {
    float halfH = uPaperHeight * 0.5;
    float rollNorm = (uRollY + halfH) / (2.0 * halfH);
    float rollUvY = 1.0 - rollNorm;

    float dist = rollUvY - vUv.y;
    float shadowWidth = 0.04 + uRadius * 0.6;
    float intensity = smoothstep(-0.005, shadowWidth * 0.15, dist) * (1.0 - smoothstep(0.0, shadowWidth, dist));
    intensity *= 0.35 * smoothstep(-halfH + 0.1, -halfH + 0.5, uRollY);

    float xFade = smoothstep(0.0, 0.08, vUv.x) * smoothstep(0.0, 0.08, 1.0 - vUv.x);
    intensity *= xFade;

    gl_FragColor = vec4(0.0, 0.0, 0.0, intensity);
  }
`;

interface DragState {
  rollY: number;
  velocity: number;
  isDragging: boolean;
  grabWorldY: number;
  grabRollY: number;
  prevWorldY: number;
  prevTime: number;
  smoothedVelocity: number;
}

function PaperScene({
  dragRef,
}: {
  dragRef: React.MutableRefObject<DragState>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const shadowMatRef = useRef<THREE.ShaderMaterial>(null);
  const clockRef = useRef(0);
  const { camera, gl, raycaster, size } = useThree();
  const planeRef = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));
  const pointerNDC = useRef(new THREE.Vector2());
  const intersection = useRef(new THREE.Vector3());

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.position.set(0, 0.0, 5.0);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
    }
  }, [camera]);

  const getWorldY = useCallback(
    (clientX: number, clientY: number): number => {
      const rect = gl.domElement.getBoundingClientRect();
      pointerNDC.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerNDC.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointerNDC.current, camera);
      raycaster.ray.intersectPlane(planeRef.current, intersection.current);
      return intersection.current.y;
    },
    [camera, gl, raycaster]
  );

  useEffect(() => {
    const canvas = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      e.preventDefault();
      canvas.setPointerCapture(e.pointerId);

      const worldY = getWorldY(e.clientX, e.clientY);
      const d = dragRef.current;
      d.isDragging = true;
      d.grabWorldY = worldY;
      d.grabRollY = d.rollY;
      d.prevWorldY = worldY;
      d.prevTime = performance.now();
      d.smoothedVelocity = 0;
      d.velocity = 0;
    };

    const onPointerMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d.isDragging) return;

      const worldY = getWorldY(e.clientX, e.clientY);
      const now = performance.now();
      const dt = Math.max(now - d.prevTime, 1) / 1000;

      const deltaFromGrab = worldY - d.grabWorldY;
      const newRollY = d.grabRollY + deltaFromGrab;

      const instantV = (worldY - d.prevWorldY) / dt;
      d.smoothedVelocity = d.smoothedVelocity * 0.75 + instantV * 0.25;

      d.rollY = newRollY;
      d.prevWorldY = worldY;
      d.prevTime = now;
    };

    const onPointerUp = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d.isDragging) return;
      canvas.releasePointerCapture(e.pointerId);
      d.isDragging = false;
      d.velocity = d.smoothedVelocity * 0.9;
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
    };
  }, [gl, getWorldY, dragRef]);

  const paperUniforms = useMemo(
    () => ({
      uRollY: { value: MIN_ROLL_Y },
      uRadius: { value: BASE_RADIUS },
      uPaperHeight: { value: PAPER_HEIGHT },
      uLightDir: { value: new THREE.Vector3(0.3, 0.5, 1.0) },
      uLightDir2: { value: new THREE.Vector3(-0.5, 0.3, 0.7) },
      uTime: { value: 0.0 },
    }),
    []
  );

  const shadowUniforms = useMemo(
    () => ({
      uRollY: { value: MIN_ROLL_Y },
      uPaperHeight: { value: PAPER_HEIGHT },
      uRadius: { value: BASE_RADIUS },
    }),
    []
  );

  useFrame((_, delta) => {
    const d = dragRef.current;
    clockRef.current += delta;

    if (!d.isDragging) {
      const friction = 3.5;
      d.velocity *= Math.exp(-friction * delta);

      if (d.rollY < MIN_ROLL_Y) {
        const overshoot = MIN_ROLL_Y - d.rollY;
        const springK = 40.0;
        const damping = 10.0;
        d.velocity += overshoot * springK * delta;
        d.velocity *= Math.exp(-damping * delta);
      } else if (d.rollY > MAX_ROLL_Y) {
        const overshoot = MAX_ROLL_Y - d.rollY;
        const springK = 40.0;
        const damping = 10.0;
        d.velocity += overshoot * springK * delta;
        d.velocity *= Math.exp(-damping * delta);
      }

      d.rollY += d.velocity * delta;

      if (Math.abs(d.velocity) < 0.001 && d.rollY >= MIN_ROLL_Y && d.rollY <= MAX_ROLL_Y) {
        d.velocity = 0;
      }
    }

    const clampedRollY = Math.max(MIN_ROLL_Y - 0.15, Math.min(MAX_ROLL_Y + 0.15, d.rollY));
    const rollFraction = (clampedRollY - MIN_ROLL_Y) / (MAX_ROLL_Y - MIN_ROLL_Y);
    const totalPaperLength = Math.max(0, clampedRollY - MIN_ROLL_Y);
    const numWraps = totalPaperLength / (2 * Math.PI * BASE_RADIUS);
    const radius = BASE_RADIUS + numWraps * LAYER_THICKNESS;

    if (matRef.current) {
      matRef.current.uniforms.uRollY.value = clampedRollY;
      matRef.current.uniforms.uRadius.value = radius;
      matRef.current.uniforms.uTime.value = clockRef.current;
    }
    if (shadowMatRef.current) {
      shadowMatRef.current.uniforms.uRollY.value = clampedRollY;
      shadowMatRef.current.uniforms.uRadius.value = radius;
    }
  });

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[2, 3, 5]} intensity={0.65} />
      <directionalLight position={[-3, 1, 4]} intensity={0.2} />

      <mesh position={[0, 0, -0.03]}>
        <planeGeometry args={[PAPER_WIDTH * 1.05, PAPER_HEIGHT, 1, SEGMENTS_Y]} />
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
          ref={matRef}
          vertexShader={paperVertexShader}
          fragmentShader={paperFragmentShader}
          uniforms={paperUniforms}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
}

export const PaperRollDemo = () => {
  const dragRef = useRef<DragState>({
    rollY: MIN_ROLL_Y,
    velocity: 0,
    isDragging: false,
    grabWorldY: 0,
    grabRollY: MIN_ROLL_Y,
    prevWorldY: 0,
    prevTime: 0,
    smoothedVelocity: 0,
  });

  return (
    <div
      className="flex flex-col items-center w-full h-full select-none"
      style={{ touchAction: "none" }}
    >
      <div className="w-full flex-1 min-h-0 cursor-grab active:cursor-grabbing">
        <Canvas
          gl={{ antialias: true, alpha: true }}
          style={{ width: "100%", height: "100%" }}
          camera={{ fov: 35, near: 0.1, far: 100 }}
        >
          <PaperScene dragRef={dragRef} />
        </Canvas>
      </div>
      <p className="text-xs text-quaternary pb-4 opacity-60">
        Drag the paper up to roll it
      </p>
    </div>
  );
};
