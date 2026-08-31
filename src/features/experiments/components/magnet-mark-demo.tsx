import { useEffect, useRef, useState } from "react";

/* The Fk wordmark, rebuilt out of tiny copies of its own two letters, with a magnet
   under the cursor.

   Nothing here is drawn as a path at the size you see it. The two logo outlines are
   rasterised once on mount into a coarse grid, and each covered cell becomes one tile —
   an F where the F is, a k where the k is, so the mark is spelled out of itself. That
   recursion is the reason the grid is as coarse as it is: past about forty columns the
   little letters stop being letters and go back to being dots, which is the one thing
   this cannot afford.

   Motion is a spring per tile on the CPU rather than a displacement formula in the
   shader. A formula is stateless, so the tiles would track the cursor exactly and stop
   dead when it stops — no lag going in, no overshoot coming back, and that lag and
   overshoot are the entire feeling. A few hundred springs is nothing to integrate; the
   per-frame cost here is the buffer upload, not the physics. Each tile carries its own
   mass, so the field never moves them in lockstep.

   Two forces act on top of the springs. The cursor is a repelling magnet with a
   gaussian falloff, plus a tangential term so the tiles slide round it rather than
   straight away from it and the hole it opens has a swirl to it. A click adds a
   shockwave: a ring that expands from the click at a fixed speed and kicks whichever
   tiles it is passing through at that instant, which is why it reads as one front
   travelling across the mark rather than everything jumping at once. Being an impulse
   rather than a held force, the springs alone decide what happens afterwards.

   The tiles are instanced quads sampling a two-layer texture array — one layer per
   letter. An array rather than an atlas because these are minified hard and therefore
   need mipmaps, and mip levels of a packed atlas bleed one glyph into its neighbour;
   array layers mip independently. Quads rather than gl_POINTS because point sprites
   cannot rotate, and a tile that tumbles is most of what makes this satisfying. */

// The grid is a character grid, not a square one. A letter is taller than it is wide,
// so square cells leave a gap either side of every glyph and the mark thins out into
// stripes; cells in the glyph's own proportion let the little letters tile the way type
// does. Rows are what the count is expressed in — coarse enough that a tile is a
// readable letter, fine enough that the F's stem is still five columns wide.
const ROWS = 26;
// Empty cells kept around the mark so a tile thrown out of the wordmark has somewhere
// to go; a tile clipped by the drawing buffer is the one thing that breaks the illusion
// that these are loose objects.
const PAD = 4;
// Tile size as a fraction of its cell. The whole cell: the gap between glyphs is the
// margin baked into the atlas, so tracking is set in one place rather than two.
const TILE = 1;

// The wordmark, in its own units, lifted verbatim from components/shared/logo.tsx — the
// capital F and the small k in their collapsed positions. They are both the source of
// the grid's shape and, one level down, the two glyphs the grid is made of.
const F_PATH = "M1.498 1.62414V4.25614H4.802V5.74014H1.498V9.94014H0V0.140137H5.782V1.62414H1.498Z";
const K_PATH =
  "M9.548 0V5.516L12.25 2.576H14.028L11.424 5.404L14.42 9.8H12.712L10.444 6.468L9.548 7.448V9.8H8.078V0H9.548Z";
const MARK_W = 14.42;
const MARK_H = 9.94014;
// Each glyph's own box inside that space. Both are 9.8 tall, so fitting them by height
// keeps the small k narrower than the F exactly as it is in the wordmark.
const GLYPH_BOX = [
  { path: F_PATH, x: 0, y: 0.140137, w: 5.782, h: 9.8 },
  { path: K_PATH, x: 8.078, y: 0, w: 6.342, h: 9.8 },
];
// Source resolution per glyph, in the proportion of the wider of the two letters, so
// the k fills its cell and the F sits narrow inside one exactly as it does in the
// wordmark. The tiles land at roughly a quarter of this on a retina display, which is
// one mip level in — enough detail to stay a letter, little enough to cost nothing.
const GLYPH_H = 64;
const GLYPH_W = 44;

// Everything spatial is in units of one cell's height, which is also one glyph's height.
const CELL_W = GLYPH_W / GLYPH_H;
const COLS = Math.round(((MARK_W / MARK_H) * ROWS) / CELL_W);
const VIEW_W = COLS * CELL_W + PAD * 2;
const VIEW_H = ROWS + PAD * 2;

// The fragment shader is one texture tap, so this renders at the display's real density
// — capping below it would only soften letterforms that are the whole subject.
const MAX_DPR = 2;
// Direct manipulation: the tiles are meant to feel attached to the cursor, and halving
// the frame rate is immediately legible as lag in exactly the moment that matters.
const FPS = 60;
const MAX_WIDTH = 460;

// Everything below is in cell units, which is what makes the numbers readable: a
// displacement of 2 is two tiles.
const REACH = 5.4; // magnet radius (one gaussian sigma)
const SWIRL = 0.3; // tangential fraction of the push, so the hole has a twist to it
const SPRING = 150; // home spring; SPRING and PUSH together set the peak displacement
const DAMP = 10.3; // ~0.42 of critical — the overshoot on the way home is deliberate
const PUSH = 305; // peak force, i.e. about PUSH / SPRING = 2 cells of travel
const TURN = 0.8; // radians of tumble at full displacement
const GROW = 0.34; // extra size at full displacement
const SPIN_K = 90;
const SPIN_C = 9.5;
const SIZE_K = 160;
const SIZE_C = 17.7;
// Displacement that counts as "fully thrown", for the rotation and size ramps.
const FULL = 1.75;

// The shockwave. Speed is what makes it a travelling front rather than a flash: at 35
// cells a second it crosses the whole mark in a little over one, which is slow enough
// to watch and fast enough not to feel like a wipe.
const WAVE_SPEED = 35;
const WAVE_WIDTH = 1.6; // thickness of the ring, so a tile is inside it for under a tenth of a second
// Sized against that dwell time, not against SPRING: the ring hands each tile an
// impulse, and this is the one that lands a tile about two cells out.
const WAVE_FORCE = 712;
const WAVE_LIFE = 1.5;
// Two ways the front loses its punch: it ages, and it spreads its energy round an
// ever-longer circumference. Both are gentle enough that the far corners still move.
const WAVE_FADE = 0.9;
const WAVE_SPREAD = 0.041;
// A click while the last wave is still crossing should stack, not replace — but a
// mashed pointer should not turn into an unbounded list of forces.
const MAX_WAVES = 4;

const VERT = `#version 300 es
in vec2 a_corner;
in vec4 a_tile;  // x, y (cells), angle, scale
in float a_glyph; // which letter this tile is
uniform vec2 u_scale;
uniform vec2 u_side;
out vec3 v_tex;
out float v_lift;
void main() {
  float s = sin(a_tile.z);
  float c = cos(a_tile.z);
  vec2 q = a_corner * (u_side * a_tile.w);
  vec2 p = a_tile.xy + vec2(q.x * c - q.y * s, q.x * s + q.y * c);
  // The atlas is uploaded unflipped so its layer order survives, so the flip happens
  // here instead: texture row zero is the top of the glyph, world y points up.
  v_tex = vec3(a_corner.x + 0.5, 0.5 - a_corner.y, a_glyph);
  v_lift = a_tile.w;
  gl_Position = vec4(p * u_scale, 0.0, 1.0);
}`;

// Only the alpha of the glyph is read. Its colour channels are a flat white that exists
// solely so the canvas rasteriser has something to antialias, and sampling them would
// only invite the dark fringe that mipping straight-alpha white gives you.
const FRAG = `#version 300 es
precision highp float;
uniform highp sampler2DArray u_atlas;
in vec3 v_tex;
in float v_lift;
uniform float u_ambient; // 1 = light page, 0 = dark one
out vec4 outColor;

void main() {
  float a = texture(u_atlas, v_tex).a;
  if (a <= 0.002) discard;

  // A tile in flight is drawn a shade off the mark's ink. It reads as the tile having
  // lost contact with the wordmark, which is the only cue that separates a displaced
  // tile from one that happens to sit somewhere else.
  float lift = clamp((v_lift - 1.0) / ${GROW.toFixed(2)}, 0.0, 1.0);
  vec3 ink = mix(vec3(1.0), vec3(0.09), u_ambient);
  vec3 soft = mix(vec3(0.64), vec3(0.32), u_ambient);
  vec3 col = mix(ink, soft, lift * 0.8);
  outColor = vec4(col * a, a);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  return sh;
}

function linkProgram(gl: WebGL2RenderingContext): WebGLProgram {
  const p = gl.createProgram()!;
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(p);
  return p;
}

// The two letters, stacked vertically into one canvas — which is how texImage3D wants
// its layers handed over. Each is fitted to the cell by height, so their widths stay in
// the proportion the wordmark has them in.
function glyphSheet(): HTMLCanvasElement | undefined {
  const canvas = document.createElement("canvas");
  canvas.width = GLYPH_W;
  canvas.height = GLYPH_H * GLYPH_BOX.length;
  const ctx = canvas.getContext("2d");
  if (!ctx) return undefined;
  ctx.fillStyle = "#fff";
  // Doubles as the tracking between tiles and as a margin the mip chain can bleed into
  // instead of into the next layer's edge.
  const inset = GLYPH_H * 0.05;
  const availW = GLYPH_W - inset * 2;
  const availH = GLYPH_H - inset * 2;
  GLYPH_BOX.forEach((g, layer) => {
    const s = Math.min(availW / g.w, availH / g.h);
    ctx.save();
    ctx.translate(
      (GLYPH_W - g.w * s) / 2 - g.x * s,
      layer * GLYPH_H + (GLYPH_H - g.h * s) / 2 - g.y * s,
    );
    ctx.scale(s, s);
    ctx.fill(new Path2D(g.path));
    ctx.restore();
  });
  return canvas;
}

// Which cells the wordmark covers, and which letter each of them belongs to. Rasterised
// at four times the grid and averaged per cell, so a cell is on when the outline
// actually covers most of it — sampling a single point instead drops the k's thin
// diagonals in and out along their length. The two letters go down in different colour
// channels, which is what identifies the layer for a cell afterwards.
function markGrid(): Int8Array {
  const SS = 4;
  const canvas = document.createElement("canvas");
  canvas.width = COLS * SS;
  canvas.height = ROWS * SS;
  const grid = new Int8Array(COLS * ROWS).fill(-1);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return grid;

  // Stretched to the grid rather than fitted inside it: the column count was picked so
  // the two agree to within a percent, and an exact fit spares a centring step.
  ctx.scale(canvas.width / MARK_W, canvas.height / MARK_H);
  ctx.fillStyle = "#f00";
  ctx.fill(new Path2D(F_PATH));
  ctx.fillStyle = "#0f0";
  ctx.fill(new Path2D(K_PATH));

  const px = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      let cover = 0;
      let red = 0;
      let green = 0;
      for (let y = 0; y < SS; y++) {
        const row = (r * SS + y) * canvas.width;
        for (let x = 0; x < SS; x++) {
          const o = (row + c * SS + x) * 4;
          red += px[o];
          green += px[o + 1];
          cover += px[o + 3];
        }
      }
      if (cover / (SS * SS * 255) <= 0.5) continue;
      grid[r * COLS + c] = red >= green ? 0 : 1;
    }
  }
  return grid;
}

// Knuth multiplicative, so neighbouring tiles get clearly different masses and spins
// rather than the slow ramp a sequential offset would give.
const hash = (i: number) => {
  const h = Math.imul(i + 1, 2654435761) >>> 0;
  return h / 4294967296;
};

interface Handle {
  // The keyboard path into the shockwave: it fires from the middle of the mark, since
  // there is no cursor to take a position from.
  burst: () => void;
  dispose: () => void;
}

function boot(canvas: HTMLCanvasElement, onLost: () => void): Handle | undefined {
  const gl = canvas.getContext("webgl2", {
    antialias: false,
    alpha: true,
    premultipliedAlpha: true,
    failIfMajorPerformanceCaveat: true,
  });
  if (!gl) return undefined;

  const sheet = glyphSheet();
  if (!sheet) return undefined;
  const grid = markGrid();
  let count = 0;
  for (const g of grid) if (g >= 0) count++;
  if (count === 0) return undefined;

  const homeX = new Float32Array(count);
  const homeY = new Float32Array(count);
  const posX = new Float32Array(count);
  const posY = new Float32Array(count);
  const velX = new Float32Array(count);
  const velY = new Float32Array(count);
  const angle = new Float32Array(count);
  const angleVel = new Float32Array(count);
  const size = new Float32Array(count);
  const sizeVel = new Float32Array(count);
  const invMass = new Float32Array(count);
  const spin = new Float32Array(count);
  const born = new Float32Array(count);
  const glyph = new Float32Array(count);

  let n = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const layer = grid[r * COLS + c];
      if (layer < 0) continue;
      const hx = (c + 0.5 - COLS / 2) * CELL_W;
      const hy = ROWS / 2 - r - 0.5;
      homeX[n] = hx;
      homeY[n] = hy;
      glyph[n] = layer;
      const a = hash(n * 3) * Math.PI * 2;
      const d = 1 + hash(n * 3 + 1) * 1.7;
      posX[n] = hx + Math.cos(a) * d;
      posY[n] = hy + Math.sin(a) * d;
      angle[n] = (hash(n * 3 + 2) - 0.5) * 1.2;
      invMass[n] = 1 / (0.85 + hash(n * 5) * 0.3);
      spin[n] = hash(n * 7) < 0.5 ? -1 : 1;
      // A wave left to right across the mark, jittered so the front is a scatter of
      // tiles rather than a moving straight line.
      born[n] = ((c * CELL_W + PAD) / VIEW_W) * 0.35 + hash(n * 11) * 0.12;
      n++;
    }
  }

  const program = linkProgram(gl);
  const uScale = gl.getUniformLocation(program, "u_scale");
  const uSide = gl.getUniformLocation(program, "u_side");
  const uAmbient = gl.getUniformLocation(program, "u_ambient");
  const uAtlas = gl.getUniformLocation(program, "u_atlas");

  const atlas = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D_ARRAY, atlas);
  gl.texImage3D(
    gl.TEXTURE_2D_ARRAY,
    0,
    gl.RGBA8,
    GLYPH_W,
    GLYPH_H,
    GLYPH_BOX.length,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    sheet,
  );
  gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5]),
    gl.STATIC_DRAW,
  );
  const aCorner = gl.getAttribLocation(program, "a_corner");
  gl.enableVertexAttribArray(aCorner);
  gl.vertexAttribPointer(aCorner, 2, gl.FLOAT, false, 0, 0);

  const tiles = new Float32Array(count * 4);
  const instances = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, instances);
  gl.bufferData(gl.ARRAY_BUFFER, tiles.byteLength, gl.DYNAMIC_DRAW);
  const aTile = gl.getAttribLocation(program, "a_tile");
  gl.enableVertexAttribArray(aTile);
  gl.vertexAttribPointer(aTile, 4, gl.FLOAT, false, 0, 0);
  gl.vertexAttribDivisor(aTile, 1);

  // Which letter a tile is never changes, so it rides its own static buffer instead of
  // being re-uploaded with the physics every frame.
  const letters = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, letters);
  gl.bufferData(gl.ARRAY_BUFFER, glyph, gl.STATIC_DRAW);
  const aGlyph = gl.getAttribLocation(program, "a_glyph");
  gl.enableVertexAttribArray(aGlyph);
  gl.vertexAttribPointer(aGlyph, 1, gl.FLOAT, false, 0, 0);
  gl.vertexAttribDivisor(aGlyph, 1);
  gl.bindVertexArray(null);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.useProgram(program);
  gl.uniform1i(uAtlas, 0);

  const lightScheme = window.matchMedia("(prefers-color-scheme: light)");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  let scaleX = 2 / VIEW_W;
  let scaleY = 2 / VIEW_H;
  // Where the magnet is, in cells. Parked in the middle until the pointer arrives, but
  // inert until it does — hover is what switches it on.
  const magnet = { x: 0, y: 0 };
  // Expanding rings, oldest first, which is what lets the expiry check look only at the
  // front of the list.
  const waves: { x: number; y: number; age: number }[] = [];
  let hover = 0;
  let hoverTarget = 0;
  let clock = 0;
  let raf = 0;
  let lastDraw = 0;
  let disposed = false;

  const resize = () => {
    const dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    // Fit the padded grid inside whatever box the dialog gave us, without distorting
    // it: a stretched cell is a stretched letter.
    const box = w / h;
    if (box > VIEW_W / VIEW_H) {
      scaleY = 2 / VIEW_H;
      scaleX = scaleY / box;
    } else {
      scaleX = 2 / VIEW_W;
      scaleY = scaleX * box;
    }
  };

  const draw = () => {
    for (let i = 0; i < count; i++) {
      const o = i * 4;
      tiles[o] = posX[i];
      tiles[o + 1] = posY[i];
      tiles[o + 2] = angle[i];
      tiles[o + 3] = size[i];
    }
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, instances);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, tiles);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, atlas);
    gl.uniform2f(uScale, scaleX, scaleY);
    gl.uniform2f(uSide, TILE * CELL_W, TILE);
    gl.uniform1f(uAmbient, lightScheme.matches ? 1 : 0);
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);
    gl.bindVertexArray(null);
  };

  // Returns the largest thing still happening anywhere in the field, which is what
  // decides whether the loop has any reason to run another frame.
  const step = (dt: number): number => {
    const reach2 = REACH * REACH;
    const strength = PUSH * hover;
    let busy = 0;

    for (const w of waves) w.age += dt;
    while (waves.length > 0 && waves[0].age > WAVE_LIFE) waves.shift();

    for (let i = 0; i < count; i++) {
      const alive = clock >= born[i];
      let fx = 0;
      let fy = 0;

      if (alive && strength > 1) {
        const dx = posX[i] - magnet.x;
        const dy = posY[i] - magnet.y;
        const d2 = dx * dx + dy * dy;
        const fall = Math.exp(-d2 / reach2);
        if (fall > 0.002) {
          const inv = 1 / (Math.sqrt(d2) + 0.001);
          const nx = dx * inv;
          const ny = dy * inv;
          const g = strength * fall;
          fx += nx * g - ny * g * SWIRL;
          fy += ny * g + nx * g * SWIRL;
        }
      }

      if (alive) {
        for (const w of waves) {
          const dx = posX[i] - w.x;
          const dy = posY[i] - w.y;
          const d = Math.sqrt(dx * dx + dy * dy) + 0.001;
          const ring = WAVE_SPEED * w.age;
          const t = (d - ring) / WAVE_WIDTH;
          if (t < -2.5 || t > 2.5) continue;
          const g =
            (WAVE_FORCE * Math.exp(-t * t) * Math.exp(-w.age * WAVE_FADE)) /
            (1 + ring * WAVE_SPREAD);
          fx += (dx / d) * g;
          fy += (dy / d) * g;
        }
      }

      fx += (homeX[i] - posX[i]) * SPRING - velX[i] * DAMP;
      fy += (homeY[i] - posY[i]) * SPRING - velY[i] * DAMP;

      const m = invMass[i];
      velX[i] += fx * m * dt;
      velY[i] += fy * m * dt;
      posX[i] += velX[i] * dt;
      posY[i] += velY[i] * dt;

      const ox = posX[i] - homeX[i];
      const oy = posY[i] - homeY[i];
      const off = Math.min(1, Math.sqrt(ox * ox + oy * oy) / FULL);

      const wantAngle = spin[i] * off * TURN;
      angleVel[i] += ((wantAngle - angle[i]) * SPIN_K - angleVel[i] * SPIN_C) * dt;
      angle[i] += angleVel[i] * dt;

      const wantSize = alive ? 1 + off * GROW : 0;
      sizeVel[i] += ((wantSize - size[i]) * SIZE_K - sizeVel[i] * SIZE_C) * dt;
      size[i] += sizeVel[i] * dt;

      const active =
        Math.abs(velX[i]) + Math.abs(velY[i]) + Math.abs(sizeVel[i]) + Math.abs(angleVel[i]);
      if (active > busy) busy = active;
      if (!alive) busy = Math.max(busy, 1);
    }
    // A ring still in flight has tiles ahead of it that have not moved yet, so the loop
    // cannot decide it is done from the tiles alone.
    return waves.length > 0 ? Math.max(busy, 1) : busy;
  };

  const frame = (now: number) => {
    if (disposed) return;
    if (now - lastDraw < 1000 / FPS - 1) {
      raf = requestAnimationFrame(frame);
      return;
    }
    const dt = Math.min(1 / 30, (now - lastDraw) / 1000);
    lastDraw = now;
    clock += dt;

    hover += (hoverTarget - hover) * Math.min(1, dt * 12);
    const busy = step(dt);
    draw();

    // Sleep once the field is at rest and nothing is holding it: a wordmark sitting
    // still has no reason to keep a core awake for as long as the dialog is open.
    if (busy < 0.02 && hover < 0.002) {
      raf = 0;
      return;
    }
    raf = requestAnimationFrame(frame);
  };

  const wake = () => {
    if (disposed || raf || reduced.matches) return;
    lastDraw = performance.now();
    raf = requestAnimationFrame(frame);
  };

  const stop = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };

  // The still frame reduced motion gets: the mark assembled, nothing in flight.
  const settle = () => {
    waves.length = 0;
    for (let i = 0; i < count; i++) {
      posX[i] = homeX[i];
      posY[i] = homeY[i];
      velX[i] = 0;
      velY[i] = 0;
      angle[i] = 0;
      angleVel[i] = 0;
      size[i] = 1;
      sizeVel[i] = 0;
    }
    hover = 0;
    resize();
    draw();
  };

  const sync = () => {
    if (disposed) return;
    if (reduced.matches || document.visibilityState !== "visible") {
      stop();
      if (reduced.matches) settle();
      return;
    }
    wake();
  };

  const shock = (x: number, y: number) => {
    if (reduced.matches) return;
    if (waves.length >= MAX_WAVES) waves.shift();
    waves.push({ x, y, age: 0 });
    wake();
  };

  const aim = (e: PointerEvent) => {
    const b = canvas.getBoundingClientRect();
    if (b.width === 0 || b.height === 0) return;
    magnet.x = (((e.clientX - b.left) / b.width) * 2 - 1) / scaleX;
    magnet.y = (1 - ((e.clientY - b.top) / b.height) * 2) / scaleY;
    hoverTarget = 1;
    wake();
  };
  const press = (e: PointerEvent) => {
    aim(e);
    shock(magnet.x, magnet.y);
  };
  const release = () => {
    hoverTarget = 0;
    wake();
  };
  const lost = (e: Event) => {
    e.preventDefault();
    disposed = true;
    stop();
    onLost();
  };

  canvas.addEventListener("pointermove", aim);
  canvas.addEventListener("pointerdown", press);
  canvas.addEventListener("pointerleave", release);
  canvas.addEventListener("pointercancel", release);
  canvas.addEventListener("webglcontextlost", lost);
  document.addEventListener("visibilitychange", sync);
  reduced.addEventListener("change", sync);
  lightScheme.addEventListener("change", sync);

  // The dialog's open morph resizes the canvas with no window resize event behind it.
  const observer = new ResizeObserver(() => {
    resize();
    if (raf) return;
    draw();
  });
  observer.observe(canvas);

  resize();
  draw();
  sync();

  return {
    burst: () => shock(0, 0),
    dispose: () => {
      disposed = true;
      stop();
      observer.disconnect();
      canvas.removeEventListener("pointermove", aim);
      canvas.removeEventListener("pointerdown", press);
      canvas.removeEventListener("pointerleave", release);
      canvas.removeEventListener("pointercancel", release);
      canvas.removeEventListener("webglcontextlost", lost);
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
      lightScheme.removeEventListener("change", sync);
      gl.deleteBuffer(quad);
      gl.deleteBuffer(instances);
      gl.deleteBuffer(letters);
      gl.deleteVertexArray(vao);
      gl.deleteTexture(atlas);
      gl.deleteProgram(program);
    },
  };
}

export const MagnetMark = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<Handle>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const handle = canvasRef.current ? boot(canvasRef.current, () => setLive(false)) : undefined;
    handleRef.current = handle ?? null;
    if (handle) setLive(true);
    return () => {
      handleRef.current = null;
      handle?.dispose();
    };
  }, []);

  return (
    <div className="flex h-full w-full items-center justify-center p-6 select-none">
      <button
        type="button"
        // detail is 0 only for a keyboard activation; a real click already fired the
        // shockwave from the canvas' own pointerdown, at the cursor rather than here.
        onClick={(e) => {
          if (e.detail === 0) handleRef.current?.burst();
        }}
        aria-label="The Fk wordmark, spelled out of hundreds of tiny F's and k's. Move the cursor through it to push them aside, or press to send a shockwave out from the middle."
        className="relative w-full cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary"
        style={{ maxWidth: MAX_WIDTH, aspectRatio: `${VIEW_W} / ${VIEW_H}` }}
      >
        {/* Without WebGL the mark is still the mark, drawn as its own outlines. The
            tiles are the effect; the wordmark is the contract. */}
        <svg
          aria-hidden
          viewBox={`0 0 ${MARK_W} ${MARK_H}`}
          className="absolute top-1/2 left-1/2 w-[62%] -translate-x-1/2 -translate-y-1/2 fill-primary transition-opacity duration-500"
          style={{ opacity: live ? 0 : 1 }}
        >
          <path d={F_PATH} />
          <path d={K_PATH} />
        </svg>
        <canvas
          ref={canvasRef}
          aria-hidden
          className="absolute inset-0 size-full touch-none transition-opacity duration-500"
          style={{ opacity: live ? 1 : 0 }}
        />
      </button>
    </div>
  );
};
