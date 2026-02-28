import { useEffect, useRef } from "react";

const VERT_SRC = /* glsl */ `#version 300 es
precision highp float;
in vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG_SRC = /* glsl */ `#version 300 es
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

out vec4 fragColor;

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

float fbm(vec2 p, float t) {
  float val = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int i = 0; i < 6; i++) {
    val += amp * noise(p * freq + t * 0.3 * float(i + 1) * 0.15);
    freq *= 2.07;
    amp *= 0.48;
    p = mat2(0.8, 0.6, -0.6, 0.8) * p;
  }
  return val;
}

vec3 hue2rgb(float h) {
  h = fract(h) * 6.0;
  float r = abs(h - 3.0) - 1.0;
  float g = 2.0 - abs(h - 2.0);
  float b = 2.0 - abs(h - 4.0);
  return clamp(vec3(r, g, b), 0.0, 1.0);
}

vec3 thinFilm(float phase) {
  vec3 c1 = hue2rgb(phase);
  vec3 c2 = hue2rgb(phase + 0.33);
  vec3 c3 = hue2rgb(phase + 0.66);
  float t = sin(phase * 6.2831853) * 0.5 + 0.5;
  return mix(c1, mix(c2, c3, t), 0.5);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 centered = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);

  vec2 mouse = (u_mouse - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  float mouseDist = length(centered - mouse);
  float bulge = 0.15 / (mouseDist + 0.3);
  vec2 warp = normalize(centered - mouse + 0.001) * bulge * 0.12;
  vec2 p = centered + warp;

  float t = u_time * 0.25;

  float n1 = fbm(p * 3.0 + vec2(t * 0.7, t * 0.5), t);
  float n2 = fbm(p * 5.0 + vec2(-t * 0.4, t * 0.8) + n1 * 0.8, t * 1.3);
  float n3 = fbm(p * 8.0 + vec2(t * 0.3, -t * 0.6) + n2 * 0.5, t * 0.7);
  float n4 = fbm(p * 2.0 + vec2(t * 0.2, t * 0.1) + n3 * 1.2, t * 0.5);

  float phase = n1 * 0.4 + n2 * 0.3 + n3 * 0.2 + n4 * 0.1;
  phase += sin(n1 * 6.2831853 + t) * 0.15;
  phase += cos(n2 * 4.0 - t * 0.7) * 0.1;

  vec3 color = thinFilm(phase);

  float highlight = pow(max(0.0, sin(phase * 12.5663706 + t * 2.0)), 4.0);
  color += vec3(highlight * 0.15);

  float satBoost = 1.0 + 0.3 * sin(phase * 6.2831853);
  vec3 gray = vec3(dot(color, vec3(0.299, 0.587, 0.114)));
  color = mix(gray, color, satBoost);

  float vignette = 1.0 - 0.55 * dot(centered, centered);
  color *= vignette;

  color = pow(color, vec3(0.92));

  fragColor = vec4(color, 1.0);
}
`;

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext, vert: WebGLShader, frag: WebGLShader): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

export function LiquidCrystalDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<[number, number]>([0, 0]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false });
    if (!gl) return;

    const vert = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC);
    const frag = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
    if (!vert || !frag) return;

    const program = createProgram(gl, vert, frag);
    if (!program) return;

    const posLoc = gl.getAttribLocation(program, "a_pos");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uMouse = gl.getUniformLocation(program, "u_mouse");

    const quadVerts = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const vao = gl.createVertexArray();
    const vbo = gl.createBuffer();

    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, quadVerts, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    gl.useProgram(program);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const startTime = performance.now();

    const render = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouseRef.current[0], mouseRef.current[1]);

      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      gl.deleteBuffer(vbo);
      gl.deleteVertexArray(vao);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
      gl.deleteProgram(program);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio, 2);
    const x = (e.clientX - rect.left) * dpr;
    const y = (rect.height - (e.clientY - rect.top)) * dpr;
    mouseRef.current = [x, y];
  };

  return <canvas ref={canvasRef} onMouseMove={handleMouseMove} className="h-full w-full" />;
}
