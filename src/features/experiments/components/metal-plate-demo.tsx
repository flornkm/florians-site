import { useEffect, useRef } from "react";

/* A cast-metal machine nameplate, rebuilt from scratch in WebGL and floating on
   the plain dialog surface — no chrome, just the sign. A 2D canvas rasterizes it
   into a single RGBA "material" texture — R holds surface height (relief), G is
   the plate's alpha mask (worn, irregular edge), B carries baked wear — and one
   fragment shader turns that height field into per-pixel normals, layers on
   procedural brushed grain, tarnish and pitting, and lights the whole thing from
   a point light that rides the cursor. Every raised element and every scratch
   catches a highlight that sweeps as you move. */

interface PlateText {
  company: string;
  subtitle: string;
  city: string;
  left: string;
  right: string;
  corner: string;
}

// Change these to re-letter the plate; the raster is built once on mount.
const TEXT: PlateText = {
  company: "HEIDENREICH & HARBECK",
  subtitle: "Werkzeugmaschinenfabrik",
  city: "HAMBURG",
  left: "14878",
  right: "1939",
  corner: "319/2",
};

// Internal raster resolution of the material texture. 4:3 to match the dialog.
// Oversized so the cast lettering and fine scratches stay crisp, not soft.
const TEX_W = 1800;
const TEX_H = 1350;
const TEX_ASPECT = TEX_W / TEX_H;

const VERT = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv = a_pos;
  gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0);
}`;

// Lighting is done in "texture space": origin top-left, y down, so the pointer
// position (also y-down) drops straight in as the light position.
const FRAG = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_tex;
uniform vec2 u_texel;
uniform vec2 u_light;   // light position, texture space (y down)
uniform float u_lightZ; // light height above the plate
uniform float u_aspect;
uniform float u_hover;  // 1 while the cursor drives the light, 0 idle
out vec4 outColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) { s += a * vnoise(p); p *= 2.0; a *= 0.5; }
  return s;
}

void main() {
  vec2 uv = vec2(v_uv.x, 1.0 - v_uv.y);
  vec4 t = texture(u_tex, uv);
  float h = t.r;
  float mask = t.g; // plate silhouette (worn edge)
  float wear = t.b;

  // Base normal from the height field.
  float sp = 2.2;
  vec2 dx = vec2(u_texel.x * sp, 0.0);
  vec2 dy = vec2(0.0, u_texel.y * sp);
  float hxp = texture(u_tex, uv + dx).r;
  float hxm = texture(u_tex, uv - dx).r;
  float hyp = texture(u_tex, uv + dy).r;
  float hym = texture(u_tex, uv - dy).r;
  vec3 n = normalize(vec3(-(hxp - hxm) * 6.0, -(hyp - hym) * 6.0, 1.0));

  // Cavity term: compare against a wider neighbourhood so grime and contact
  // shadow gather in the recesses and at the base of every raised letter — the
  // single biggest cue that separates a real casting from a clean render.
  float aw = 9.0;
  vec2 ax = vec2(u_texel.x * aw, 0.0);
  vec2 ay = vec2(0.0, u_texel.y * aw);
  float hWide = (texture(u_tex, uv + ax).r + texture(u_tex, uv - ax).r +
                 texture(u_tex, uv + ay).r + texture(u_tex, uv - ay).r) * 0.25;
  float ao = smoothstep(-0.08, 0.09, h - hWide);
  float cavity = mix(0.42, 1.0, ao);

  // Fine procedural relief that the baked texture can't afford: brushed grain
  // (stretched horizontally) plus finer isotropic pitting. Perturbing the normal
  // makes both sparkle and travel under the moving light.
  vec2 bq = uv * vec2(1150.0, 360.0);
  float bn = fbm(bq);
  vec2 brushed = vec2(bn - fbm(bq + vec2(1.6, 0.0)), bn - fbm(bq + vec2(0.0, 1.6)));
  vec2 pq = uv * vec2(560.0, 560.0);
  float pn = fbm(pq);
  vec2 pit = vec2(pn - fbm(pq + vec2(1.4, 0.0)), pn - fbm(pq + vec2(0.0, 1.4)));
  n = normalize(n + vec3(brushed * 0.55 + pit * 0.9, 0.0));

  // Point light at the cursor; aspect-correct so the falloff stays circular.
  vec3 toLight = vec3((u_light - uv) * vec2(u_aspect, 1.0), u_lightZ);
  float dist = length(toLight);
  vec3 L = toLight / max(dist, 1e-4);
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 Hh = normalize(L + V);

  float atten = 1.0 / (1.0 + 3.0 * dist * dist);
  float diff = max(dot(n, L), 0.0);

  // Specular roughness varies across the surface: worn matte patches next to
  // spots where the metal is still polished, so the highlight never reads as one
  // uniform glossy sweep.
  float rough = fbm(uv * vec2(46.0, 38.0));
  float shin = mix(24.0, 105.0, rough);
  float spec = pow(max(dot(n, Hh), 0.0), shin);
  spec *= (0.35 + 0.85 * rough) * (0.6 + 0.7 * bn);

  // Dim fixed fill from the upper-left keeps relief readable off-cursor.
  float fill = max(dot(n, normalize(vec3(-0.45, -0.55, 0.85))), 0.0);

  // Albedo: iron oxidizes warm, so the recesses skew brown while the polished
  // raised faces stay cool — that warm/cool split is a strong "real metal" cue.
  float shade = smoothstep(0.40, 0.80, h);
  vec3 oxide = vec3(0.135, 0.115, 0.10); // warm dark oxidation
  vec3 tin = vec3(0.80, 0.82, 0.86);     // cool polished tin
  vec3 metal = mix(oxide, tin, shade);
  float grime = fbm(uv * vec2(7.0, 6.0));
  metal *= 0.6 + 0.42 * grime;      // heavier tarnish floor
  // Rusty crud collecting in the deepest, darkest crevices.
  metal = mix(metal, vec3(0.17, 0.10, 0.065), (1.0 - ao) * 0.4 * (1.0 - shade));
  metal *= mix(0.62, 1.0, ao);      // dirt packed into the crevices
  metal += (wear - 0.5) * 0.5 * (0.4 + shade);
  metal *= 0.88 + 0.12 * bn;

  vec3 key = vec3(1.0, 0.96, 0.9);
  vec3 col = metal * 0.28 * cavity;
  col += metal * fill * 0.3 * cavity;
  col += metal * diff * atten * 0.95 * cavity * (0.5 + 0.5 * u_hover);
  col += key * spec * atten * 1.4 * (0.4 + 0.6 * u_hover);

  // Faint cool sky sheen reflected on the polished faces — keeps the metal from
  // going dead flat where the point light isn't reaching.
  col += vec3(0.11, 0.13, 0.16) * shade * (0.08 + 0.12 * n.z);

  float fres = pow(1.0 - max(n.z, 0.0), 3.0);
  col += fres * 0.05 * key; // faint edge sheen, not a CG rim light
  col += spec * spec * atten * 0.35 * key;

  // Static fine grain, like film/sensor noise, so flat areas aren't dead-clean.
  col += (hash(uv * vec2(1950.0, 1470.0)) - 0.5) * 0.035;

  outColor = vec4(pow(clamp(col, 0.0, 1.0), vec3(0.92)), mask);
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

// Shrink a heavy condensed face until the line fits the available width.
function fitFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startPx: number,
  spacing: number,
): number {
  let px = startPx;
  for (let i = 0; i < 40; i++) {
    ctx.font = `900 ${px}px "Arial Narrow", "Helvetica Neue", Arial, sans-serif`;
    ctx.letterSpacing = `${spacing}px`;
    if (ctx.measureText(text).width <= maxWidth) break;
    px *= 0.94;
  }
  return px;
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Draw one grayscale channel and return its (optionally blurred) pixels. Blurring
// turns hard raster edges into slopes the shader can light.
function channel(draw: (ctx: CanvasRenderingContext2D) => void, blur: number): Uint8ClampedArray {
  const c = document.createElement("canvas");
  c.width = TEX_W;
  c.height = TEX_H;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("2d context failed");
  draw(ctx);
  if (blur <= 0) return ctx.getImageData(0, 0, TEX_W, TEX_H).data;
  const b = document.createElement("canvas");
  b.width = TEX_W;
  b.height = TEX_H;
  const bctx = b.getContext("2d");
  if (!bctx) throw new Error("2d context failed");
  bctx.filter = `blur(${blur}px)`;
  bctx.drawImage(c, 0, 0);
  return bctx.getImageData(0, 0, TEX_W, TEX_H).data;
}

const gray = (v: number) => `rgb(${(v * 255) | 0},${(v * 255) | 0},${(v * 255) | 0})`;

// Rasterize the plate into one RGBA texture: R = height, G = mask, B = wear.
function buildMaterial(text: PlateText): ImageData {
  const px = 400; // margin around the sign so it sits smaller on the surface

  const pw = TEX_W - px * 2;
  const ph = pw / 1.6;
  const py = (TEX_H - ph) / 2;
  const inset = 66; // inner engraved frame line
  const contentL = px + 118;
  const contentR = px + pw - 118;
  const contentW = contentR - contentL;

  const clipPlate = (ctx: CanvasRenderingContext2D) => {
    roundRectPath(ctx, px, py, pw, ph, 26);
    ctx.clip();
  };

  const height = channel((ctx) => {
    ctx.fillStyle = gray(0.5); // plate field
    roundRectPath(ctx, px, py, pw, ph, 26);
    ctx.fill();

    ctx.save();
    clipPlate(ctx);

    // Recessed detail: engraved frame groove, gouges, dents and pits, all cut
    // below the field so the shader lights their edges.
    ctx.globalCompositeOperation = "darken";
    ctx.strokeStyle = gray(0.38);
    ctx.lineWidth = 12;
    roundRectPath(ctx, px + inset, py + inset, pw - inset * 2, ph - inset * 2, 14);
    ctx.stroke();

    ctx.lineCap = "round";
    for (let i = 0; i < 46; i++) {
      const x = px + Math.random() * pw;
      const y = py + Math.random() * ph;
      const a = Math.random() * Math.PI * 2;
      const len = 30 + Math.random() * 320;
      ctx.strokeStyle = gray(0.28 + Math.random() * 0.12);
      ctx.lineWidth = 0.7 + Math.random() * 2.6;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
      ctx.stroke();
    }
    for (let i = 0; i < 10; i++) {
      const x = px + Math.random() * pw;
      const y = py + Math.random() * ph;
      const r = 8 + Math.random() * 26;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, gray(0.42));
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < 320; i++) {
      ctx.fillStyle = gray(0.32 + Math.random() * 0.08);
      ctx.beginPath();
      ctx.arc(px + Math.random() * pw, py + Math.random() * ph, 1 + Math.random() * 2.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Raised detail: outer rim, rivets, cast lettering, plus a few burrs.
    ctx.globalCompositeOperation = "lighten";
    ctx.strokeStyle = gray(0.7);
    ctx.lineWidth = 30;
    roundRectPath(ctx, px + 15, py + 15, pw - 30, ph - 30, 20);
    ctx.stroke();

    ctx.fillStyle = gray(0.86);
    for (const [cx, cy] of [
      [px + 42, py + 42],
      [px + pw - 42, py + 42],
      [px + 42, py + ph - 42],
      [px + pw - 42, py + ph - 42],
    ]) {
      ctx.beginPath();
      ctx.arc(cx, cy, 17, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < 30; i++) {
      const x = px + Math.random() * pw;
      const y = py + Math.random() * ph;
      const a = Math.random() * Math.PI * 2;
      const len = 20 + Math.random() * 120;
      ctx.strokeStyle = gray(0.6 + Math.random() * 0.14);
      ctx.lineWidth = 0.7 + Math.random() * 1.4;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
      ctx.stroke();
    }

    drawPlateText(ctx, text, contentL, contentW, py, ph);
    ctx.restore();
  }, 1.8);

  const mask = channel((ctx) => {
    ctx.fillStyle = "#fff";
    roundRectPath(ctx, px, py, pw, ph, 26);
    ctx.fill();
    // Bite worn, irregular flakes out of the sign's edge so it isn't a perfect
    // rectangle sitting on white.
    ctx.globalCompositeOperation = "destination-out";
    const flake = (fx: number, fy: number, scale: number) => {
      const lobes = 3 + Math.floor(Math.random() * 4);
      for (let j = 0; j < lobes; j++) {
        const a = Math.random() * Math.PI * 2;
        const d = Math.random() * 15 * scale;
        ctx.beginPath();
        ctx.arc(fx + Math.cos(a) * d, fy + Math.sin(a) * d, (4 + Math.random() * 11) * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    for (let i = 0; i < 30; i++) {
      if (Math.random() < 0.4) continue;
      const t = Math.random();
      const jit = () => (Math.random() - 0.5) * 22;
      if (Math.random() < 0.5) flake(px + t * pw + jit(), (Math.random() < 0.5 ? py : py + ph) + jit(), 0.7 + Math.random());
      else flake((Math.random() < 0.5 ? px : px + pw) + jit(), py + t * ph + jit(), 0.7 + Math.random());
    }
    for (const [cx, cy] of [
      [px, py],
      [px + pw, py],
      [px, py + ph],
      [px + pw, py + ph],
    ]) {
      flake(cx + (Math.random() - 0.5) * 26, cy + (Math.random() - 0.5) * 26, 1.3);
    }
  }, 1.1);

  const wear = channel((ctx) => {
    ctx.fillStyle = gray(0.5);
    ctx.fillRect(0, 0, TEX_W, TEX_H);
    ctx.save();
    clipPlate(ctx);
    // Tarnish blotches (darker) and fresh scratch streaks (brighter).
    for (let i = 0; i < 26; i++) {
      const x = px + Math.random() * pw;
      const y = py + Math.random() * ph;
      const r = 30 + Math.random() * 120;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(0,0,0,${0.1 + Math.random() * 0.18})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    // Weathering: faint grime drips running downward from the top edge and rivets.
    for (let i = 0; i < 30; i++) {
      const x = px + Math.random() * pw;
      const y0 = py + Math.random() * ph * 0.5;
      const len = 60 + Math.random() * ph * 0.55;
      const w = 4 + Math.random() * 16;
      const g = ctx.createLinearGradient(0, y0, 0, y0 + len);
      g.addColorStop(0, `rgba(0,0,0,${0.1 + Math.random() * 0.16})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - w / 2, y0, w, len);
    }
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    for (let i = 0; i < 110; i++) {
      const x = px + Math.random() * pw;
      const y = py + Math.random() * ph;
      const a = Math.random() * Math.PI * 2;
      const len = 20 + Math.random() * 220;
      ctx.lineWidth = 0.6 + Math.random() * 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
      ctx.stroke();
    }
    for (let i = 0; i < 700; i++) {
      ctx.fillStyle = Math.random() < 0.5 ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.35)";
      ctx.fillRect(px + Math.random() * pw, py + Math.random() * ph, 2, 2);
    }
    ctx.restore();
  }, 0.5);

  const out = new ImageData(TEX_W, TEX_H);
  const d = out.data;
  for (let i = 0; i < d.length; i += 4) {
    d[i] = height[i];
    d[i + 1] = mask[i];
    d[i + 2] = wear[i];
    d[i + 3] = 255;
  }
  return out;
}

// The cast lettering, laid out like the original plate. Drawn bright (raised)
// into the height channel; a light stroke fattens it toward real relief.
function drawPlateText(
  ctx: CanvasRenderingContext2D,
  text: PlateText,
  contentL: number,
  contentW: number,
  py: number,
  ph: number,
) {
  ctx.textBaseline = "alphabetic";

  const line = (
    value: string,
    x: number,
    y: number,
    startPx: number,
    spacing: number,
    tone: number,
    align: CanvasTextAlign,
    maxWidth: number,
  ) => {
    const size = fitFont(ctx, value, maxWidth, startPx, spacing);
    ctx.textAlign = align;
    ctx.fillStyle = gray(tone);
    ctx.strokeStyle = gray(tone);
    ctx.lineWidth = size * 0.03;
    ctx.lineJoin = "round";
    ctx.fillText(value, x, y);
    ctx.strokeText(value, x, y);
  };

  const top = py + ph * 0.06;
  line(text.company, contentL, top + ph * 0.24, ph * 0.19, 1, 0.9, "left", contentW);
  line(text.subtitle, contentL, top + ph * 0.4, ph * 0.1, 0.5, 0.82, "left", contentW * 0.82);

  const bandY = py + ph * 0.78;
  const boxH = ph * 0.13;
  const boxY = bandY - boxH * 0.78;

  const drawBox = (value: string, x: number, w: number) => {
    ctx.save();
    ctx.strokeStyle = gray(0.64);
    ctx.lineWidth = 7;
    roundRectPath(ctx, x, boxY, w, boxH, 8);
    ctx.stroke();
    line(value, x + w / 2, boxY + boxH * 0.72, boxH * 0.62, 0.5, 0.8, "center", w * 0.82);
    ctx.restore();
  };

  const boxW = contentW * 0.17;
  drawBox(text.left, contentL, boxW);
  drawBox(text.right, contentL + contentW - boxW, boxW);

  line(text.city, contentL + contentW / 2, bandY + boxH * 0.2, ph * 0.24, 2, 0.9, "center", contentW - boxW * 2 - 60);
  line(text.corner, contentL + contentW, py + ph * 0.95, ph * 0.05, 1, 0.72, "right", contentW * 0.3);
}

function boot(canvas: HTMLCanvasElement): (() => void) | undefined {
  const gl = canvas.getContext("webgl2", { antialias: true, alpha: true, premultipliedAlpha: false });
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
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, buildMaterial(TEXT));

  const uLight = gl.getUniformLocation(program, "u_light");
  const uAspect = gl.getUniformLocation(program, "u_aspect");
  const uHover = gl.getUniformLocation(program, "u_hover");

  gl.useProgram(program);
  gl.uniform2f(gl.getUniformLocation(program, "u_texel"), 1 / TEX_W, 1 / TEX_H);
  gl.uniform1f(gl.getUniformLocation(program, "u_lightZ"), 0.34);

  const cur = { x: 0.5, y: 0.42 };
  const target = { x: 0.5, y: 0.42 };
  let hover = 0;
  let hoverTarget = 0;
  let aspect = 4 / 3;

  let disposed = false;
  let raf = 0;
  let time = 0;
  let last = performance.now();

  // Fit the largest 4:3 box (the texture's ratio) inside the available space and
  // let the parent centre it. The dialog is already 4:3 so nothing changes there;
  // on the portrait mobile sheet this keeps the sign from stretching to fill.
  const resize = () => {
    const host = canvas.parentElement ?? canvas;
    const rect = host.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    let cw = rect.width;
    let ch = cw / TEX_ASPECT;
    if (ch > rect.height) {
      ch = rect.height;
      cw = ch * TEX_ASPECT;
    }
    canvas.style.width = `${cw}px`;
    canvas.style.height = `${ch}px`;
    aspect = TEX_ASPECT;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.round(cw * dpr);
    const h = Math.round(ch * dpr);
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
      target.x = 0.5 + Math.cos(time * 0.5) * 0.3;
      target.y = 0.42 + Math.sin(time * 0.7) * 0.16;
    }
    const ease = hoverTarget === 1 ? Math.min(1, dt * 9) : Math.min(1, dt * 2.5);
    cur.x += (target.x - cur.x) * ease;
    cur.y += (target.y - cur.y) * ease;
    hover += (hoverTarget - hover) * Math.min(1, dt * 5);

    gl.useProgram(program);
    gl.uniform2f(uLight, cur.x, cur.y);
    gl.uniform1f(uAspect, aspect);
    gl.uniform1f(uHover, hover);
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
    const w = (canvas.parentElement ?? canvas).getBoundingClientRect().width;
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

export const MetalPlate = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    let teardown: (() => void) | undefined;
    // Wait for fonts so the first raster measures the real condensed face.
    const start = () => {
      if (cancelled || !canvasRef.current) return;
      teardown = boot(canvasRef.current);
    };
    const fonts = document.fonts?.ready;
    if (fonts) fonts.then(start);
    else start();
    return () => {
      cancelled = true;
      teardown?.();
    };
  }, []);

  return <canvas ref={canvasRef} className="block touch-none" aria-hidden />;
};
