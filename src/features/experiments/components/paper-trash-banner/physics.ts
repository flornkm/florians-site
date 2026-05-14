import * as THREE from "three";

export const COLS = 32;
export const ROWS = 8;
export const SPACING = 0.04;

export const STRUCT_REST = SPACING;
export const SHEAR_REST = SPACING * Math.SQRT2;
export const BEND_REST = SPACING * 2;

export const GRAVITY = new THREE.Vector3(0, -0.6, 0);
export const DAMPING = 0.985;
export const TIMESTEP = 0.007;
export const SUB_STEPS = 5;
export const CONSTRAINT_ITERS = 14;
export const BEND_COMPLIANCE = 0.04;
export const INFLUENCE_RADIUS = 1;
export const INFLUENCE_FALLOFF = 2.0;
export const MAX_DISPLACEMENT = 0.34;
export const GRAB_SPRING = 0.42;
export const ANCHOR_PULL = 0.022;
export const BALL_LEN_SCALE = 0.42;

export const CRUMPLE_PROMOTE = 0.96;

export function idx(c: number, r: number) {
  return r * COLS + c;
}

export interface Constraint {
  i: number;
  j: number;
  rest: number;
  bend: boolean;
}

export function buildConstraints(): Constraint[] {
  const out: Constraint[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (c < COLS - 1)
        out.push({ i: idx(c, r), j: idx(c + 1, r), rest: STRUCT_REST, bend: false });
      if (r < ROWS - 1)
        out.push({ i: idx(c, r), j: idx(c, r + 1), rest: STRUCT_REST, bend: false });
      if (c < COLS - 1 && r < ROWS - 1) {
        out.push({ i: idx(c, r), j: idx(c + 1, r + 1), rest: SHEAR_REST, bend: false });
        out.push({ i: idx(c + 1, r), j: idx(c, r + 1), rest: SHEAR_REST, bend: false });
      }
      if (c < COLS - 2) out.push({ i: idx(c, r), j: idx(c + 2, r), rest: BEND_REST, bend: true });
      if (r < ROWS - 2) out.push({ i: idx(c, r), j: idx(c, r + 2), rest: BEND_REST, bend: true });
    }
  }
  return out;
}

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Per-vertex target that the cloth blends toward as it crumples.
 * Each vertex collapses toward a small 3D wad (compressed XY + chaotic Z) so
 * the paper genuinely bunches up as a ball rather than just rotating in plane.
 */
export function buildBallRest(rest: Float32Array): Float32Array {
  const count = COLS * ROWS;
  const out = new Float32Array(count * 3);
  const rand = mulberry32(0xb4117);
  const SCALE_XY = 0.36;
  const JITTER_XY = 0.045;
  const JITTER_Z = 0.075;
  for (let i = 0; i < count; i++) {
    const ix = i * 3;
    out[ix] = rest[ix] * SCALE_XY + (rand() - 0.5) * JITTER_XY;
    out[ix + 1] = rest[ix + 1] * SCALE_XY + (rand() - 0.5) * JITTER_XY;
    out[ix + 2] = (rand() - 0.5) * JITTER_Z * 2;
  }
  return out;
}

export function computeInfluenced(centerIdx: number) {
  const cc = centerIdx % COLS;
  const cr = Math.floor(centerIdx / COLS);
  const result: { idx: number; weight: number }[] = [];
  for (let dr = -INFLUENCE_RADIUS; dr <= INFLUENCE_RADIUS; dr++) {
    for (let dc = -INFLUENCE_RADIUS; dc <= INFLUENCE_RADIUS; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = cr + dr;
      const nc = cc + dc;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
      const dist = Math.sqrt(dr * dr + dc * dc);
      if (dist > INFLUENCE_RADIUS) continue;
      const weight = Math.pow(1 - dist / (INFLUENCE_RADIUS + 1), INFLUENCE_FALLOFF);
      result.push({ idx: idx(nc, nr), weight });
    }
  }
  return result;
}
