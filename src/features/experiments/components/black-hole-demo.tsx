import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const PARTICLE_COUNT = 2000;
const INNER_RADIUS = 1.2;
const OUTER_RADIUS = 3.5;
const EVENT_HORIZON = 0.9;

const diskVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const diskFragmentShader = /* glsl */ `
  uniform float u_time;
  varying vec2 vUv;
  varying vec3 vPosition;

  float noise(float x) {
    return sin(x * 1.0) * 0.5 + sin(x * 2.3 + 0.7) * 0.3 + sin(x * 4.1 + 1.3) * 0.2;
  }

  void main() {
    float r = length(vPosition.xz);
    float angle = atan(vPosition.z, vPosition.x);

    float normalizedR = clamp((r - 1.2) / (3.5 - 1.2), 0.0, 1.0);

    vec3 innerColor = vec3(1.0, 0.95, 0.8);
    vec3 midColor = vec3(1.0, 0.5, 0.1);
    vec3 outerColor = vec3(0.4, 0.05, 0.0);

    vec3 color;
    if (normalizedR < 0.3) {
      color = mix(innerColor, midColor, normalizedR / 0.3);
    } else {
      color = mix(midColor, outerColor, (normalizedR - 0.3) / 0.7);
    }

    float hotSpot1 = smoothstep(0.3, 0.0, abs(sin(angle * 3.0 - u_time * 0.8 + noise(r * 5.0 + u_time))));
    float hotSpot2 = smoothstep(0.3, 0.0, abs(sin(angle * 2.0 + u_time * 0.5 + noise(r * 3.0 - u_time * 0.7))));
    float hotSpot3 = smoothstep(0.25, 0.0, abs(sin(angle * 5.0 - u_time * 1.2 + r * 2.0)));

    float hotSpots = hotSpot1 * 0.4 + hotSpot2 * 0.3 + hotSpot3 * 0.2;

    float turbulence = sin(r * 8.0 + u_time * 2.0) * 0.1 +
                       sin(angle * 6.0 + u_time * 1.5) * 0.08 +
                       sin(r * 15.0 - u_time * 3.0 + angle * 4.0) * 0.05;

    color += hotSpots * vec3(1.0, 0.8, 0.4);
    color += turbulence * vec3(0.3, 0.15, 0.05);

    float alpha = (1.0 - normalizedR) * 0.85;
    alpha *= 0.6 + 0.4 * (1.0 - smoothstep(0.0, 0.15, normalizedR));

    gl_FragColor = vec4(color, alpha);
  }
`;

function AccretionDisk() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
    }),
    [],
  );

  const geometry = useMemo(() => {
    const segments = 128;
    const rings = 64;
    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let r = 0; r <= rings; r++) {
      const radius = INNER_RADIUS + (OUTER_RADIUS - INNER_RADIUS) * (r / rings);
      const v = r / rings;
      for (let s = 0; s <= segments; s++) {
        const theta = (s / segments) * Math.PI * 2;
        const u = s / segments;
        positions.push(Math.cos(theta) * radius, 0, Math.sin(theta) * radius);
        uvs.push(u, v);
      }
    }

    for (let r = 0; r < rings; r++) {
      for (let s = 0; s < segments; s++) {
        const current = r * (segments + 1) + s;
        const next = current + segments + 1;
        indices.push(current, next, current + 1);
        indices.push(current + 1, next, next + 1);
      }
    }

    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_time.value += delta;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[0, 0, 0]}>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={diskVertexShader}
        fragmentShader={diskFragmentShader}
        transparent
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function Singularity() {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.8, 64, 64]} />
        <meshBasicMaterial color="black" />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.85, 64, 64]} />
        <meshBasicMaterial color="#ff6a00" transparent opacity={0.05} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.92, 64, 64]} />
        <meshBasicMaterial color="#ff3300" transparent opacity={0.03} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

function ParticleStream() {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, angles, radii, speeds } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const ang = new Float32Array(PARTICLE_COUNT);
    const rad = new Float32Array(PARTICLE_COUNT);
    const spd = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.5 + Math.random() * 2.5;
      const y = (Math.random() - 0.5) * 0.3;

      ang[i] = angle;
      rad[i] = radius;
      spd[i] = 0.8 + Math.random() * 0.4;

      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }

    return { positions: pos, angles: ang, radii: rad, speeds: spd };
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const posArray = posAttr.array as Float32Array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const orbitalSpeed = speeds[i] / Math.sqrt(radii[i]);
      angles[i] += orbitalSpeed * delta * 1.5;
      radii[i] -= delta * 0.08 * (1.0 / radii[i]);

      if (radii[i] < EVENT_HORIZON) {
        radii[i] = 1.5 + Math.random() * 2.5;
        angles[i] = Math.random() * Math.PI * 2;
      }

      posArray[i * 3] = Math.cos(angles[i]) * radii[i];
      posArray[i * 3 + 1] *= 0.998;
      posArray[i * 3 + 2] = Math.sin(angles[i]) * radii[i];
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={PARTICLE_COUNT} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#a0e8ff"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function PhotonRings() {
  const tilts = [
    { angle: (10 * Math.PI) / 180, radius: 0.9, tube: 0.015 },
    { angle: (20 * Math.PI) / 180, radius: 1.0, tube: 0.012 },
    { angle: (-15 * Math.PI) / 180, radius: 1.1, tube: 0.018 },
  ];

  return (
    <group>
      {tilts.map((ring, idx) => (
        <mesh key={idx} rotation={[ring.angle, 0, 0]}>
          <torusGeometry args={[ring.radius, ring.tube, 16, 128]} />
          <meshBasicMaterial
            color="#c0d8ff"
            transparent
            opacity={0.6}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function BlackHoleScene() {
  return (
    <>
      <ambientLight intensity={0.05} />
      <pointLight position={[2, 2, 2]} color="#ff8844" intensity={2} distance={20} />
      <Singularity />
      <AccretionDisk />
      <ParticleStream />
      <PhotonRings />
      <OrbitControls autoRotate autoRotateSpeed={0.5} enableZoom enablePan={false} minDistance={3} maxDistance={20} />
    </>
  );
}

export function BlackHoleDemo() {
  if (typeof window === "undefined") {
    return <div className="h-full w-full bg-black" />;
  }

  return (
    <div className="relative h-full w-full" suppressHydrationWarning>
      <Canvas
        camera={{ position: [0, 3, 8], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: "#000000" }}
      >
        <BlackHoleScene />
      </Canvas>
    </div>
  );
}
