import { useEffect, useRef } from "react";

/* One file, centered, as a peel-off sticker. Grab it anywhere and it peels up
   from that exact spot (cylinder fold, papery backside showing through); pull
   far enough and it fully detaches, dangles with the cursor, and sticks back
   down wherever you drop it — rotation and all. A stripped-down cousin of the
   Finder canvas: a single sticker, no window, no grid, no label. */

interface FileDef {
  svg: string;
  radius?: number;
}

/* The macOS ZIP document icon, redrawn as vector art — deliberately without the
   baked top-right page curl. Here the paper is real: the bend only appears when
   you actually peel it. */
const ZIP_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 432 576">
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ededef"/>
      <stop offset="0.28" stop-color="#f5f5f6"/>
      <stop offset="1" stop-color="#f5f5f6"/>
    </linearGradient>
  </defs>
  <rect width="432" height="576" fill="url(#paper)"/>
  <g fill="#adadad">
    <path fill-rule="evenodd" d="M184.2 46.95a32.45 32.45 0 0 1 64.9 0v68.55a32.45 32.45 0 0 1-64.9 0Zm11.95 68.6a20.5 20.5 0 1 0 41 0 20.5 20.5 0 0 0-41 0Z"/>
    <rect x="214" y="166.5" width="39.2" height="21.1" rx="10.5"/>
    <rect x="178.9" y="187.6" width="39.2" height="21.1" rx="10.5"/>
    <rect x="214" y="208.7" width="39.2" height="21.1" rx="10.5"/>
    <rect x="178.9" y="229.8" width="39.2" height="21.1" rx="10.5"/>
    <rect x="214" y="250.9" width="39.2" height="21.1" rx="10.5"/>
    <rect x="178.9" y="272.0" width="39.2" height="21.1" rx="10.5"/>
  </g>
  <text x="216.5" y="535" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif" font-size="79" font-weight="500" fill="#b6b6b6" text-anchor="middle">ZIP</text>
</svg>`;

const FILE: FileDef = { svg: ZIP_SVG, radius: 14 };

/* The sticker fits within this share of the surface's shorter runs. */
const MAX_W_FRACTION = 0.24;
const MAX_H_FRACTION = 0.32;
const CORNER_RADIUS = 3;

/* Peel + physics tuning. */
const GRID_COLS = 48;
const GRID_ROWS = 36;
const PEEL_FOLD_FACTOR = 0.55; // fold line advances at ~half drag distance
const HELD_LIFT_PX = 13;

/* Shared mesh vertex shader: cylinder-fold peel in sticker-local space, then
   rigid placement. The same source serves the color pass and (with offsets)
   the shadow pass. */
const VERT_MESH = `#version 300 es
precision highp float;
in vec2 a_unit;
uniform vec2 u_resolution;
uniform vec2 u_size;
uniform vec2 u_center;
uniform float u_angle;
uniform vec2 u_grab;
uniform vec2 u_peelDir;
uniform float u_peelLen;
uniform float u_foldRadius;
uniform float u_lift;
uniform float u_scale;
uniform vec2 u_shadowOffset;
uniform vec2 u_shadowSpread;
out vec2 v_uv;
out float v_z;
out float v_fold; // fold height only, without the uniform lift — for shading

const float PI = 3.14159265;

void main() {
  vec2 local = a_unit * u_size;
  v_uv = a_unit;
  vec3 p = vec3(local, 0.0);

  if (u_peelLen > 0.001) {
    float fold = u_peelLen * ${PEEL_FOLD_FACTOR.toFixed(2)};
    vec2 rel = local - u_grab;
    vec2 side = vec2(-u_peelDir.y, u_peelDir.x);
    float along = dot(rel, u_peelDir);
    float across = dot(rel, side);
    float d = fold - along;
    if (d > 0.0) {
      float r = u_foldRadius;
      float cyl = PI * r;
      float alongNew;
      float z;
      if (d < cyl) {
        float ph = d / r;
        alongNew = fold - r * sin(ph);
        z = r * (1.0 - cos(ph));
      } else {
        alongNew = fold + (d - cyl);
        z = 2.0 * r;
      }
      p = vec3(u_grab + u_peelDir * alongNew + side * across, z);
    }
  }

  v_fold = p.z; // the peel curl only, before the whole sheet is lifted
  p.z += u_lift * float(${HELD_LIFT_PX});
  v_z = p.z;

  vec2 c = u_size * 0.5;
  vec2 q = (p.xy - c) * u_scale; // grow slightly when raised, press back on stick
  float s = sin(u_angle);
  float co = cos(u_angle);
  q = vec2(q.x * co - q.y * s, q.x * s + q.y * co);
  vec2 world = u_center + q + u_shadowOffset + p.z * u_shadowSpread;

  vec2 clip = (world / u_resolution) * 2.0 - 1.0;
  // Lifted material sits closer to the viewer; depth testing keeps the
  // folded-over flap in front of the flat body regardless of draw order.
  gl_Position = vec4(clip.x, -clip.y, -p.z * 0.001, 1.0);
}`;

/* Sticker color pass: page front, papery adhesive back with the print faintly
   showing through (mirrored by the fold geometry itself), rounded corners +
   hairline via SDF, gentle height shading. */
const FRAG_STICKER = `#version 300 es
precision highp float;
in vec2 v_uv;
in float v_z;
in float v_fold;
uniform sampler2D u_tex;
uniform vec2 u_size;
uniform float u_radius;
out vec4 outColor;

float sdRoundRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  vec2 p = (v_uv - 0.5) * u_size;
  float d = sdRoundRect(p, u_size * 0.5, u_radius);
  float alpha = 1.0 - smoothstep(-0.8, 0.8, d);
  // Transparent corners must not write depth — they'd punch holes through the
  // flat body lying beneath a folded flap.
  if (alpha < 0.01) discard;

  // Gamma lift: opens up the shadows of darker artwork without clipping
  // highlights (near-white pixels are barely touched).
  vec3 img = pow(texture(u_tex, v_uv).rgb, vec3(0.78));
  vec3 col;
  if (gl_FrontFacing) {
    // Matte paper: no gloss or reflection. Only the curl of a peel falls into
    // soft shadow — and we key that off v_fold, not v_z, so simply lifting the
    // whole (flat) sheet while dragging never darkens it.
    float shade = 1.0 - clamp(v_fold / 200.0, 0.0, 1.0) * 0.2;
    col = img * shade;
  } else {
    // Adhesive side: white, with only a whisper of the print ghosting through.
    vec3 back = mix(vec3(1.0), img, 0.06);
    float shade = 1.0 - clamp(v_fold / 240.0, 0.0, 1.0) * 0.16;
    col = back * shade;
  }

  outColor = vec4(col * alpha, alpha);
}`;

/* Shadow pass: the same folded mesh stamped as translucent black; lifted
   parts drift further and fade, then the whole thing is gaussian-blurred. */
const FRAG_SHADOW = `#version 300 es
precision highp float;
in vec2 v_uv;
in float v_z;
uniform vec2 u_size;
uniform float u_radius;
uniform float u_shadowAlpha;
uniform vec3 u_tint; // black — the shadow colour
out vec4 outColor;

float sdRoundRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

uniform float u_gateLo;
uniform float u_gateHi;

void main() {
  vec2 p = (v_uv - 0.5) * u_size;
  float d = sdRoundRect(p, u_size * 0.5, u_radius);
  float mask = 1.0 - smoothstep(-0.5, 0.5, d);
  // The gate selects which heights cast in this pass: the ground pass keeps
  // it wide open, the self-shadow pass admits lifted material only.
  float gate = smoothstep(u_gateLo, u_gateHi, v_z);
  float a = u_shadowAlpha * mix(1.0, 0.45, clamp(v_z / 80.0, 0.0, 1.0)) * mask * gate;
  outColor = vec4(u_tint * a, a);
}`;

const VERT_SCREEN = `#version 300 es
in vec2 a_unit;
out vec2 v_uv;
void main() {
  v_uv = a_unit;
  gl_Position = vec4(a_unit * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAG_BLUR = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_tex;
uniform vec2 u_dir;
out vec4 outColor;
void main() {
  vec4 sum = vec4(0.0);
  sum += texture(u_tex, v_uv - u_dir * 4.0) * 0.0162;
  sum += texture(u_tex, v_uv - u_dir * 3.0) * 0.0540;
  sum += texture(u_tex, v_uv - u_dir * 2.0) * 0.1216;
  sum += texture(u_tex, v_uv - u_dir * 1.0) * 0.1945;
  sum += texture(u_tex, v_uv) * 0.2270;
  sum += texture(u_tex, v_uv + u_dir * 1.0) * 0.1945;
  sum += texture(u_tex, v_uv + u_dir * 2.0) * 0.1216;
  sum += texture(u_tex, v_uv + u_dir * 3.0) * 0.0540;
  sum += texture(u_tex, v_uv + u_dir * 4.0) * 0.0162;
  outColor = sum;
}`;

/* Textured quad in pixel space — the shadow composite. */
const VERT_QUAD = `#version 300 es
in vec2 a_unit;
uniform vec2 u_resolution;
uniform vec4 u_rect;
uniform float u_depth;
out vec2 v_uv;
void main() {
  v_uv = a_unit;
  vec2 world = u_rect.xy + a_unit * u_rect.zw;
  vec2 clip = (world / u_resolution) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, u_depth, 1.0);
}`;

const FRAG_QUAD = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_tex;
uniform float u_opacity;
out vec4 outColor;
void main() {
  outColor = texture(u_tex, v_uv) * u_opacity;
}`;

interface Vec2 {
  x: number;
  y: number;
}

type Mode = "rest" | "peel" | "held" | "settle";

interface StickerState {
  mode: Mode;
  center: Vec2;
  angle: number;
  /* peel */
  grabLocal: Vec2;
  peelDir: Vec2;
  peelLen: number;
  peelTarget: number;
  peelReturning: boolean;
  /* held / settle */
  vel: Vec2;
  angVel: number;
  lift: number;
  liftVel: number;
  targetCenter: Vec2;
  restAngle: number;
  settleAngle: number;
}

function compile(gl: WebGL2RenderingContext, vertSrc: string, fragSrc: string): WebGLProgram {
  const make = (type: number, src: string) => {
    const shader = gl.createShader(type);
    if (!shader) throw new Error("shader alloc failed");
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader) ?? "shader compile failed");
    }
    return shader;
  };
  const program = gl.createProgram();
  if (!program) throw new Error("program alloc failed");
  gl.attachShader(program, make(gl.VERTEX_SHADER, vertSrc));
  gl.attachShader(program, make(gl.FRAGMENT_SHADER, fragSrc));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? "program link failed");
  }
  return program;
}

function makeGridMesh(gl: WebGL2RenderingContext) {
  const positions: number[] = [];
  for (let row = 0; row <= GRID_ROWS; row++) {
    for (let col = 0; col <= GRID_COLS; col++) {
      positions.push(col / GRID_COLS, row / GRID_ROWS);
    }
  }
  const indices: number[] = [];
  const stride = GRID_COLS + 1;
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const i = row * stride + col;
      indices.push(i, i + 1, i + stride, i + 1, i + stride + 1, i + stride);
    }
  }
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  return { vbo, ibo, count: indices.length };
}

function makeUnitQuad(gl: WebGL2RenderingContext) {
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1]),
    gl.STATIC_DRAW,
  );
  return vbo;
}

function makeFbo(gl: WebGL2RenderingContext, width: number, height: number) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return { framebuffer, texture, width, height };
}

export function StickerFileCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Defer GL boot one frame so the React commit and the context/shader
    // setup don't share (and overrun) a single frame mid-animation.
    let cancelled = false;
    let teardown: (() => void) | undefined;
    const bootRaf = requestAnimationFrame(() => {
      if (!cancelled) teardown = boot(canvas);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(bootRaf);
      teardown?.();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 h-full w-full cursor-grab touch-none active:cursor-grabbing"
    />
  );
}

function boot(canvas: HTMLCanvasElement): (() => void) | undefined {
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    antialias: true,
    premultipliedAlpha: true,
    // Sticker pixels are stencil-marked so the self-shadow pass can shade
    // only sticker surfaces.
    stencil: true,
    // We render on demand; keep the last frame so the compositor never
    // catches a cleared buffer (one-frame flash) when the loop spins up.
    preserveDrawingBuffer: true,
  });
  if (!gl) return undefined;

  const stickerProgram = compile(gl, VERT_MESH, FRAG_STICKER);
  const shadowProgram = compile(gl, VERT_MESH, FRAG_SHADOW);
  const blurProgram = compile(gl, VERT_SCREEN, FRAG_BLUR);
  const quadProgram = compile(gl, VERT_QUAD, FRAG_QUAD);
  const mesh = makeGridMesh(gl);
  const quad = makeUnitQuad(gl);

  const loc = (program: WebGLProgram, name: string) => gl.getUniformLocation(program, name);

  let disposed = false;
  let raf = 0;
  let lastTime = 0;
  let fboA: ReturnType<typeof makeFbo> | null = null;
  let fboB: ReturnType<typeof makeFbo> | null = null;
  let fboC: ReturnType<typeof makeFbo> | null = null;

  const state: StickerState = {
    mode: "rest",
    center: { x: 0, y: 0 },
    angle: 0,
    grabLocal: { x: 0, y: 0 },
    peelDir: { x: 1, y: 0 },
    peelLen: 0,
    peelTarget: 0,
    peelReturning: false,
    vel: { x: 0, y: 0 },
    angVel: 0,
    lift: 0,
    liftVel: 0,
    targetCenter: { x: 0, y: 0 },
    restAngle: 0,
    settleAngle: 0,
  };

  const sticker = {
    texture: null as WebGLTexture | null,
    naturalW: 0,
    naturalH: 0,
    w: 100,
    h: 100,
    state,
  };

  // Once the user has grabbed it, leave it wherever they drop it; until then
  // keep it fitted and centered as the surface resizes.
  let userMoved = false;
  let active = false;

  /* Size the sticker to the surface and (until touched) center it. */
  const layoutSticker = () => {
    if (!sticker.naturalW || !sticker.naturalH) return;
    const cw = canvas.offsetWidth;
    const ch = canvas.offsetHeight;
    if (cw === 0 || ch === 0) return;
    const maxW = Math.max(120, cw * MAX_W_FRACTION);
    const maxH = Math.max(120, ch * MAX_H_FRACTION);
    const fit = Math.min(maxW / sticker.naturalW, maxH / sticker.naturalH);
    sticker.w = sticker.naturalW * fit;
    sticker.h = sticker.naturalH * fit;
    if (!userMoved) {
      state.center = { x: cw / 2, y: ch / 2 };
      state.targetCenter = { x: cw / 2, y: ch / 2 };
    }
  };

  /* Pointer position in surface-logical canvas coords. */
  const pointerLocal = (e: PointerEvent): Vec2 => {
    const bounds = canvas.getBoundingClientRect();
    const scale = bounds.width / canvas.offsetWidth;
    return { x: (e.clientX - bounds.left) / scale, y: (e.clientY - bounds.top) / scale };
  };

  /* Canvas point → sticker-local (0..size) space. */
  const toSticker = (p: Vec2): Vec2 => {
    const dx = p.x - state.center.x;
    const dy = p.y - state.center.y;
    const s = Math.sin(-state.angle);
    const c = Math.cos(-state.angle);
    return {
      x: dx * c - dy * s + sticker.w / 2,
      y: dx * s + dy * c + sticker.h / 2,
    };
  };

  let dragging = false;
  let grabStartCanvas: Vec2 = { x: 0, y: 0 };
  let lastPointer: Vec2 = { x: 0, y: 0 };
  let lastPointerTime = 0;
  let pointerVel: Vec2 = { x: 0, y: 0 };

  /* Fold direction before any drag lean: from the grab point toward the
     sticker's far side (canvas-up if grabbed dead-center). */
  const basePeelDir = (grabLocal: Vec2): Vec2 => {
    const x = sticker.w / 2 - grabLocal.x;
    const y = sticker.h / 2 - grabLocal.y;
    const len = Math.hypot(x, y);
    if (len < 6) {
      return { x: -Math.sin(state.angle), y: -Math.cos(state.angle) };
    }
    return { x: x / len, y: y / len };
  };

  const maxPeelExtent = () => {
    // Furthest corner projection along the peel direction from the grab.
    const corners = [
      { x: 0, y: 0 },
      { x: sticker.w, y: 0 },
      { x: 0, y: sticker.h },
      { x: sticker.w, y: sticker.h },
    ];
    let max = 0;
    for (const corner of corners) {
      const proj =
        (corner.x - state.grabLocal.x) * state.peelDir.x +
        (corner.y - state.grabLocal.y) * state.peelDir.y;
      if (proj > max) max = proj;
    }
    return max;
  };

  const startFrameLoop = () => {
    if (!raf) {
      lastTime = performance.now();
      raf = requestAnimationFrame(tick);
    }
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0 || dragging || !sticker.texture) return;
    const p = pointerLocal(e);
    const local = toSticker(p);
    const inside = local.x >= 0 && local.x <= sticker.w && local.y >= 0 && local.y <= sticker.h;
    if (!inside) return;
    canvas.setPointerCapture(e.pointerId);
    dragging = true;
    userMoved = true;
    state.mode = "peel";
    state.grabLocal = local;
    // Seed the fold direction immediately: the first sub-pixel movement of a
    // click must never render with the previous grab's direction.
    state.peelDir = basePeelDir(local);
    state.peelLen = 0;
    state.peelTarget = 0;
    state.peelReturning = false;
    grabStartCanvas = p;
    lastPointer = p;
    lastPointerTime = performance.now();
    pointerVel = { x: 0, y: 0 };
    startFrameLoop();
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!dragging) return;
    if (state.mode !== "peel" && state.mode !== "held") return;
    const p = pointerLocal(e);

    // Pointer velocity carries into the detach so the hand-off is seamless.
    const now = performance.now();
    const elapsed = Math.max(1, now - lastPointerTime);
    pointerVel = {
      x: ((p.x - lastPointer.x) / elapsed) * 1000,
      y: ((p.y - lastPointer.y) / elapsed) * 1000,
    };
    lastPointer = p;
    lastPointerTime = now;

    if (state.mode === "peel") {
      const dragCanvas = { x: p.x - grabStartCanvas.x, y: p.y - grabStartCanvas.y };
      const len = Math.hypot(dragCanvas.x, dragCanvas.y);
      if (len > 0.5) {
        // Peel away from the grab: the fold sweeps from the grab point toward
        // the sticker's far side, so the grabbed region lifts first, folds
        // forward over the front (backside up), and the far corner is the last
        // to release. A little drag lean keeps it lively.
        const s = Math.sin(-state.angle);
        const c = Math.cos(-state.angle);
        const dragLocal = {
          x: (dragCanvas.x * c - dragCanvas.y * s) / len,
          y: (dragCanvas.x * s + dragCanvas.y * c) / len,
        };
        const base = basePeelDir(state.grabLocal);
        const mixX = base.x + dragLocal.x * 0.3;
        const mixY = base.y + dragLocal.y * 0.3;
        const mixLen = Math.hypot(mixX, mixY) || 1;
        state.peelDir = { x: mixX / mixLen, y: mixY / mixLen };
      }
      state.peelTarget = len;
      // Fully peeled once the fold has swept past the far edge → detach. No
      // teleport: the spring carries it to the cursor from where it sat.
      if (state.peelLen * PEEL_FOLD_FACTOR > maxPeelExtent() + 4) {
        state.mode = "held";
        state.restAngle = state.angle;
        state.vel = { x: pointerVel.x * 0.55, y: pointerVel.y * 0.55 };
        state.angVel = 0;
        state.peelTarget = 0; // the flap relaxes flat while held
      }
    }
    if (state.mode === "held") {
      const grabOffset = {
        x: state.grabLocal.x - sticker.w / 2,
        y: state.grabLocal.y - sticker.h / 2,
      };
      const s = Math.sin(state.angle);
      const c = Math.cos(state.angle);
      state.targetCenter = {
        x: p.x - (grabOffset.x * c - grabOffset.y * s),
        y: p.y - (grabOffset.x * s + grabOffset.y * c),
      };
    }
  };

  const endInteraction = () => {
    if (!dragging) return;
    if (state.mode === "peel") {
      // Released before it came off — the adhesive wins, snap back down.
      state.peelReturning = true;
    } else if (state.mode === "held") {
      state.mode = "settle";
      // Paper doesn't glide: kill most momentum the moment it's let go, and
      // lock the angle it was dropped at so it plants instead of drifting.
      state.vel.x *= 0.25;
      state.vel.y *= 0.25;
      state.angVel *= 0.35;
      state.settleAngle = state.angle;
      // Keep it inside the surface.
      const mx = sticker.w / 2;
      const my = sticker.h / 2;
      state.targetCenter = {
        x: Math.min(Math.max(state.center.x, mx), canvas.offsetWidth - mx),
        y: Math.min(Math.max(state.center.y, my), canvas.offsetHeight - my),
      };
    }
    dragging = false;
  };

  const onPointerUp = () => endInteraction();
  const onPointerCancel = () => endInteraction();

  const step = (dt: number): boolean => {
    let stepping = false;

    if (state.mode === "peel") {
      if (state.peelReturning) {
        // Spring the fold back down with a hint of overshoot.
        state.peelLen += (0 - state.peelLen) * Math.min(1, dt * 14);
        if (state.peelLen < 0.4) {
          state.peelLen = 0;
          state.peelReturning = false;
          state.mode = "rest";
        } else {
          stepping = true;
        }
      } else {
        // Track the drag with slight adhesive lag.
        state.peelLen += (state.peelTarget - state.peelLen) * Math.min(1, dt * 26);
        stepping = true;
      }
    }

    if (state.mode === "held" || state.mode === "settle") {
      const holding = state.mode === "held";
      // Softer springs on release so the sheet eases back down and sticks over
      // a visible beat, instead of snapping flat in a couple of frames.
      const stiffness = holding ? 420 : 300;
      const damping = holding ? 30 : 30;
      const ax = stiffness * (state.targetCenter.x - state.center.x) - damping * state.vel.x;
      const ay = stiffness * (state.targetCenter.y - state.center.y) - damping * state.vel.y;
      state.vel.x += ax * dt;
      state.vel.y += ay * dt;
      state.center.x += state.vel.x * dt;
      state.center.y += state.vel.y * dt;

      // Paper dangle: tilt follows horizontal velocity while held; once
      // dropped it eases to the release angle instead of drifting or snapping.
      const targetAngle = holding
        ? state.restAngle + Math.max(-0.4, Math.min(0.4, state.vel.x * 0.0011))
        : state.settleAngle;
      const angAcc = holding
        ? 140 * (targetAngle - state.angle) - 16 * state.angVel
        : 170 * (targetAngle - state.angle) - 22 * state.angVel;
      state.angVel += angAcc * dt;
      state.angle += state.angVel * dt;

      // Hover height: up while held; on release it eases down and presses to the
      // surface. Slightly under-damped + the floor clamp give a soft "stick"
      // with no bounce back up.
      const liftTarget = holding ? 1 : 0;
      const liftStiffness = holding ? 300 : 200;
      const liftDamping = holding ? 22 : 24;
      const liftAcc = liftStiffness * (liftTarget - state.lift) - liftDamping * state.liftVel;
      state.liftVel += liftAcc * dt;
      state.lift += state.liftVel * dt;
      if (!holding && state.lift <= 0.01) {
        state.lift = 0;
        if (state.liftVel < 0) state.liftVel = 0;
      }

      // The fold unfurls flat as it lowers, easing rather than snapping.
      state.peelLen += (0 - state.peelLen) * Math.min(1, dt * (holding ? 12 : 13));

      const speed =
        Math.hypot(state.vel.x, state.vel.y) +
        Math.abs(state.angVel) * 60 +
        Math.abs(state.liftVel) * 40;
      const displaced =
        Math.hypot(state.targetCenter.x - state.center.x, state.targetCenter.y - state.center.y) +
        state.peelLen;
      if (!holding && speed < 1.5 && displaced < 0.5 && state.lift < 0.005) {
        state.mode = "rest";
        state.lift = 0;
        state.liftVel = 0;
        state.peelLen = 0;
        state.vel = { x: 0, y: 0 };
        state.angVel = 0;
      } else {
        stepping = true;
      }
    }

    return stepping;
  };

  const bindMesh = (program: WebGLProgram) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vbo);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.ibo);
    const attr = gl.getAttribLocation(program, "a_unit");
    gl.enableVertexAttribArray(attr);
    gl.vertexAttribPointer(attr, 2, gl.FLOAT, false, 8, 0);
  };

  const bindQuad = (program: WebGLProgram) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    const attr = gl.getAttribLocation(program, "a_unit");
    gl.enableVertexAttribArray(attr);
    gl.vertexAttribPointer(attr, 2, gl.FLOAT, false, 8, 0);
  };

  const setMeshUniforms = (program: WebGLProgram, resW: number, resH: number, k: number) => {
    gl.uniform2f(loc(program, "u_resolution"), resW, resH);
    gl.uniform2f(loc(program, "u_size"), sticker.w * k, sticker.h * k);
    gl.uniform2f(loc(program, "u_center"), state.center.x * k, state.center.y * k);
    gl.uniform1f(loc(program, "u_angle"), state.angle);
    gl.uniform2f(loc(program, "u_grab"), state.grabLocal.x * k, state.grabLocal.y * k);
    gl.uniform2f(loc(program, "u_peelDir"), state.peelDir.x, state.peelDir.y);
    gl.uniform1f(loc(program, "u_peelLen"), state.peelLen * k);
    const foldRadius = 9 + Math.min(state.peelLen / 90, 1) * 7;
    gl.uniform1f(loc(program, "u_foldRadius"), foldRadius * k);
    gl.uniform1f(loc(program, "u_lift"), state.lift * k);
    // Default: no scale. The sticker pass overrides this so only the sheet
    // grows/presses; its ground shadow keeps its true footprint.
    gl.uniform1f(loc(program, "u_scale"), 1);
  };

  const render = (resize = false) => {
    if (disposed || !sticker.texture) return;

    // Resizing the backing reallocates canvas + FBOs — only do it on explicit
    // occasions (settle, window resize), never per frame.
    if (resize || canvas.width <= 1) {
      const bounds = canvas.getBoundingClientRect();
      if (bounds.width === 0) return;
      // Supersample beyond devicePixelRatio: the browser downscales the
      // backing store, smoothing alpha-to-coverage edges and mip transitions
      // that otherwise read as slight pixelation.
      const dpr = (window.devicePixelRatio || 1) * 2;
      const backingW = Math.round(bounds.width * dpr);
      const backingH = Math.round(bounds.height * dpr);
      if (canvas.width !== backingW || canvas.height !== backingH) {
        canvas.width = backingW;
        canvas.height = backingH;
        fboA = fboB = fboC = null;
      }
    }
    const backingW = canvas.width;
    const backingH = canvas.height;
    const k = canvas.width / canvas.offsetWidth;

    const fboW = Math.max(2, Math.round(backingW / 2));
    const fboH = Math.max(2, Math.round(backingH / 2));
    if (!fboA || fboA.width !== fboW) {
      fboA = makeFbo(gl, fboW, fboH);
      fboB = makeFbo(gl, fboW, fboH);
      fboC = makeFbo(gl, fboW, fboH);
    }
    if (!fboA || !fboB || !fboC) return;

    gl.disable(gl.CULL_FACE);
    // The clip-space y flip inverts winding; our grid is front-facing CW.
    gl.frontFace(gl.CW);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    gl.clearColor(0, 0, 0, 0);

    /* Self-shadow silhouette (lifted material only) into FBO C — this layer
       lands on sticker surfaces beneath overhanging flaps. */
    gl.useProgram(shadowProgram);
    bindMesh(shadowProgram);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fboC.framebuffer);
    gl.viewport(0, 0, fboW, fboH);
    gl.clear(gl.COLOR_BUFFER_BIT);
    setMeshUniforms(shadowProgram, backingW, backingH, k);
    gl.uniform3f(loc(shadowProgram, "u_tint"), 0, 0, 0);
    gl.uniform1f(loc(shadowProgram, "u_gateLo"), 5 * k);
    gl.uniform1f(loc(shadowProgram, "u_gateHi"), 15 * k);
    gl.uniform2f(loc(shadowProgram, "u_shadowOffset"), 0, 2 * k);
    gl.uniform2f(loc(shadowProgram, "u_shadowSpread"), 0.08, 0.22);
    // A soft, gentle crease under a folded flap — not a hard dark outline.
    gl.uniform1f(loc(shadowProgram, "u_shadowAlpha"), 0.12);
    gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_SHORT, 0);

    /* Two-pass gaussian blur helper, radius scaled by the sticker's liveliness. */
    const baseBlur = (3.4 + state.lift * 1.7 + Math.min(state.peelLen / 60, 1) * 1.1) / fboW;
    const blur = (from: NonNullable<typeof fboA>, to: NonNullable<typeof fboA>, radius: number) => {
      gl.useProgram(blurProgram);
      bindQuad(blurProgram);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fboB!.framebuffer);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindTexture(gl.TEXTURE_2D, from.texture);
      gl.uniform1i(loc(blurProgram, "u_tex"), 0);
      gl.uniform2f(loc(blurProgram, "u_dir"), radius, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.bindFramebuffer(gl.FRAMEBUFFER, to.framebuffer);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindTexture(gl.TEXTURE_2D, fboB!.texture);
      gl.uniform2f(loc(blurProgram, "u_dir"), 0, (radius * fboW) / fboH);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    blur(fboC, fboC, baseBlur * 1.0);

    /* Composite to screen: stacked ground shadow, then sticker. */
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, backingW, backingH);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

    /* One cast of the ground shadow: stamp the folded silhouette dropped `drop`
       pixels down, blur it, and composite it under the sheet. `drop` and
       `spread` scale with the sheet's height so the shadow opens up only when
       it's actually lifted. */
    const castGroundShadow = (drop: number, spread: number, blurMul: number, alpha: number) => {
      gl.useProgram(shadowProgram);
      bindMesh(shadowProgram);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fboA!.framebuffer);
      gl.viewport(0, 0, fboW, fboH);
      gl.clear(gl.COLOR_BUFFER_BIT);
      setMeshUniforms(shadowProgram, backingW, backingH, k);
      gl.uniform3f(loc(shadowProgram, "u_tint"), 0, 0, 0);
      gl.uniform1f(loc(shadowProgram, "u_gateLo"), -2);
      gl.uniform1f(loc(shadowProgram, "u_gateHi"), -1);
      gl.uniform2f(loc(shadowProgram, "u_shadowOffset"), 0, drop * (1 + state.lift * 2.5) * k);
      gl.uniform2f(loc(shadowProgram, "u_shadowSpread"), spread * 0.35, spread);
      gl.uniform1f(loc(shadowProgram, "u_shadowAlpha"), alpha);
      gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_SHORT, 0);

      blur(fboA!, fboA!, baseBlur * blurMul);

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, backingW, backingH);
      gl.useProgram(quadProgram);
      bindQuad(quadProgram);
      gl.uniform2f(loc(quadProgram, "u_resolution"), backingW, backingH);
      gl.uniform4f(loc(quadProgram, "u_rect"), 0, backingH, backingW, -backingH);
      gl.bindTexture(gl.TEXTURE_2D, fboA!.texture);
      gl.uniform1i(loc(quadProgram, "u_tex"), 0);
      gl.uniform1f(loc(quadProgram, "u_opacity"), 1);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    // Two soft casts — a key shadow just below the sheet and a wider, fainter
    // ambient. Both are broadly blurred on purpose: a crisp contact layer would
    // stipple into a serrated ring when the poster is downscaled.
    //                drop  spread blurMul alpha
    castGroundShadow(5, 0.28, 2.2, 0.12);
    castGroundShadow(11, 0.5, 3.6, 0.05);

    gl.useProgram(stickerProgram);
    bindMesh(stickerProgram);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    // Mark sticker pixels so the self-shadow can be clipped to them.
    gl.enable(gl.STENCIL_TEST);
    gl.stencilFunc(gl.ALWAYS, 1, 0xff);
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
    // The SDF cutout antialiases itself in the fragment shader (smoothstep on
    // the signed distance), so the edge blends smoothly — no alpha-to-coverage,
    // which only has MSAA-many opacity steps and stipples the straight edges.
    setMeshUniforms(stickerProgram, backingW, backingH, k);
    gl.uniform2f(loc(stickerProgram, "u_shadowOffset"), 0, 0);
    gl.uniform2f(loc(stickerProgram, "u_shadowSpread"), 0, 0);
    // Raised while held (scale > 1), pressing back to 1 as it sticks — the
    // visible half of the settle animation.
    gl.uniform1f(loc(stickerProgram, "u_scale"), 1 + state.lift * 0.06);
    gl.uniform1f(loc(stickerProgram, "u_radius"), (FILE.radius ?? CORNER_RADIUS) * k);
    gl.bindTexture(gl.TEXTURE_2D, sticker.texture);
    gl.uniform1i(loc(stickerProgram, "u_tex"), 0);
    gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_SHORT, 0);

    /* Self-shadow on top: only sticker pixels (stencil) whose surface is flat
       (depth) — the flap shades the body beneath it, never itself. */
    gl.stencilFunc(gl.EQUAL, 1, 0xff);
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
    gl.depthMask(false);
    gl.useProgram(quadProgram);
    bindQuad(quadProgram);
    gl.uniform2f(loc(quadProgram, "u_resolution"), backingW, backingH);
    gl.uniform4f(loc(quadProgram, "u_rect"), 0, backingH, backingW, -backingH);
    gl.uniform1f(loc(quadProgram, "u_depth"), -0.001 * 4 * k);
    gl.bindTexture(gl.TEXTURE_2D, fboC.texture);
    gl.uniform1i(loc(quadProgram, "u_tex"), 0);
    gl.uniform1f(loc(quadProgram, "u_opacity"), 1);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.uniform1f(loc(quadProgram, "u_depth"), 0);
    gl.depthMask(true);
    gl.disable(gl.STENCIL_TEST);
    gl.disable(gl.DEPTH_TEST);
  };

  const tick = (now: number) => {
    raf = 0;
    if (disposed) return;
    const dt = Math.min(0.034, Math.max(0.001, (now - lastTime) / 1000));
    lastTime = now;
    active = step(dt);
    render();
    if (active || state.mode !== "rest") {
      raf = requestAnimationFrame(tick);
    }
  };

  const applySource = (source: TexImageSource, width: number, height: number) => {
    if (disposed) return;
    sticker.naturalW = width;
    sticker.naturalH = height;
    layoutSticker();
    const texture = gl.createTexture();
    if (!texture) return;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.generateMipmap(gl.TEXTURE_2D);
    // Sharper minification for high-res sources, where supported.
    const aniso = gl.getExtension("EXT_texture_filter_anisotropic");
    if (aniso) {
      const max = gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT) as number;
      gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, max));
    }
    sticker.texture = texture;
    render(true);
  };

  // Rasterize the vector at 4x its viewBox for a crisp texture.
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(FILE.svg)}`;
  img
    .decode()
    .then(() => {
      if (disposed) return;
      const raster = document.createElement("canvas");
      raster.width = img.width * 4;
      raster.height = img.height * 4;
      const ctx = raster.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, raster.width, raster.height);
      applySource(raster, raster.width, raster.height);
    })
    .catch(() => {});

  const onResize = () => {
    layoutSticker();
    render(true);
  };
  // The dialog's opening morph changes the canvas's visual size without a
  // resize event. Wait (cheaply — no rendering) until the bounds settle, then
  // do a single full-resolution render.
  let settleRaf = 0;
  let settleLast = 0;
  let settleStable = 0;
  let settleFrames = 0;
  const settleWatch = () => {
    const width = canvas.getBoundingClientRect().width;
    if (Math.abs(width - settleLast) < 0.5) settleStable++;
    else settleStable = 0;
    settleLast = width;
    settleFrames++;
    if (settleStable >= 3 || settleFrames > 120) {
      layoutSticker();
      render(true);
      return;
    }
    settleRaf = requestAnimationFrame(settleWatch);
  };
  settleRaf = requestAnimationFrame(settleWatch);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerCancel);
  window.addEventListener("resize", onResize);

  return () => {
    disposed = true;
    if (raf) cancelAnimationFrame(raf);
    if (settleRaf) cancelAnimationFrame(settleRaf);
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerup", onPointerUp);
    canvas.removeEventListener("pointercancel", onPointerCancel);
    window.removeEventListener("resize", onResize);
  };
}
