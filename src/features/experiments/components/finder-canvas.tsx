import { useEffect, useRef } from "react";

/* The Finder folder area as a WebGL surface — "macOS Finder, but the files
   are sticky". The image file is a sticker: grab it anywhere and it peels up
   from that exact spot (cylinder fold, backside showing through), pull far
   enough and it fully detaches, then it dangles with the cursor and sticks
   down wherever you drop it — rotation and all. */

const IMAGE_SRC = "/images/experiments/img-2003.webp";
const FILE_NAME = "IMG_2003.jpg";

/* Finder icon-view metrics, in window-logical pixels. */
const CELL_X = 30;
const CELL_Y = 24;
const THUMB_MAX_W = 96;
const THUMB_MAX_H = 72;
const LABEL_GAP = 7;
const LABEL_FONT_SIZE = 13;
const CORNER_RADIUS = 3;

/* Peel + physics tuning. */
const GRID_COLS = 48;
const GRID_ROWS = 36;
const PEEL_FOLD_FACTOR = 0.55; // fold line advances at ~half drag distance
const HELD_LIFT_PX = 13;

const SYSTEM_FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", "Segoe UI", system-ui, sans-serif';

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
uniform vec2 u_shadowOffset;
uniform vec2 u_shadowSpread;
out vec2 v_uv;
out float v_z;

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

  p.z += u_lift * float(${HELD_LIFT_PX});
  v_z = p.z;

  vec2 c = u_size * 0.5;
  vec2 q = p.xy - c;
  float s = sin(u_angle);
  float co = cos(u_angle);
  q = vec2(q.x * co - q.y * s, q.x * s + q.y * co);
  vec2 world = u_center + q + u_shadowOffset + p.z * u_shadowSpread;

  vec2 clip = (world / u_resolution) * 2.0 - 1.0;
  // Lifted material sits closer to the viewer; depth testing keeps the
  // folded-over flap in front of the flat body regardless of draw order.
  gl_Position = vec4(clip.x, -clip.y, -p.z * 0.001, 1.0);
}`;

/* Sticker color pass: photo front, papery adhesive back with the print
   faintly showing through (mirrored by the fold geometry itself), rounded
   corners + hairline via SDF, gentle height shading. */
const FRAG_STICKER = `#version 300 es
precision highp float;
in vec2 v_uv;
in float v_z;
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
  float alpha = 1.0 - smoothstep(-0.5, 0.5, d);

  vec3 img = texture(u_tex, v_uv).rgb;
  vec3 col;
  if (gl_FrontFacing) {
    float shade = 1.0 - clamp(v_z / 240.0, 0.0, 1.0) * 0.16;
    col = img * shade;
    float border = smoothstep(-2.0, -1.0, d) * 0.14;
    col = mix(col, vec3(0.0), border);
  } else {
    // Adhesive side: near-white with the artwork ghosting through.
    vec3 back = mix(vec3(0.965, 0.965, 0.955), img, 0.16);
    float shade = 1.0 - clamp(v_z / 260.0, 0.0, 1.0) * 0.1;
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
out vec4 outColor;

float sdRoundRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  vec2 p = (v_uv - 0.5) * u_size;
  float d = sdRoundRect(p, u_size * 0.5, u_radius);
  float mask = 1.0 - smoothstep(-0.5, 0.5, d);
  float a = u_shadowAlpha * mix(1.0, 0.45, clamp(v_z / 80.0, 0.0, 1.0)) * mask;
  outColor = vec4(0.0, 0.0, 0.0, a);
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

/* Textured quad in pixel space — shadow composite and the filename label. */
const VERT_QUAD = `#version 300 es
in vec2 a_unit;
uniform vec2 u_resolution;
uniform vec4 u_rect;
out vec2 v_uv;
void main() {
  v_uv = a_unit;
  vec2 world = u_rect.xy + a_unit * u_rect.zw;
  vec2 clip = (world / u_resolution) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
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

function makeLabelTexture(
  gl: WebGL2RenderingContext,
  text: string,
  scale: number,
  dark: boolean,
): { texture: WebGLTexture; width: number; height: number } {
  const font = `300 ${LABEL_FONT_SIZE * scale}px ${SYSTEM_FONT}`;
  const pad = Math.ceil(2 * scale);
  const measure = document.createElement("canvas").getContext("2d");
  if (!measure) throw new Error("2d context failed");
  measure.font = font;
  const width = Math.ceil(measure.measureText(text).width) + pad * 2;
  const height = Math.ceil(LABEL_FONT_SIZE * 1.4 * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d context failed");
  ctx.font = font;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillStyle = dark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)";
  ctx.fillText(text, width / 2, height / 2);

  const texture = gl.createTexture();
  if (!texture) throw new Error("texture alloc failed");
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return { texture, width, height };
}

export function FinderCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
    });
    if (!gl) return;

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
    let image: HTMLImageElement | null = null;
    let imageTexture: WebGLTexture | null = null;
    let label: { texture: WebGLTexture; width: number; height: number; key: string } | null = null;
    let fboA: ReturnType<typeof makeFbo> | null = null;
    let fboB: ReturnType<typeof makeFbo> | null = null;

    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

    /* Sticker size, resolved once the image loads. */
    let stickerW = THUMB_MAX_W;
    let stickerH = THUMB_MAX_H;

    const state: StickerState = {
      mode: "rest",
      center: { x: CELL_X + THUMB_MAX_W / 2, y: CELL_Y + THUMB_MAX_H / 2 },
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

    /* Pointer position in window-logical canvas coords. */
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
        x: dx * c - dy * s + stickerW / 2,
        y: dx * s + dy * c + stickerH / 2,
      };
    };

    let grabStartCanvas: Vec2 = { x: 0, y: 0 };
    let lastPointer: Vec2 = { x: 0, y: 0 };
    let lastPointerTime = 0;
    let pointerVel: Vec2 = { x: 0, y: 0 };

    const maxPeelExtent = () => {
      // Furthest corner projection along the peel direction from the grab.
      const corners = [
        { x: 0, y: 0 },
        { x: stickerW, y: 0 },
        { x: 0, y: stickerH },
        { x: stickerW, y: stickerH },
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
      if (e.button !== 0 || !imageTexture) return;
      const p = pointerLocal(e);
      const local = toSticker(p);
      const inside = local.x >= 0 && local.x <= stickerW && local.y >= 0 && local.y <= stickerH;
      if (!inside || state.mode === "held") return;
      e.stopPropagation();
      canvas.setPointerCapture(e.pointerId);
      state.mode = "peel";
      state.grabLocal = local;
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
          // Peel away from the grab: the fold sweeps from the grab point
          // toward the sticker's far side, so the grabbed region lifts first,
          // folds forward over the front (backside up), and the far corner is
          // the last to release. A little drag lean keeps it lively.
          const s = Math.sin(-state.angle);
          const c = Math.cos(-state.angle);
          const dragLocal = {
            x: (dragCanvas.x * c - dragCanvas.y * s) / len,
            y: (dragCanvas.x * s + dragCanvas.y * c) / len,
          };
          let baseX = stickerW / 2 - state.grabLocal.x;
          let baseY = stickerH / 2 - state.grabLocal.y;
          const baseLen = Math.hypot(baseX, baseY);
          if (baseLen < 6) {
            // Grabbed dead-center: peel upward in canvas terms.
            baseX = -Math.sin(state.angle);
            baseY = -Math.cos(state.angle);
          } else {
            baseX /= baseLen;
            baseY /= baseLen;
          }
          const mixX = baseX + dragLocal.x * 0.3;
          const mixY = baseY + dragLocal.y * 0.3;
          const mixLen = Math.hypot(mixX, mixY) || 1;
          state.peelDir = { x: mixX / mixLen, y: mixY / mixLen };
        }
        state.peelTarget = len;
        // Fully peeled once the fold has swept past the far edge → detach.
        // No teleport: the spring carries it to the cursor from where it sat.
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
          x: state.grabLocal.x - stickerW / 2,
          y: state.grabLocal.y - stickerH / 2,
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
        // Keep it inside the folder area.
        state.targetCenter = {
          x: Math.min(Math.max(state.center.x, 26), canvas.offsetWidth - 26),
          y: Math.min(Math.max(state.center.y, 22), canvas.offsetHeight - 30),
        };
      }
    };

    const onPointerUp = () => endInteraction();
    const onPointerCancel = () => endInteraction();

    /* ---------- Simulation ---------- */

    const step = (dt: number): boolean => {
      let active = false;

      if (state.mode === "peel") {
        if (state.peelReturning) {
          // Spring the fold back down with a hint of overshoot.
          state.peelLen += (0 - state.peelLen) * Math.min(1, dt * 14);
          if (state.peelLen < 0.4) {
            state.peelLen = 0;
            state.peelReturning = false;
            state.mode = "rest";
          } else {
            active = true;
          }
        } else {
          // Track the drag with slight adhesive lag.
          state.peelLen += (state.peelTarget - state.peelLen) * Math.min(1, dt * 26);
          active = true;
        }
      }

      if (state.mode === "held" || state.mode === "settle") {
        const holding = state.mode === "held";
        const stiffness = holding ? 420 : 460;
        const damping = holding ? 30 : 42;
        const ax = stiffness * (state.targetCenter.x - state.center.x) - damping * state.vel.x;
        const ay = stiffness * (state.targetCenter.y - state.center.y) - damping * state.vel.y;
        state.vel.x += ax * dt;
        state.vel.y += ay * dt;
        state.center.x += state.vel.x * dt;
        state.center.y += state.vel.y * dt;

        // Paper dangle: tilt follows horizontal velocity while held; once
        // dropped it plants at the release angle instead of drifting.
        const targetAngle = holding
          ? state.restAngle + Math.max(-0.4, Math.min(0.4, state.vel.x * 0.0011))
          : state.settleAngle;
        const angAcc = holding
          ? 140 * (targetAngle - state.angle) - 16 * state.angVel
          : 260 * (targetAngle - state.angle) - 26 * state.angVel;
        state.angVel += angAcc * dt;
        state.angle += state.angVel * dt;

        // Hover height: up while held; on release it presses down fast and
        // sticks dead — no bounce below the surface.
        const liftTarget = holding ? 1 : 0;
        const liftStiffness = holding ? 300 : 480;
        const liftDamping = holding ? 22 : 40;
        const liftAcc = liftStiffness * (liftTarget - state.lift) - liftDamping * state.liftVel;
        state.liftVel += liftAcc * dt;
        state.lift += state.liftVel * dt;
        if (!holding && state.lift <= 0.01) {
          state.lift = 0;
          if (state.liftVel < 0) state.liftVel = 0;
        }

        // The flap finishes relaxing right after detach.
        state.peelLen += (0 - state.peelLen) * Math.min(1, dt * 12);

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
          active = true;
        }
      }

      return active;
    };

    /* ---------- Rendering ---------- */

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
      gl.uniform2f(loc(program, "u_size"), stickerW * k, stickerH * k);
      gl.uniform2f(loc(program, "u_center"), state.center.x * k, state.center.y * k);
      gl.uniform1f(loc(program, "u_angle"), state.angle);
      gl.uniform2f(loc(program, "u_grab"), state.grabLocal.x * k, state.grabLocal.y * k);
      gl.uniform2f(loc(program, "u_peelDir"), state.peelDir.x, state.peelDir.y);
      gl.uniform1f(loc(program, "u_peelLen"), state.peelLen * k);
      const foldRadius = 9 + Math.min(state.peelLen / 90, 1) * 7;
      gl.uniform1f(loc(program, "u_foldRadius"), foldRadius * k);
      gl.uniform1f(loc(program, "u_lift"), state.lift * k);
    };

    const render = () => {
      if (disposed || !image || !imageTexture) return;

      const bounds = canvas.getBoundingClientRect();
      if (bounds.width === 0) return;
      const dpr = window.devicePixelRatio || 1;
      const backingW = Math.round(bounds.width * dpr);
      const backingH = Math.round(bounds.height * dpr);
      if (canvas.width !== backingW || canvas.height !== backingH) {
        canvas.width = backingW;
        canvas.height = backingH;
        fboA = fboB = null;
      }
      const k = canvas.width / canvas.offsetWidth;

      const fboW = Math.max(2, Math.round(backingW / 2));
      const fboH = Math.max(2, Math.round(backingH / 2));
      if (!fboA || fboA.width !== fboW) {
        fboA = makeFbo(gl, fboW, fboH);
        fboB = makeFbo(gl, fboW, fboH);
      }
      if (!fboA || !fboB) return;

      gl.disable(gl.CULL_FACE);
      // The clip-space y flip inverts winding; our grid is front-facing CW.
      gl.frontFace(gl.CW);
      gl.enable(gl.BLEND);
      gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      /* Shadow silhouette into FBO A. */
      gl.bindFramebuffer(gl.FRAMEBUFFER, fboA.framebuffer);
      gl.viewport(0, 0, fboW, fboH);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(shadowProgram);
      bindMesh(shadowProgram);
      setMeshUniforms(shadowProgram, backingW, backingH, k);
      const drop = 2.5 + state.lift * 8;
      gl.uniform2f(loc(shadowProgram, "u_shadowOffset"), 0, drop * k);
      gl.uniform2f(loc(shadowProgram, "u_shadowSpread"), 0.12, 0.4);
      gl.uniform1f(loc(shadowProgram, "u_shadowAlpha"), 0.34 - state.lift * 0.12);
      gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_SHORT, 0);

      /* Two-pass gaussian blur A → B → A. */
      const blurRadius = (1.6 + state.lift * 1.8 + Math.min(state.peelLen / 60, 1) * 1.2) / fboW;
      gl.useProgram(blurProgram);
      bindQuad(blurProgram);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fboB.framebuffer);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindTexture(gl.TEXTURE_2D, fboA.texture);
      gl.uniform1i(loc(blurProgram, "u_tex"), 0);
      gl.uniform2f(loc(blurProgram, "u_dir"), blurRadius, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fboA.framebuffer);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindTexture(gl.TEXTURE_2D, fboB.texture);
      gl.uniform2f(loc(blurProgram, "u_dir"), 0, (blurRadius * fboW) / fboH);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      /* Composite to screen: shadow, sticker, label. */
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, backingW, backingH);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.useProgram(quadProgram);
      bindQuad(quadProgram);
      gl.uniform2f(loc(quadProgram, "u_resolution"), backingW, backingH);
      gl.uniform4f(loc(quadProgram, "u_rect"), 0, backingH, backingW, -backingH);
      gl.bindTexture(gl.TEXTURE_2D, fboA.texture);
      gl.uniform1i(loc(quadProgram, "u_tex"), 0);
      gl.uniform1f(loc(quadProgram, "u_opacity"), 1);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      gl.useProgram(stickerProgram);
      bindMesh(stickerProgram);
      setMeshUniforms(stickerProgram, backingW, backingH, k);
      gl.uniform2f(loc(stickerProgram, "u_shadowOffset"), 0, 0);
      gl.uniform2f(loc(stickerProgram, "u_shadowSpread"), 0, 0);
      gl.uniform1f(loc(stickerProgram, "u_radius"), CORNER_RADIUS * k);
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);
      gl.uniform1i(loc(stickerProgram, "u_tex"), 0);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_SHORT, 0);
      gl.disable(gl.DEPTH_TEST);

      /* Filename label under the sticker's current footprint. */
      const labelKey = `${Math.round(k * 100)}|${darkQuery.matches}`;
      if (!label || label.key !== labelKey) {
        const made = makeLabelTexture(gl, FILE_NAME, k, darkQuery.matches);
        label = { ...made, key: labelKey };
      }
      const halfH =
        (Math.abs(Math.sin(state.angle)) * stickerW + Math.abs(Math.cos(state.angle)) * stickerH) /
        2;
      const labelX = state.center.x * k - label.width / 2;
      const labelY = (state.center.y + halfH + LABEL_GAP) * k;
      const labelOpacity = state.mode === "held" ? 0.35 : 1;
      gl.useProgram(quadProgram);
      bindQuad(quadProgram);
      gl.uniform2f(loc(quadProgram, "u_resolution"), backingW, backingH);
      gl.uniform4f(loc(quadProgram, "u_rect"), labelX, labelY, label.width, label.height);
      gl.bindTexture(gl.TEXTURE_2D, label.texture);
      gl.uniform1f(loc(quadProgram, "u_opacity"), labelOpacity);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const tick = (now: number) => {
      raf = 0;
      if (disposed) return;
      const dt = Math.min(0.034, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      const active = step(dt);
      render();
      if (active || state.mode === "peel" || state.mode === "held" || state.mode === "settle") {
        raf = requestAnimationFrame(tick);
      }
    };

    const img = new Image();
    img.src = IMAGE_SRC;
    img.onload = () => {
      if (disposed) return;
      image = img;
      const fit = Math.min(THUMB_MAX_W / img.width, THUMB_MAX_H / img.height);
      stickerW = img.width * fit;
      stickerH = img.height * fit;
      state.center = {
        x: CELL_X + THUMB_MAX_W / 2,
        y: CELL_Y + stickerH / 2 + (THUMB_MAX_H - stickerH) / 2,
      };
      const texture = gl.createTexture();
      if (!texture) return;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.generateMipmap(gl.TEXTURE_2D);
      imageTexture = texture;
      render();
    };

    const onResize = () => render();
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerCancel);
    window.addEventListener("resize", onResize);
    darkQuery.addEventListener("change", onResize);

    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerCancel);
      window.removeEventListener("resize", onResize);
      darkQuery.removeEventListener("change", onResize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />;
}
