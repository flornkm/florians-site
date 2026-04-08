import { cn } from "@/lib/utils";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { motion } from "motion/react";
import { Component, type ReactNode, Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

class StampErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

// --- Shaders ---

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uDarkMode;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  // multi-octave noise for natural-looking wear
  float noise2d(vec2 p) {
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
      v += a * noise2d(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;

    // --- Serrated / perforated edges ---
    float teethX = 7.0;
    float teethY = 9.0;
    float depth = 0.035;

    float waveH = cos(uv.y * teethY * 6.28318) * 0.5 + 0.5;
    float waveV = cos(uv.x * teethX * 6.28318) * 0.5 + 0.5;

    float mask = smoothstep(-0.003, 0.003, uv.x        - waveH * depth)
               * smoothstep(-0.003, 0.003, (1.0 - uv.x) - waveH * depth)
               * smoothstep(-0.003, 0.003, uv.y        - waveV * depth)
               * smoothstep(-0.003, 0.003, (1.0 - uv.y) - waveV * depth);

    if (mask < 0.01) discard;

    // --- Stamp paper color (dark mode aware) ---
    vec3 paperLight = vec3(0.935); // ~#EEEEEE
    vec3 paperDark  = vec3(0.175); // ~#2D2D2D
    vec3 paperColor = mix(paperLight, paperDark, uDarkMode);

    // --- Avatar image area (inset with border) ---
    float border = 0.1;
    vec2 imgUv = (uv - border) / (1.0 - 2.0 * border);

    vec4 color;
    if (imgUv.x >= 0.0 && imgUv.x <= 1.0 && imgUv.y >= 0.0 && imgUv.y <= 1.0) {
      // cover: plane is 1:1.25 (4:5), avatar is 1:1
      float coverScale = 0.8;
      vec2 coverUv = vec2(
        imgUv.x * coverScale + (1.0 - coverScale) * 0.5,
        imgUv.y
      );
      color = texture2D(uTexture, coverUv);

      // --- Heavy desaturation (washed out, old print) ---
      float lum = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      color.rgb = mix(color.rgb, vec3(lum), 0.35);

      // --- Faded / sun-bleached color shift ---
      // warm yellowish fade in light mode, cool blue fade in dark
      vec3 fadeLight = vec3(0.95, 0.92, 0.85);
      vec3 fadeDark  = vec3(0.2, 0.22, 0.25);
      vec3 fadeColor = mix(fadeLight, fadeDark, uDarkMode);
      color.rgb = mix(color.rgb, fadeColor, 0.12);

      // --- Edge darkening / vignette on image ---
      float vignette = 1.0 - smoothstep(0.3, 0.7, length(imgUv - 0.5) * 1.4);
      color.rgb *= mix(0.8, 1.0, vignette);

      // --- Surface scratches (many, varied) ---
      float scratches = 0.0;
      vec3 scratchColor = mix(vec3(1.0), vec3(0.4), uDarkMode);

      // fine scratches — many thin lines
      for (int i = 0; i < 10; i++) {
        float fi = float(i);
        float angle = fi * 1.7 + 0.5;
        vec2 dir = vec2(cos(angle), sin(angle));
        vec2 origin = vec2(
          hash(vec2(fi * 1.3, fi * 3.7)) * 0.9 + 0.05,
          hash(vec2(fi * 5.1, fi * 0.7)) * 0.9 + 0.05
        );
        vec2 pos = coverUv - origin;
        float perp = abs(dot(pos, vec2(-dir.y, dir.x)));
        float along = dot(pos, dir);
        float len = hash(vec2(fi * 7.3, fi)) * 0.15 + 0.08;
        float lengthMask = smoothstep(len, 0.0, abs(along));
        float width = 0.001 + hash(vec2(fi, fi * 2.1)) * 0.002;
        scratches = max(scratches, (1.0 - smoothstep(width * 0.5, width, perp)) * lengthMask * 0.25);
      }

      // deep gouges — fewer, wider, more visible
      for (int i = 0; i < 3; i++) {
        float fi = float(i) + 20.0;
        float angle = fi * 3.1 + 2.0;
        vec2 dir = vec2(cos(angle), sin(angle));
        vec2 origin = vec2(
          hash(vec2(fi, fi * 2.3)) * 0.7 + 0.15,
          hash(vec2(fi * 4.1, fi)) * 0.7 + 0.15
        );
        vec2 pos = coverUv - origin;
        float perp = abs(dot(pos, vec2(-dir.y, dir.x)));
        float along = dot(pos, dir);
        float lengthMask = smoothstep(0.2, 0.0, abs(along - 0.03));
        scratches = max(scratches, (1.0 - smoothstep(0.002, 0.006, perp)) * lengthMask * 0.35);
      }

      color.rgb = mix(color.rgb, scratchColor, scratches);

      // --- Scuff / wear patches (fbm noise) ---
      float wear = fbm(coverUv * 8.0 + 3.7);
      float wearMask = smoothstep(0.45, 0.65, wear) * 0.15;
      color.rgb = mix(color.rgb, mix(vec3(0.85), vec3(0.3), uDarkMode), wearMask);

    } else {
      color = vec4(paperColor, 1.0);

      // --- Paper aging / stains on border ---
      float stain = fbm(uv * 12.0 + 1.5);
      float stainMask = smoothstep(0.5, 0.7, stain) * 0.06;
      vec3 stainColor = mix(vec3(0.88, 0.85, 0.78), vec3(0.18, 0.16, 0.14), uDarkMode);
      color.rgb = mix(color.rgb, stainColor, stainMask);
    }

    // --- Paper grain (heavier) ---
    float grain = hash(uv * 500.0) * 0.04;
    float grainLarge = hash(uv * 80.0) * 0.02;
    color.rgb += ((grain + grainLarge) - 0.03) * mix(1.0, 0.5, uDarkMode);

    // --- Postmark cancellation overlay (heavier, more visible) ---
    vec2 center = vec2(0.5, 0.5);
    float dist = length(uv - center);

    float outerRing = (1.0 - smoothstep(0.003, 0.008, abs(dist - 0.22))) * 0.3;
    float innerRing = (1.0 - smoothstep(0.003, 0.006, abs(dist - 0.18))) * 0.28;

    // wavy cancellation lines
    float lines = 0.0;
    for (int i = -3; i <= 3; i++) {
      float y = 0.5 + float(i) * 0.045;
      float wave = sin(uv.x * 25.0 + float(i) * 0.8) * 0.006;
      float d = abs(uv.y - y - wave);
      float edgeFade = smoothstep(0.05, 0.15, uv.x) * smoothstep(0.05, 0.15, 1.0 - uv.x);
      lines = max(lines, (1.0 - smoothstep(0.001, 0.004, d)) * 0.18 * edgeFade);
    }

    float postmark = max(outerRing, max(innerRing, lines));
    // ink fades unevenly
    float inkFade = fbm(uv * 15.0 + 7.0);
    postmark *= mix(0.6, 1.0, inkFade);
    vec3 inkColor = mix(vec3(0.15, 0.08, 0.18), vec3(0.5, 0.45, 0.55), uDarkMode);
    color.rgb = mix(color.rgb, inkColor, postmark);

    // --- Glossy protective film layer ---
    // Only over the image area
    if (imgUv.x >= 0.0 && imgUv.x <= 1.0 && imgUv.y >= 0.0 && imgUv.y <= 1.0) {

      // Diagonal specular highlight — like light hitting a laminated surface
      float specAngle = dot(imgUv - 0.5, normalize(vec2(0.7, 1.0)));
      float specular = smoothstep(0.05, 0.15, specAngle) * smoothstep(0.35, 0.2, specAngle);
      specular *= 0.18;

      // Secondary softer highlight for realism
      float spec2 = smoothstep(-0.15, -0.05, specAngle) * smoothstep(0.05, -0.05, specAngle);
      spec2 *= 0.06;

      // Subtle iridescent color shift on the highlight
      vec3 sheenColor = vec3(
        0.5 + 0.5 * sin(specAngle * 8.0),
        0.5 + 0.5 * sin(specAngle * 8.0 + 2.1),
        0.5 + 0.5 * sin(specAngle * 8.0 + 4.2)
      );

      // Film edge reflection — bright line at the border of the image area
      float edgeX = min(imgUv.x, 1.0 - imgUv.x);
      float edgeY = min(imgUv.y, 1.0 - imgUv.y);
      float edgeDist = min(edgeX, edgeY);
      float filmEdge = (1.0 - smoothstep(0.0, 0.04, edgeDist)) * 0.08;

      // Combine: white specular + subtle iridescence + edge
      float glossStrength = mix(1.0, 0.7, uDarkMode);
      color.rgb += (specular + spec2) * mix(vec3(1.0), sheenColor, 0.15) * glossStrength;
      color.rgb += filmEdge * glossStrength;

      // Very slight contrast boost from the film
      float filmLum = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      color.rgb = mix(color.rgb, color.rgb * (0.9 + 0.2 * filmLum), 0.1);
    }

    color.a = mask;
    gl_FragColor = color;
  }
`;

function StampMesh({ url }: { url: string }) {
  const texture = useLoader(THREE.TextureLoader, url);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uDarkMode: { value: 0.0 },
    }),
    [texture],
  );

  // CRT pattern: read system dark mode each frame, update uniform directly
  useFrame(() => {
    if (materialRef.current) {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      materialRef.current.uniforms.uDarkMode.value = isDark ? 1.0 : 0.0;
    }
  });

  return (
    <mesh>
      <planeGeometry args={[1, 1.25]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}

function StampFallback() {
  return <div className="w-full h-full rounded bg-surface-secondary animate-pulse" />;
}

export function PostStamp({ handle, className }: { handle: string; className?: string }) {
  const url = `https://unavatar.io/x/${handle}`;

  return (
    <motion.div
      className={cn("w-16 h-[70px]", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <StampErrorBoundary>
        <Canvas
          frameloop="always"
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
          orthographic
          camera={{ zoom: 56, near: 0.1, far: 10, position: [0, 0, 1] }}
          fallback={<StampFallback />}
        >
          <Suspense fallback={null}>
            <StampMesh url={url} />
          </Suspense>
        </Canvas>
      </StampErrorBoundary>
    </motion.div>
  );
}
