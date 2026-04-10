import { useCallback, useRef } from "react";

const CURSOR_SRC = "/images/misc/macos-cursor.svg";
const POINTER_SRC = "/images/misc/macos-pointer-cursor.svg";
const BLUR_PX = 40;
const BRUSH_RADIUS_RATIO = 0.08;
const BRUSH_OPACITY = 0.08;
const STAMP_SPACING = 0.25;
const CURSOR_CSS_PX = 32;
const CONTENT_W = 1600;
const CONTENT_H = 1200;
const REVEAL_THRESHOLD = 100;

const VERTEX_SOURCE = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAGMENT_SOURCE = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
uniform sampler2D u_original;
uniform sampler2D u_blurred;
uniform sampler2D u_mask;
uniform sampler2D u_cursorTex;
uniform vec2 u_cursor;
uniform float u_hovering;
uniform vec2 u_resolution;
uniform vec2 u_cursorSize;
void main() {
  vec4 clear = texture(u_original, v_uv);
  vec4 foggy = texture(u_blurred, v_uv);

  // Frosted glass — let more UI through, less white wash
  float luma = dot(foggy.rgb, vec3(0.299, 0.587, 0.114));
  foggy.rgb = mix(foggy.rgb, vec3(luma), 0.25);
  foggy.rgb = mix(foggy.rgb, vec3(1.0), 0.06);
  foggy.rgb = min(foggy.rgb * 1.02, vec3(1.0));

  // Subtle reflection gradient (light hitting the glass from top-left)
  float refl = smoothstep(0.0, 0.7, 1.0 - v_uv.y) * smoothstep(0.0, 0.8, 1.0 - v_uv.x);
  foggy.rgb += refl * 0.025;

  // Glass grain + frosted micro-texture
  vec2 seed = v_uv * u_resolution;
  float n1 = fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453);
  float n2 = fract(sin(dot(seed * 0.5, vec2(93.9898, 67.345))) * 28001.8453);
  foggy.rgb += (n1 - 0.5) * 0.015;
  foggy.rgb += (n2 - 0.5) * 0.008;

  float reveal = texture(u_mask, v_uv).r;
  vec4 color = mix(foggy, clear, reveal);

  if (u_hovering > 0.5) {
    vec2 cursorUV = vec2(u_cursor.x, 1.0 - u_cursor.y) + vec2(0.006, -0.01);
    vec2 size = u_cursorSize / u_resolution;
    float lx = (v_uv.x - cursorUV.x) / size.x;
    float ly = (cursorUV.y - v_uv.y) / size.y;
    if (lx >= 0.0 && lx <= 1.0 && ly >= 0.0 && ly <= 1.0) {
      vec4 cur = texture(u_cursorTex, vec2(lx, 1.0 - ly));
      float fog = 1.0 - reveal;
      color = mix(color, cur, cur.a * fog * 0.85);
    }
  }
  fragColor = color;
}`;

interface ButtonBounds {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface GLState {
  gl: WebGL2RenderingContext;
  canvas: HTMLCanvasElement;
  maskCanvas: HTMLCanvasElement;
  maskCtx: CanvasRenderingContext2D;
  maskTex: WebGLTexture;
  contentCanvas: HTMLCanvasElement;
  contentCtx: CanvasRenderingContext2D;
  origTex: WebGLTexture;
  cursorTex: WebGLTexture;
  pointerTex: WebGLTexture;
  uniforms: {
    cursor: WebGLUniformLocation;
    hovering: WebGLUniformLocation;
    resolution: WebGLUniformLocation;
    cursorSize: WebGLUniformLocation;
  };
  rafId: number;
  cursor: { x: number; y: number; hovering: boolean; pressing: boolean };
  lastPaint: { x: number; y: number } | null;
  observer: ResizeObserver;
  w: number;
  h: number;
  dpr: number;
  ready: boolean;
  buttonBounds: ButtonBounds;
  buttonHovered: boolean;
  pointerCursorUrl: string;
}

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

function makeTex(gl: WebGL2RenderingContext) {
  const t = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return t;
}

function stampBrush(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(255,255,255,${BRUSH_OPACITY})`);
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function strokeBrush(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  r: number,
) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const d = Math.sqrt(dx * dx + dy * dy);
  const step = Math.max(r * STAMP_SPACING, 1);
  const n = Math.ceil(d / step) || 1;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    stampBrush(ctx, x0 + dx * t, y0 + dy * t, r);
  }
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lineH: number,
): number {
  const words = text.split(" ");
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y);
      y += lineH;
      line = word;
    } else {
      line = test;
    }
  }
  if (line) {
    ctx.fillText(line, x, y);
    y += lineH;
  }
  return y;
}

function drawBlogPost(ctx: CanvasRenderingContext2D, hoverLink = false): ButtonBounds {
  const w = CONTENT_W;
  const h = CONTENT_H;
  const font = '"Pretendard Variable", "Inter", sans-serif';
  const innerMax = 900;
  const px = Math.max(90, (w - innerMax) / 2);
  const maxW = Math.min(innerMax, w - 180);

  ctx.textBaseline = "top";

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);

  let y = 72;

  // Category
  ctx.font = `500 19px ${font}`;
  ctx.fillStyle = "#a3a3a3";
  ctx.fillText("Design", px, y);
  y += 38;

  // Title
  ctx.font = `600 25px ${font}`;
  ctx.fillStyle = "#171717";
  y = wrapText(ctx, "The Future of Web Interfaces", px, y, maxW, 34);
  y += 16;

  // Date
  ctx.font = `400 19px ${font}`;
  ctx.fillStyle = "#a3a3a3";
  ctx.fillText("Apr 8, 2026  \u00b7  5 min read", px, y);
  y += 44;

  // Divider
  ctx.fillStyle = "#e5e5e5";
  ctx.fillRect(px, y, maxW, 1);
  y += 36;

  // Body
  ctx.font = `450 22px ${font}`;
  ctx.fillStyle = "#171717";

  y = wrapText(
    ctx,
    "The web platform has evolved dramatically. Modern browsers now support features once exclusive to native applications \u2014 from GPU-accelerated graphics to sophisticated layout systems.",
    px,
    y,
    maxW,
    36,
  );
  y += 20;

  y = wrapText(
    ctx,
    "This shift has fundamentally changed how we approach interface design. The boundary between web and native continues to dissolve.",
    px,
    y,
    maxW,
    36,
  );
  y += 36;

  // Link
  ctx.font = `450 22px ${font}`;
  ctx.fillStyle = hoverLink ? "#000000" : "#171717";
  const linkText = "Continue reading \u2192";
  ctx.fillText(linkText, px, y);
  const linkW = ctx.measureText(linkText).width;
  ctx.fillStyle = hoverLink ? "#525252" : "#d4d4d4";
  ctx.fillRect(px, y + 28, linkW, 1);

  return { x: px, y, w: linkW, h: 30 };
}

function isOverButton(nx: number, ny: number, b: ButtonBounds): boolean {
  const cx = nx * CONTENT_W;
  const cy = ny * CONTENT_H;
  return cx >= b.x && cx <= b.x + b.w && cy >= b.y && cy <= b.y + b.h;
}

function isRevealed(maskCtx: CanvasRenderingContext2D, px: number, py: number, w: number, h: number): boolean {
  const x = Math.round(Math.max(0, Math.min(px, w - 1)));
  const y = Math.round(Math.max(0, Math.min(py, h - 1)));
  const data = maskCtx.getImageData(x, y, 1, 1).data;
  return data[0] > REVEAL_THRESHOLD;
}

function updateButtonHover(s: GLState, hover: boolean) {
  if (hover === s.buttonHovered) return;
  s.buttonHovered = hover;
  s.canvas.style.cursor = hover ? `url(${s.pointerCursorUrl}) 7 2, pointer` : "";
  // Swap reflected cursor texture
  s.gl.activeTexture(s.gl.TEXTURE3);
  s.gl.bindTexture(s.gl.TEXTURE_2D, hover ? s.pointerTex : s.cursorTex);
  // Redraw content with hover state
  drawBlogPost(s.contentCtx, hover);
  s.gl.activeTexture(s.gl.TEXTURE0);
  s.gl.bindTexture(s.gl.TEXTURE_2D, s.origTex);
  s.gl.texImage2D(s.gl.TEXTURE_2D, 0, s.gl.RGBA, s.gl.RGBA, s.gl.UNSIGNED_BYTE, s.contentCanvas);
}

export const FoggyMirror = () => {
  const stateRef = useRef<GLState | null>(null);

  const canvasRef = useCallback((el: HTMLCanvasElement | null) => {
    const prev = stateRef.current;
    if (prev) {
      cancelAnimationFrame(prev.rafId);
      prev.observer.disconnect();
      stateRef.current = null;
    }
    if (!el) return;
    const canvas = el;

    const glCtx = canvas.getContext("webgl2", { alpha: false, premultipliedAlpha: false });
    if (!glCtx) return;
    const gl = glCtx;
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERTEX_SOURCE));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SOURCE));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const vao = gl.createVertexArray()!;
    gl.bindVertexArray(vao);
    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const posLoc = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const origTex = makeTex(gl);
    const blurTex = makeTex(gl);
    const maskTex = makeTex(gl);
    const cursorTex = makeTex(gl);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
    const pointerTex = makeTex(gl);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));

    gl.uniform1i(gl.getUniformLocation(prog, "u_original"), 0);
    gl.uniform1i(gl.getUniformLocation(prog, "u_blurred"), 1);
    gl.uniform1i(gl.getUniformLocation(prog, "u_mask"), 2);
    gl.uniform1i(gl.getUniformLocation(prog, "u_cursorTex"), 3);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, origTex);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, blurTex);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, maskTex);
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, cursorTex);

    const maskCanvas = document.createElement("canvas");
    const maskCtx = maskCanvas.getContext("2d")!;

    // Draw blog post content
    const contentCanvas = document.createElement("canvas");
    contentCanvas.width = CONTENT_W;
    contentCanvas.height = CONTENT_H;
    const contentCtx = contentCanvas.getContext("2d")!;
    const buttonBounds = drawBlogPost(contentCtx);

    const state: GLState = {
      gl,
      canvas,
      maskCanvas,
      maskCtx,
      maskTex,
      contentCanvas,
      contentCtx,
      origTex,
      cursorTex,
      pointerTex,
      uniforms: {
        cursor: gl.getUniformLocation(prog, "u_cursor")!,
        hovering: gl.getUniformLocation(prog, "u_hovering")!,
        resolution: gl.getUniformLocation(prog, "u_resolution")!,
        cursorSize: gl.getUniformLocation(prog, "u_cursorSize")!,
      },
      rafId: 0,
      cursor: { x: 0, y: 0, hovering: false, pressing: false },
      lastPaint: null,
      observer: null!,
      w: 0,
      h: 0,
      dpr: 1,
      ready: false,
      buttonBounds,
      buttonHovered: false,
      pointerCursorUrl: POINTER_SRC,
    };
    stateRef.current = state;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const w = Math.round(rect.width * dpr);
      const h = Math.round(rect.height * dpr);
      if (w === state.w && h === state.h) return;
      canvas.width = w;
      canvas.height = h;
      state.w = w;
      state.h = h;
      state.dpr = dpr;
      maskCanvas.width = w;
      maskCanvas.height = h;
      maskCtx.fillStyle = "#000";
      maskCtx.fillRect(0, 0, w, h);
      gl.viewport(0, 0, w, h);
    }

    const obs = new ResizeObserver(resize);
    obs.observe(canvas);
    state.observer = obs;
    resize();

    // Upload original texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, origTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, contentCanvas);

    // Create blurred version — two passes for heavier frosted diffusion
    const pad = BLUR_PX * 3;
    const blur1 = document.createElement("canvas");
    blur1.width = CONTENT_W;
    blur1.height = CONTENT_H;
    const ctx1 = blur1.getContext("2d")!;
    ctx1.filter = `blur(${BLUR_PX}px)`;
    ctx1.drawImage(contentCanvas, -pad, -pad, CONTENT_W + pad * 2, CONTENT_H + pad * 2);

    const blurCanvas = document.createElement("canvas");
    blurCanvas.width = CONTENT_W;
    blurCanvas.height = CONTENT_H;
    const blurCtx = blurCanvas.getContext("2d")!;
    blurCtx.filter = `blur(${BLUR_PX}px)`;
    blurCtx.drawImage(blur1, -pad, -pad, CONTENT_W + pad * 2, CONTENT_H + pad * 2);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, blurTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, blurCanvas);

    state.ready = true;

    // Load cursor SVG
    const cursorImg = new Image();
    cursorImg.onload = () => {
      const size = CURSOR_CSS_PX * 2;
      const curPad = 4;
      const cc = document.createElement("canvas");
      cc.width = size + curPad * 2;
      cc.height = size + curPad * 2;
      const cx = cc.getContext("2d")!;
      cx.filter = "blur(1.5px)";
      cx.drawImage(cursorImg, curPad, curPad, size, size);
      gl.activeTexture(gl.TEXTURE3);
      gl.bindTexture(gl.TEXTURE_2D, cursorTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cc);
    };
    cursorImg.src = CURSOR_SRC;

    // Load pointer cursor SVG (for button hover reflection)
    const pointerImg = new Image();
    pointerImg.onload = () => {
      const size = CURSOR_CSS_PX * 2;
      const curPad = 4;
      const pc = document.createElement("canvas");
      pc.width = size + curPad * 2;
      pc.height = size + curPad * 2;
      const px = pc.getContext("2d")!;
      px.filter = "blur(1.5px)";
      px.drawImage(pointerImg, curPad, curPad, size, size);
      gl.activeTexture(gl.TEXTURE3);
      gl.bindTexture(gl.TEXTURE_2D, pointerTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pc);
      // Rebind cursorTex as default
      gl.bindTexture(gl.TEXTURE_2D, cursorTex);
    };
    pointerImg.src = POINTER_SRC;

    function frame() {
      state.rafId = requestAnimationFrame(frame);
      if (!state.ready) return;

      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, maskTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, maskCanvas);

      const cursorDevPx = CURSOR_CSS_PX * state.dpr;
      gl.uniform2f(state.uniforms.cursor, state.cursor.x, state.cursor.y);
      gl.uniform1f(state.uniforms.hovering, state.cursor.hovering ? 1 : 0);
      gl.uniform2f(state.uniforms.resolution, state.w, state.h);
      gl.uniform2f(state.uniforms.cursorSize, cursorDevPx, cursorDevPx);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    state.rafId = requestAnimationFrame(frame);
  }, []);

  const coords = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;
    if (!s) return null;
    const rect = s.canvas.getBoundingClientRect();
    const cssX = e.clientX - rect.left;
    const cssY = e.clientY - rect.top;
    return {
      nx: cssX / rect.width,
      ny: cssY / rect.height,
      px: (cssX / rect.width) * s.w,
      py: (cssY / rect.height) * s.h,
    };
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const s = stateRef.current;
      if (!s) return;
      const c = coords(e);
      if (!c) return;

      // If clicking a revealed button, don't paint — handle the click
      if (
        isOverButton(c.nx, c.ny, s.buttonBounds) &&
        isRevealed(s.maskCtx, c.px, c.py, s.w, s.h)
      ) {
        return;
      }

      e.currentTarget.setPointerCapture(e.pointerId);
      s.cursor.pressing = true;
      s.cursor.x = c.nx;
      s.cursor.y = c.ny;
      const r = Math.min(s.w, s.h) * BRUSH_RADIUS_RATIO;
      stampBrush(s.maskCtx, c.px, c.py, r);
      s.lastPaint = { x: c.px, y: c.py };
    },
    [coords],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const s = stateRef.current;
      if (!s) return;
      const c = coords(e);
      if (!c) return;
      s.cursor.x = c.nx;
      s.cursor.y = c.ny;
      s.cursor.hovering = true;

      if (s.cursor.pressing && s.lastPaint) {
        const r = Math.min(s.w, s.h) * BRUSH_RADIUS_RATIO;
        strokeBrush(s.maskCtx, s.lastPaint.x, s.lastPaint.y, c.px, c.py, r);
        s.lastPaint = { x: c.px, y: c.py };
      }

      // Button hover detection
      const over =
        isOverButton(c.nx, c.ny, s.buttonBounds) &&
        isRevealed(s.maskCtx, c.px, c.py, s.w, s.h);
      updateButtonHover(s, over);
    },
    [coords],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const s = stateRef.current;
      if (!s) return;
      s.cursor.pressing = false;
      s.lastPaint = null;
      const rect = s.canvas.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (!inside) s.cursor.hovering = false;
    },
    [],
  );

  const onPointerEnter = useCallback(() => {
    const s = stateRef.current;
    if (s) s.cursor.hovering = true;
  }, []);

  const onPointerLeave = useCallback(() => {
    const s = stateRef.current;
    if (s) {
      s.cursor.hovering = false;
      s.cursor.pressing = false;
      s.lastPaint = null;
      updateButtonHover(s, false);
    }
  }, []);

  return (
    <div className="relative h-full w-full rounded-[inherit]">
      <canvas
        ref={canvasRef}
        className="h-full w-full touch-none rounded-[inherit]"
        onPointerDown={onPointerDown}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />
      <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center text-xs text-quaternary opacity-60">Press and drag to wipe the fog</p>
    </div>
  );
};
