import { useEffect } from "react";
import { useContainer } from "./lib/container";
import { useStore } from "./lib/store";

const PAD = 0;
const FADE_MS = 220;
const MAX_PARTICLES = 200000;

const DENSITY_NORMAL = 0.090;
const DENSITY_ALARM = 0.180;
const FLOW_SPEED_NORMAL = 0.045;
const FLOW_SPEED_ALARM = 0.20;

const GREEN_TO_YELLOW_LOW = 0.25;
const GREEN_TO_YELLOW_HIGH = 0.32;
const YELLOW_TO_RED_LOW = 0.65;
const YELLOW_TO_RED_HIGH = 0.72;

const COLOR_NEUTRAL_DARK: [number, number, number] = [22 / 255, 56 / 255, 38 / 255];
const COLOR_GREEN_DARK: [number, number, number] = [18 / 255, 110 / 255, 56 / 255];
const COLOR_YELLOW_DARK: [number, number, number] = [200 / 255, 130 / 255, 0];
const COLOR_RED_DARK: [number, number, number] = [120 / 255, 8 / 255, 14 / 255];

const COLOR_NEUTRAL_LIGHT: [number, number, number] = [150 / 255, 235 / 255, 185 / 255];
const COLOR_GREEN_LIGHT: [number, number, number] = [120 / 255, 245 / 255, 170 / 255];
const COLOR_YELLOW_LIGHT: [number, number, number] = [255 / 255, 220 / 255, 110 / 255];
const COLOR_RED_LIGHT: [number, number, number] = [255 / 255, 130 / 255, 125 / 255];

function smoothstepN(e0: number, e1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

const VERT_300 = `#version 300 es
in vec2 a_pos;
in vec3 a_meta;
uniform float u_dpr;
out float v_alpha;
void main() {
  vec2 clip = a_pos * 2.0 - 1.0;
  clip.y = -clip.y;
  gl_Position = vec4(clip, 0.0, 1.0);
  gl_PointSize = a_meta.x * u_dpr;
  vec2 d = a_pos - vec2(0.5);
  float r = length(d) * 1.414;
  float fade = smoothstep(1.0, 0.7, r);
  v_alpha = a_meta.y * fade;
}
`;

const FRAG_300 = `#version 300 es
precision mediump float;
in float v_alpha;
uniform vec3 u_color;
out vec4 outColor;
void main() {
  vec2 p = gl_PointCoord - vec2(0.5);
  float d = length(p);
  float a = smoothstep(0.5, 0.0, d) * v_alpha;
  outColor = vec4(u_color * a, a);
}
`;

const VERT_100 = `
attribute vec2 a_pos;
attribute vec3 a_meta;
uniform float u_dpr;
varying float v_alpha;
void main() {
  vec2 clip = a_pos * 2.0 - 1.0;
  clip.y = -clip.y;
  gl_Position = vec4(clip, 0.0, 1.0);
  gl_PointSize = a_meta.x * u_dpr;
  vec2 d = a_pos - vec2(0.5);
  float r = length(d) * 1.414;
  float fade = smoothstep(1.0, 0.7, r);
  v_alpha = a_meta.y * fade;
}
`;

const FRAG_100 = `
precision mediump float;
varying float v_alpha;
uniform vec3 u_color;
void main() {
  vec2 p = gl_PointCoord - vec2(0.5);
  float d = length(p);
  float a = smoothstep(0.5, 0.0, d) * v_alpha;
  gl_FragColor = vec4(u_color * a, a);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error(`Shader compile failed: ${log}`);
  }
  return sh;
}

function makeProgram(gl: WebGLRenderingContext, vertSrc: string, fragSrc: string) {
  const vs = compile(gl, gl.VERTEX_SHADER, vertSrc);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragSrc);
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error(`Link failed: ${gl.getProgramInfoLog(prog)}`);
  }
  return prog;
}

const positions = new Float32Array(MAX_PARTICLES * 2);
const meta = new Float32Array(MAX_PARTICLES * 3);
const speedMul = new Float32Array(MAX_PARTICLES);
const initialized = { done: false };

function initParticles() {
  if (initialized.done) return;
  initialized.done = true;
  for (let i = 0; i < MAX_PARTICLES; i++) {
    positions[i * 2] = Math.random();
    positions[i * 2 + 1] = Math.random();
    const depth = Math.pow(Math.random(), 1.7);
    const size = 0.5 + depth * 0.9;
    const alpha = 0.40 + depth * 0.45;
    meta[i * 3] = size;
    meta[i * 3 + 1] = alpha;
    meta[i * 3 + 2] = 0.5 + depth * 0.9;
    speedMul[i] = 0.5 + depth * 0.9;
  }
}

function stepFlow(count: number, t: number, dt: number, flowSpeed: number) {
  const k1 = 3.1;
  const k2 = 5.7;
  const k3 = 7.9;
  const k4 = 12.0;
  const w1 = 0.11;
  const w2 = 0.07;
  const w3 = 0.05;
  const w4 = 0.03;

  const sin = Math.sin;
  const cos = Math.cos;
  const stepBase = flowSpeed * dt;

  for (let i = 0; i < count; i++) {
    const px = positions[i * 2];
    const py = positions[i * 2 + 1];

    let vx =
      sin(py * k1 + t * w1) -
      cos(py * k2 + t * w2 + 1.7) +
      0.55 * sin(py * k3 + t * w3 + 2.3) +
      0.30 * cos(py * k4 + t * w4 + 0.6);

    let vy =
      cos(px * k1 - t * w1) +
      sin(px * k2 + t * w2 + 0.4) +
      0.55 * cos(px * k3 - t * w3 + 1.1) +
      0.30 * sin(px * k4 - t * w4 + 2.7);

    vx *= 0.16;
    vy *= 0.16;

    const m = speedMul[i];
    let nx = px + vx * stepBase * m;
    let ny = py + vy * stepBase * m;

    if (nx < 0) nx -= Math.floor(nx);
    else if (nx >= 1) nx -= Math.floor(nx);
    if (ny < 0) ny -= Math.floor(ny);
    else if (ny >= 1) ny -= Math.floor(ny);

    positions[i * 2] = nx;
    positions[i * 2 + 1] = ny;
  }
}

type DrawArgs = {
  t: number;
  dt: number;
  dpr: number;
  count: number;
  darkColor: [number, number, number];
  lightColor: [number, number, number];
  flowSpeed: number;
};

type Renderer = {
  resize: (cw: number, ch: number) => void;
  draw: (args: DrawArgs) => void;
  destroy: () => void;
};

function makeWebGLRenderer(canvas: HTMLCanvasElement): Renderer | null {
  let gl: WebGL2RenderingContext | WebGLRenderingContext | null = canvas.getContext(
    "webgl2",
    {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      preserveDrawingBuffer: false,
    },
  ) as WebGL2RenderingContext | null;

  const isWebGL2 = !!gl;

  if (!gl) {
    gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      preserveDrawingBuffer: false,
    }) as WebGLRenderingContext | null;
  }

  if (!gl) return null;

  let prog: WebGLProgram;
  try {
    prog = makeProgram(gl, isWebGL2 ? VERT_300 : VERT_100, isWebGL2 ? FRAG_300 : FRAG_100);
  } catch (err) {
    console.warn("[slop-detector] particle shader failed:", err);
    return null;
  }

  gl.useProgram(prog);

  const posBuf = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);

  const metaBuf = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, metaBuf);
  gl.bufferData(gl.ARRAY_BUFFER, meta, gl.STATIC_DRAW);

  const aPos = gl.getAttribLocation(prog, "a_pos");
  const aMeta = gl.getAttribLocation(prog, "a_meta");

  gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, metaBuf);
  gl.enableVertexAttribArray(aMeta);
  gl.vertexAttribPointer(aMeta, 3, gl.FLOAT, false, 0, 0);

  const uColor = gl.getUniformLocation(prog, "u_color");
  const uDpr = gl.getUniformLocation(prog, "u_dpr");

  gl.enable(gl.BLEND);
  gl.clearColor(0, 0, 0, 0);

  return {
    resize(cw, ch) {
      gl!.viewport(0, 0, cw, ch);
    },
    draw({ t, dt, dpr, count, darkColor, lightColor, flowSpeed }) {
      stepFlow(count, t, dt, flowSpeed);
      gl!.bindBuffer(gl!.ARRAY_BUFFER, posBuf);
      gl!.bufferSubData(gl!.ARRAY_BUFFER, 0, positions, 0, count * 2);
      gl!.uniform1f(uDpr, dpr);
      gl!.clear(gl!.COLOR_BUFFER_BIT);

      gl!.blendFunc(gl!.ONE, gl!.ONE_MINUS_SRC_ALPHA);
      gl!.uniform3f(uColor, darkColor[0], darkColor[1], darkColor[2]);
      gl!.drawArrays(gl!.POINTS, 0, count);

      gl!.blendFunc(gl!.ONE, gl!.ONE);
      gl!.uniform3f(uColor, lightColor[0], lightColor[1], lightColor[2]);
      gl!.drawArrays(gl!.POINTS, 0, count);
    },
    destroy() {
      gl!.deleteBuffer(posBuf);
      gl!.deleteBuffer(metaBuf);
      gl!.deleteProgram(prog);
    },
  };
}

function make2DRenderer(canvas: HTMLCanvasElement): Renderer | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  let cw = 0,
    ch = 0;
  return {
    resize(w, h) {
      cw = w;
      ch = h;
    },
    draw({ t, dt, dpr, count, darkColor, lightColor, flowSpeed }) {
      stepFlow(count, t, dt, flowSpeed);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const w = cw / dpr;
      const h = ch / dpr;
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, w, h);
      const dr = Math.round(darkColor[0] * 255);
      const dg = Math.round(darkColor[1] * 255);
      const db = Math.round(darkColor[2] * 255);
      const lr = Math.round(lightColor[0] * 255);
      const lg = Math.round(lightColor[1] * 255);
      const lb = Math.round(lightColor[2] * 255);
      for (let pass = 0; pass < 2; pass++) {
        ctx.globalCompositeOperation = pass === 0 ? "source-over" : "lighter";
        for (let i = 0; i < count; i++) {
          const px = positions[i * 2];
          const py = positions[i * 2 + 1];
          const dx = px - 0.5;
          const dy = py - 0.5;
          const rr = Math.sqrt(dx * dx + dy * dy) * 1.414;
          const fade = rr <= 0.7 ? 1 : rr >= 1.0 ? 0 : 1 - (rr - 0.7) / 0.3;
          const size = meta[i * 3];
          const alpha = meta[i * 3 + 1] * fade;
          if (alpha <= 0.005) continue;
          if (pass === 0) {
            ctx.fillStyle = `rgba(${dr}, ${dg}, ${db}, ${alpha})`;
          } else {
            ctx.fillStyle = `rgba(${lr}, ${lg}, ${lb}, ${alpha})`;
          }
          ctx.beginPath();
          ctx.arc(px * w, py * h, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
    destroy() {},
  };
}

export function HighlightOverlay() {
  const container = useContainer();

  useEffect(() => {
    if (!container) return;
    initParticles();

    const EDGE_FADE =
      "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)";

    const wrap = document.createElement("div");
    wrap.style.cssText = [
      "position: absolute",
      "left: 0",
      "top: 0",
      "width: 0",
      "height: 0",
      "pointer-events: none",
      "z-index: 5",
      "opacity: 0",
      "overflow: hidden",
      "border-radius: 16px",
      `mask-image: ${EDGE_FADE}`,
      `-webkit-mask-image: ${EDGE_FADE}`,
      "mask-composite: intersect",
      "-webkit-mask-composite: source-in",
      `transition: opacity ${FADE_MS}ms ease`,
      "will-change: opacity",
      "isolation: auto",
    ].join(";");

    const canvas = document.createElement("canvas");
    canvas.style.cssText = [
      "position: absolute",
      "inset: 0",
      "width: 100%",
      "height: 100%",
      "opacity: 1",
    ].join(";");
    wrap.appendChild(canvas);

    const prevPosition = container.style.position;
    if (getComputedStyle(container).position === "static") {
      container.style.position = "relative";
    }
    container.appendChild(wrap);

    let renderer: Renderer | null = null;
    try {
      renderer = makeWebGLRenderer(canvas);
    } catch (err) {
      console.warn("[slop-detector] WebGL renderer failed, falling back:", err);
    }
    if (!renderer) {
      renderer = make2DRenderer(canvas);
    }

    if (!renderer) {
      return () => {
        wrap.remove();
        if (prevPosition !== container.style.position) {
          container.style.position = prevPosition;
        }
      };
    }

    let raf = 0;
    let lastT = performance.now();
    const start = lastT;

    let dimmedEl: HTMLElement | null = null;
    let savedOpacity = "";
    let savedTransition = "";
    const TARGET_DIM = "0.35";
    let verdictActive = false;

    const dimElement = (el: HTMLElement | null) => {
      if (el === dimmedEl) return;
      if (dimmedEl) {
        dimmedEl.style.opacity = savedOpacity;
        dimmedEl.style.transition = savedTransition;
      }
      if (el) {
        savedOpacity = el.style.opacity;
        savedTransition = el.style.transition;
        el.style.transition = "opacity 220ms ease";
        el.style.opacity = TARGET_DIM;
      }
      dimmedEl = el;
      verdictActive = false;
    };

    const tick = () => {
      const el = useStore.getState().highlighted;

      if (!el) {
        if (wrap.style.opacity !== "0") wrap.style.opacity = "0";
        dimElement(null);
        lastT = performance.now();
        raf = requestAnimationFrame(tick);
        return;
      }

      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        if (wrap.style.opacity !== "0") wrap.style.opacity = "0";
        dimElement(null);
        lastT = performance.now();
        raf = requestAnimationFrame(tick);
        return;
      }

      dimElement(el as HTMLElement);

      const containerRect = container.getBoundingClientRect();
      const w = rect.width + PAD * 2;
      const h = rect.height + PAD * 2;
      wrap.style.left = `${rect.left - containerRect.left - PAD}px`;
      wrap.style.top = `${rect.top - containerRect.top - PAD}px`;
      wrap.style.width = `${w}px`;
      wrap.style.height = `${h}px`;
      if (wrap.style.opacity !== "1") wrap.style.opacity = "1";

      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const cw = Math.round(w * dpr);
      const ch = Math.round(h * dpr);
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
        renderer!.resize(cw, ch);
      }

      const aiRating = useStore.getState().aiRating;

      if (aiRating <= 0.001) verdictActive = false;
      else if (!verdictActive) verdictActive = true;

      const yToR = smoothstepN(YELLOW_TO_RED_LOW, YELLOW_TO_RED_HIGH, aiRating);
      const gToY = smoothstepN(GREEN_TO_YELLOW_LOW, GREEN_TO_YELLOW_HIGH, aiRating);
      const greenW = verdictActive ? 1 - gToY : 0;
      const redW = verdictActive ? yToR : 0;
      const yellowW = verdictActive ? Math.max(0, gToY - yToR) : 0;
      const tierIntensity = Math.min(1, greenW + yellowW + redW);

      const density = lerp(DENSITY_NORMAL, DENSITY_ALARM, redW);
      const flowSpeed = lerp(FLOW_SPEED_NORMAL, FLOW_SPEED_ALARM, redW);

      const targetCount = Math.min(MAX_PARTICLES, Math.floor(w * h * density));

      const sum = greenW + yellowW + redW || 1;
      const blend = (
        neutral: [number, number, number],
        green: [number, number, number],
        yellow: [number, number, number],
        red: [number, number, number],
      ): [number, number, number] => {
        const r = green[0] * greenW + yellow[0] * yellowW + red[0] * redW;
        const g = green[1] * greenW + yellow[1] * yellowW + red[1] * redW;
        const b = green[2] * greenW + yellow[2] * yellowW + red[2] * redW;
        return [
          lerp(neutral[0], r / sum, tierIntensity),
          lerp(neutral[1], g / sum, tierIntensity),
          lerp(neutral[2], b / sum, tierIntensity),
        ];
      };
      const darkColor = blend(COLOR_NEUTRAL_DARK, COLOR_GREEN_DARK, COLOR_YELLOW_DARK, COLOR_RED_DARK);
      const lightColor = blend(
        COLOR_NEUTRAL_LIGHT,
        COLOR_GREEN_LIGHT,
        COLOR_YELLOW_LIGHT,
        COLOR_RED_LIGHT,
      );

      const now = performance.now();
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      const t = (now - start) * 0.001;

      renderer!.draw({
        t,
        dt,
        dpr,
        count: targetCount,
        darkColor,
        lightColor,
        flowSpeed,
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      renderer?.destroy();
      dimElement(null);
      wrap.remove();
      if (prevPosition !== container.style.position) {
        container.style.position = prevPosition;
      }
    };
  }, [container]);

  return null;
}
