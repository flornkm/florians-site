import { useEffect, useRef } from "react";
import { HORSE_MASK } from "./chrome-horse-shape";

/* A prancing horse cast in liquid chrome. Its silhouette is a real vector
   drawing (a licensed stock EPS) baked to a 1-bit mask; on mount that mask is
   decoded, drawn into a material texture and turned into a rounded height field
   via a distance transform (plus low-frequency muscle swells). A WebGL fragment
   shader then treats every pixel as a mirror: it reflects a blue-silver studio
   environment — bright sky, a dark navy horizon, a polished floor — through the
   surface curvature, with sharp key-light glints, a Fresnel edge, cavity shading
   and a warm gold sunset band, then snaps the result to a coarse cell grid so the
   chrome reads as chunky pixels. The reflected world rotates and a point light
   rides the cursor, so the horse shimmers and re-lights from new angles. */

// Material texture resolution (4:3). Sampled with bilinear filtering, so the chrome
// stays smooth at any display size — no visible pixels.
const TEX_W = 640;
const TEX_H = 480;

// Pixelation grid (4:3): the shader snaps each fragment to one of these cells and
// flat-shades it, so the realistic chrome reads as chunky pixels.
const GRID_W = 264;
const GRID_H = 198;

// Decode the packed silhouette mask into a canvas (opaque white horse on a
// transparent field) that can be drawn into the material texture at any size.
function maskCanvas(): HTMLCanvasElement {
  const { w, h, data } = HORSE_MASK;
  const bytes = atob(data);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("2d context failed");
  const img = ctx.createImageData(w, h);
  const d = img.data;
  for (let i = 0; i < w * h; i++) {
    const on = (bytes.charCodeAt(i >> 3) >> (i & 7)) & 1;
    d[i * 4] = 255;
    d[i * 4 + 1] = 255;
    d[i * 4 + 2] = 255;
    d[i * 4 + 3] = on ? 255 : 0;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

// Separable box blur (a few passes ≈ Gaussian) so the height field yields smooth,
// continuous normals instead of faceted staircases.
function blur(src: Float32Array, w: number, h: number, radius: number, passes: number) {
  let a: Float32Array<ArrayBufferLike> = src;
  let b: Float32Array<ArrayBufferLike> = new Float32Array(a.length);
  const norm = 1 / (radius * 2 + 1);
  for (let p = 0; p < passes; p++) {
    for (let y = 0; y < h; y++) {
      let sum = 0;
      for (let k = -radius; k <= radius; k++) sum += a[y * w + Math.min(w - 1, Math.max(0, k))];
      for (let x = 0; x < w; x++) {
        b[y * w + x] = sum * norm;
        const add = a[y * w + Math.min(w - 1, x + radius + 1)];
        const rem = a[y * w + Math.max(0, x - radius)];
        sum += add - rem;
      }
    }
    [a, b] = [b, a];
    for (let x = 0; x < w; x++) {
      let sum = 0;
      for (let k = -radius; k <= radius; k++) sum += a[Math.min(h - 1, Math.max(0, k)) * w + x];
      for (let y = 0; y < h; y++) {
        b[y * w + x] = sum * norm;
        const add = a[Math.min(h - 1, y + radius + 1) * w + x];
        const rem = a[Math.max(0, y - radius) * w + x];
        sum += add - rem;
      }
    }
    [a, b] = [b, a];
  }
  return a;
}

// Rasterize the horse and build the material texture: R = surface height, G = a soft
// anti-aliased coverage mask (drives edge alpha). Built at 2× and boxed down for a
// clean edge.
function buildTexture(): ImageData {
  const SS = 2;
  const hi = document.createElement("canvas");
  hi.width = TEX_W * SS;
  hi.height = TEX_H * SS;
  const hctx = hi.getContext("2d");
  if (!hctx) throw new Error("2d context failed");

  // Draw the silhouette mask, fit into the surface with generous margin (smaller
  // than the frame), preserving its aspect. Smoothing anti-aliases the edge so the
  // downsampled coverage is clean.
  const horse = maskCanvas();
  const boxH = TEX_H * SS * 0.52;
  const boxW = boxH * (horse.width / horse.height);
  // Center the silhouette's bounding box in the surface (the mask is cropped tight
  // to the horse, so this centers the horse's actual extents on both axes), nudged a
  // touch left so the head/body mass sits more centered than the raw bounding box.
  const x0 = (TEX_W * SS - boxW) / 2 - TEX_W * SS * 0.035;
  const y0 = (TEX_H * SS - boxH) / 2;
  hctx.imageSmoothingEnabled = true;
  hctx.imageSmoothingQuality = "high";
  hctx.drawImage(horse, x0, y0, boxW, boxH);

  const src = hctx.getImageData(0, 0, TEX_W * SS, TEX_H * SS).data;
  const cover = new Float32Array(TEX_W * TEX_H);
  const inside = new Uint8Array(TEX_W * TEX_H);
  for (let y = 0; y < TEX_H; y++) {
    for (let x = 0; x < TEX_W; x++) {
      let sum = 0;
      for (let sy = 0; sy < SS; sy++) {
        const row = ((y * SS + sy) * TEX_W * SS + x * SS) * 4 + 3;
        for (let sx = 0; sx < SS; sx++) sum += src[row + sx * 4];
      }
      const c = sum / (SS * SS) / 255;
      cover[y * TEX_W + x] = c;
      inside[y * TEX_W + x] = c > 0.5 ? 1 : 0;
    }
  }

  // Chamfer distance transform: how deep each pixel sits inside the silhouette.
  const CAP = 26;
  const dist = new Float32Array(TEX_W * TEX_H);
  for (let i = 0; i < dist.length; i++) dist[i] = inside[i] ? 1e6 : 0;
  const at = (x: number, y: number) =>
    x < 0 || y < 0 || x >= TEX_W || y >= TEX_H ? 0 : dist[y * TEX_W + x];
  for (let y = 0; y < TEX_H; y++) {
    for (let x = 0; x < TEX_W; x++) {
      if (!inside[y * TEX_W + x]) continue;
      const m = Math.min(
        at(x - 1, y) + 1,
        at(x, y - 1) + 1,
        at(x - 1, y - 1) + 1.414,
        at(x + 1, y - 1) + 1.414,
      );
      if (m < dist[y * TEX_W + x]) dist[y * TEX_W + x] = m;
    }
  }
  for (let y = TEX_H - 1; y >= 0; y--) {
    for (let x = TEX_W - 1; x >= 0; x--) {
      if (!inside[y * TEX_W + x]) continue;
      const m = Math.min(
        dist[y * TEX_W + x],
        at(x + 1, y) + 1,
        at(x, y + 1) + 1,
        at(x + 1, y + 1) + 1.414,
        at(x - 1, y + 1) + 1.414,
      );
      dist[y * TEX_W + x] = m;
    }
  }

  // Height: a rounded dome from the distance, plus broad low-frequency muscle swells
  // (shoulder, barrel, haunch) so the mirror ripples like a real cast body.
  const height = new Float32Array(TEX_W * TEX_H);
  for (let y = 0; y < TEX_H; y++) {
    for (let x = 0; x < TEX_W; x++) {
      const i = y * TEX_W + x;
      if (!inside[i]) continue;
      const d = Math.min(dist[i], CAP) / CAP;
      const fx = x / TEX_W;
      const fy = y / TEX_H;
      const u = 0.5 * Math.sin(fx * 11 + fy * 6) + 0.35 * Math.sin(fx * 7 - fy * 9 + 1.7);
      height[i] = Math.sqrt(d) + u * 0.02 * d;
    }
  }
  const smooth = blur(height, TEX_W, TEX_H, 2, 2);

  const out = new ImageData(TEX_W, TEX_H);
  const d = out.data;
  for (let i = 0; i < TEX_W * TEX_H; i++) {
    d[i * 4] = Math.max(0, Math.min(1, smooth[i])) * 255;
    d[i * 4 + 1] = Math.max(0, Math.min(1, cover[i])) * 255;
    d[i * 4 + 2] = 0;
    d[i * 4 + 3] = 255;
  }
  return out;
}

const VERT = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv = a_pos;
  gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0);
}`;

// Lighting is done in texture space: origin top-left, y down (so the pointer drops
// straight in as the light position).
const FRAG = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_tex;
uniform vec2 u_grid;    // pixelation cell grid (cols, rows)
uniform vec2 u_light;   // cursor light, texture space (y down)
uniform float u_hover;
uniform float u_time;
uniform float u_aspect;
out vec4 outColor;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }

// The reflected studio environment for a given reflection direction. eY: +1 looks up
// into the sky, 0 is the horizon, -1 looks down at the floor. Returns a blue-silver
// chrome world with a bright sky, a hard dark horizon, a polished floor, drifting
// cloud streaks and a warm gold sunset band just above the horizon.
vec3 env(vec3 r, float time) {
  // Gently rotate the world so reflections slide across the body over time.
  float a = 0.13 * sin(time * 0.55);
  float ca = cos(a), sa = sin(a);
  vec2 rr = mat2(ca, -sa, sa, ca) * r.xy;
  float eY = -rr.y;      // up is negative y in texture space
  float eX = rr.x;

  vec3 shadow = vec3(0.26, 0.34, 0.58);  // deepest blue the metal ever reads
  vec3 midBlue = vec3(0.50, 0.62, 0.88);
  vec3 skyBlue = vec3(0.72, 0.83, 0.99);
  vec3 white = vec3(0.98, 0.99, 1.0);
  vec3 floorCol = vec3(0.66, 0.74, 0.91);

  vec3 col = shadow;
  col = mix(col, midBlue, smoothstep(-0.15, 0.3, eY));
  col = mix(col, skyBlue, smoothstep(0.2, 0.62, eY));
  col = mix(col, white, smoothstep(0.58, 1.0, eY));
  col = mix(col, floorCol, smoothstep(-0.05, -0.55, eY));

  // A thin, dark horizon line — the mirror cue — but not a black band.
  col = mix(col, vec3(0.15, 0.21, 0.44), smoothstep(0.05, 0.0, abs(eY)) * 0.5);

  // Drifting cloud streaks up in the sky make the chrome shimmer as it turns.
  float cl = sin(eX * 7.0 + time * 0.8) * sin(eX * 3.3 - time * 0.5 + eY * 5.0);
  col += vec3(0.10, 0.11, 0.12) * smoothstep(0.35, 1.0, cl) * smoothstep(0.05, 0.5, eY);

  // Warm gold glow hugging the horizon (the sunset caught in the metal).
  float gold = smoothstep(0.0, 0.1, eY) * smoothstep(0.34, 0.1, eY);
  col = mix(col, vec3(0.92, 0.72, 0.33), gold * 0.45);

  return col;
}

void main() {
  // Aspect-fit the 4:3 material inside the canvas (contain): scale v_uv about its
  // centre so the horse keeps its proportions on any viewport — a tall portrait
  // (mobile) letterboxes top/bottom instead of stretching the horse vertically.
  const float texAspect = 4.0 / 3.0;
  vec2 fit = v_uv;
  vec2 lp = u_light;
  if (u_aspect > texAspect) {
    fit.x = (v_uv.x - 0.5) * (u_aspect / texAspect) + 0.5;
    lp.x = (u_light.x - 0.5) * (u_aspect / texAspect) + 0.5;
  } else {
    fit.y = (v_uv.y - 0.5) * (texAspect / u_aspect) + 0.5;
    lp.y = (u_light.y - 0.5) * (texAspect / u_aspect) + 0.5;
  }
  if (fit.x < 0.0 || fit.x > 1.0 || fit.y < 0.0 || fit.y > 1.0) discard;

  // Snap every fragment to a coarse cell grid: the chrome is still shaded by the
  // real reflections, but each cell paints one flat facet, so it reads as chunky
  // pixel art rather than a smooth render.
  vec2 cell = (floor(fit * u_grid) + 0.5) / u_grid;
  vec2 uv = vec2(cell.x, 1.0 - cell.y);

  float mask = texture(u_tex, uv).g;
  if (mask < 0.5) discard; // hard, blocky silhouette edge

  // Normal from neighbouring CELLS so each pixel is a single flat chrome facet.
  vec2 c = 1.0 / u_grid;
  float h = texture(u_tex, uv).r;
  float hxp = texture(u_tex, uv + vec2(c.x, 0.0)).r;
  float hxm = texture(u_tex, uv - vec2(c.x, 0.0)).r;
  float hyp = texture(u_tex, uv + vec2(0.0, c.y)).r;
  float hym = texture(u_tex, uv - vec2(0.0, c.y)).r;
  vec3 n = normalize(vec3(-(hxp - hxm) * 4.5, -(hyp - hym) * 4.5, 1.0));

  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 R = reflect(-V, n);

  // Mirror reflection of the environment — the bulk of the chrome look.
  vec3 col = env(R, u_time);

  // Cavity / ambient occlusion from a wider cell neighbourhood: recesses between the
  // limbs and along the rolled-off edges gather shadow, reading as solid cast metal.
  vec2 ax = vec2(c.x * 3.0, 0.0);
  vec2 ay = vec2(0.0, c.y * 3.0);
  float hWide = (texture(u_tex, uv + ax).r + texture(u_tex, uv - ax).r +
                 texture(u_tex, uv + ay).r + texture(u_tex, uv - ay).r) * 0.25;
  float ao = smoothstep(-0.05, 0.09, h - hWide);
  col *= mix(0.76, 1.0, ao);

  // Two sharp key-light glints (upper-left warm, upper-right cool) — the crisp white
  // hotspots that sell polished chrome. Softened so each glint spans a few cells.
  vec3 Lk = normalize(vec3(-0.5, -0.72, 0.5));
  float sk = pow(max(dot(n, normalize(Lk + V)), 0.0), 180.0);
  col += vec3(1.0, 0.99, 0.96) * sk * 1.4;
  vec3 L2 = normalize(vec3(0.55, -0.5, 0.6));
  float s2 = pow(max(dot(n, normalize(L2 + V)), 0.0), 80.0);
  col += vec3(0.85, 0.92, 1.0) * s2 * 0.6;

  // Point light riding the cursor — moving it re-lights the whole horse.
  vec3 toC = vec3((lp - uv) * vec2(texAspect, 1.0), 0.42);
  float cd = length(toC);
  vec3 Lc = toC / max(cd, 1e-4);
  float sc = pow(max(dot(n, normalize(Lc + V)), 0.0), 70.0);
  float atten = 1.0 / (1.0 + 2.5 * cd * cd);
  col += vec3(1.0) * sc * atten * (0.5 + 1.2 * u_hover);
  col += env(Lc, u_time) * max(dot(n, Lc), 0.0) * atten * 0.25 * u_hover;

  // Fresnel rim: edges turning away from the viewer always catch a little sky.
  float fres = pow(1.0 - max(n.z, 0.0), 3.0);
  col += fres * 0.16 * vec3(0.78, 0.86, 1.0);

  // Faint per-cell grain so broad faces aren't dead-clean.
  col += (hash(cell * u_grid) - 0.5) * 0.02;

  outColor = vec4(pow(clamp(col, 0.0, 1.0), vec3(0.9)), 1.0);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("shader alloc failed");
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "shader compile failed");
  }
  return shader;
}

function linkProgram(gl: WebGL2RenderingContext): WebGLProgram {
  const program = gl.createProgram();
  if (!program) throw new Error("program alloc failed");
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? "program link failed");
  }
  return program;
}

function boot(canvas: HTMLCanvasElement): (() => void) | undefined {
  const gl = canvas.getContext("webgl2", {
    antialias: true,
    alpha: true,
    premultipliedAlpha: false,
  });
  if (!gl) return undefined;

  const program = linkProgram(gl);
  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, "a_pos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, buildTexture());

  const uLight = gl.getUniformLocation(program, "u_light");
  const uAspect = gl.getUniformLocation(program, "u_aspect");
  const uHover = gl.getUniformLocation(program, "u_hover");
  const uTime = gl.getUniformLocation(program, "u_time");

  gl.useProgram(program);
  gl.uniform2f(gl.getUniformLocation(program, "u_grid"), GRID_W, GRID_H);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const cur = { x: 0.4, y: 0.32 };
  const target = { x: 0.4, y: 0.32 };
  let hover = 0;
  let hoverTarget = 0;
  let aspect = 4 / 3;

  let disposed = false;
  let raf = 0;
  let time = 0;
  let last = performance.now();

  const resize = () => {
    const b = canvas.getBoundingClientRect();
    if (b.width === 0 || b.height === 0) return;
    aspect = b.width / b.height;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.round(b.width * dpr);
    const h = Math.round(b.height * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  };

  const pointer = (e: PointerEvent) => {
    const b = canvas.getBoundingClientRect();
    target.x = (e.clientX - b.left) / b.width;
    target.y = (e.clientY - b.top) / b.height;
    hoverTarget = 1;
  };
  const leave = () => {
    hoverTarget = 0;
  };

  const frame = (now: number) => {
    if (disposed) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    time += dt;

    if (hoverTarget === 0) {
      target.x = 0.42 + Math.cos(time * 0.5) * 0.34;
      target.y = 0.36 + Math.sin(time * 0.72) * 0.22;
    }
    const ease = hoverTarget === 1 ? Math.min(1, dt * 10) : Math.min(1, dt * 2.5);
    cur.x += (target.x - cur.x) * ease;
    cur.y += (target.y - cur.y) * ease;
    hover += (hoverTarget - hover) * Math.min(1, dt * 5);

    gl.useProgram(program);
    gl.uniform2f(uLight, cur.x, cur.y);
    gl.uniform1f(uAspect, aspect);
    gl.uniform1f(uHover, hover);
    gl.uniform1f(uTime, time);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    raf = requestAnimationFrame(frame);
  };

  resize();
  raf = requestAnimationFrame(frame);

  // The dialog's open morph resizes the canvas without a window resize event.
  let settle = 0;
  let settleLast = 0;
  let stable = 0;
  const watch = () => {
    if (disposed) return;
    const w = canvas.getBoundingClientRect().width;
    if (Math.abs(w - settleLast) < 0.5) stable++;
    else stable = 0;
    settleLast = w;
    if (stable >= 3) {
      resize();
      return;
    }
    settle = requestAnimationFrame(watch);
  };
  settle = requestAnimationFrame(watch);

  canvas.addEventListener("pointermove", pointer);
  canvas.addEventListener("pointerdown", pointer);
  canvas.addEventListener("pointerleave", leave);
  window.addEventListener("resize", resize);

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    cancelAnimationFrame(settle);
    canvas.removeEventListener("pointermove", pointer);
    canvas.removeEventListener("pointerdown", pointer);
    canvas.removeEventListener("pointerleave", leave);
    window.removeEventListener("resize", resize);
  };
}

export const ChromeHorse = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    return boot(canvasRef.current);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 size-full touch-none" aria-hidden />;
};
