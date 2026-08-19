import { motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";

/* The Claude mark, rebuilt as a solid object standing in a room.

   The outline is the real one — the shipped path, verbatim — but it is never drawn. At
   mount it is flattened to line segments and measured into a signed distance field: for
   every texel, how far it is to the nearest edge of the mark, negative inside. The shader
   then sphere-traces that field extruded along z, so what is on screen is a genuine solid
   being turned in front of a camera with real perspective, not a shaded picture of one.
   The near arms pass in front of the far ones, the walls down the sides of each arm come
   into view as it tilts, and the crevices between the arms occlude.

   Turning the ray rather than the geometry is what makes the rotation free: the field is
   built once and never rebuilt, and the mark is always exactly the shipped outline.

   The optics are derived rather than painted. One normal buys the reflection vector and
   the Fresnel weight; the room is a function of direction — floor, wall, ceiling, three
   tube lights and a softbox behind the camera — so every highlight is a real reflection of
   a real, if procedural, environment. That is why it holds up while the object turns:
   there is no hand-tuned gaussian sitting at a fixed spot on the surface waiting to be
   caught out.

   One honest caveat: WebGL cannot read the pixels behind its own canvas, so what the mark
   mirrors is that procedural room, never the page it is sitting on. */

// The shipped mark. Everything about the shape comes from this string.
const LOGO_PATH =
  "m50.228 170.321 50.357-28.257.843-2.463-.843-1.361h-2.462l-8.426-.518-28.775-.778-24.952-1.037-24.175-1.296-6.092-1.297L0 125.796l.583-3.759 5.12-3.434 7.324.648 16.202 1.101 24.304 1.685 17.629 1.037 26.118 2.722h4.148l.583-1.685-1.426-1.037-1.101-1.037-25.147-17.045-27.22-18.017-14.258-10.37-7.713-5.25-3.888-4.925-1.685-10.758 7-7.713 9.397.649 2.398.648 9.527 7.323 20.35 15.75L94.817 91.9l3.889 3.24 1.555-1.102.195-.777-1.75-2.917-14.453-26.118-15.425-26.572-6.87-11.018-1.814-6.61c-.648-2.723-1.102-4.991-1.102-7.778l7.972-10.823L71.42 0 82.05 1.426l4.472 3.888 6.61 15.101 10.694 23.786 16.591 32.34 4.861 9.592 2.592 8.879.973 2.722h1.685v-1.556l1.36-18.211 2.528-22.36 2.463-28.776.843-8.1 4.018-9.722 7.971-5.25 6.222 2.981 5.12 7.324-.713 4.73-3.046 19.768-5.962 30.98-3.889 20.739h2.268l2.593-2.593 10.499-13.934 17.628-22.036 7.778-8.749 9.073-9.657 5.833-4.601h11.018l8.1 12.055-3.628 12.443-11.342 14.388-9.398 12.184-13.48 18.147-8.426 14.518.778 1.166 2.01-.194 30.46-6.481 16.462-2.982 19.637-3.37 8.88 4.148.971 4.213-3.5 8.62-20.998 5.184-24.628 4.926-36.682 8.685-.454.324.519.648 16.526 1.555 7.065.389h17.304l32.21 2.398 8.426 5.574 5.055 6.805-.843 5.184-12.962 6.611-17.498-4.148-40.83-9.721-14-3.5h-1.944v1.167l11.666 11.406 21.387 19.314 26.767 24.887 1.36 6.157-3.434 4.86-3.63-.518-23.526-17.693-9.073-7.972-20.545-17.304h-1.36v1.814l4.73 6.935 25.017 37.59 1.296 11.536-1.814 3.76-6.481 2.268-7.13-1.297-14.647-20.544-15.1-23.138-12.185-20.739-1.49.843-7.194 77.448-3.37 3.953-7.778 2.981-6.48-4.925-3.436-7.972 3.435-15.749 4.148-20.544 3.37-16.333 3.046-20.285 1.815-6.74-.13-.454-1.49.194-15.295 20.999-23.267 31.433-18.406 19.702-4.407 1.75-7.648-3.954.713-7.064 4.277-6.286 25.47-32.405 15.36-20.092 9.917-11.6-.065-1.686h-.583L44.07 198.125l-12.055 1.555-5.185-4.86.648-7.972 2.463-2.593 20.35-13.999-.064.065Z";
const LOGO_VIEWBOX = { w: 256, h: 257 };

// The field's resolution. The mark is drawn at roughly 420 CSS pixels, so at 1024 the field
// is still being minified on a retina display — the right side of the line to be on, since
// every step of the march reads a bilinear interpolation of it and magnifying that shows up
// as faceting across the flat faces.
const SDF_SIZE = 1024;
// How much of the field's [-1, 1] square the mark's longest axis occupies. The margin left
// over is not decoration: the sampler clamps outside the field, and sphere tracing stays
// safe only while the clamped border value is a real distance to the mark.
const FIT = 0.78;

// This shader sphere-traces a real solid, so a pixel costs up to eighty texture taps and
// fill scales with the square of this. 1.5 is where a retina display still looks sharp: the
// coverage term in the march antialiases the silhouette, so the edge quality is not resting
// on raw density.
const MAX_DPR = 1.5;
// Half the plate's depth, in mark units. Thick enough that a turn shows a real wall down
// the side of an arm, thin enough that the mark still reads as the mark and not as a bar.
const THICKNESS = 0.1;
// Not the usual 30: the mark spins on press, and a spin is exactly where a halved frame
// rate stops reading as motion and starts reading as a slideshow.
const FPS = 60;
const MAX_SIZE = 420;

const QUAD_VERT = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv = a_pos;
  gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;

uniform sampler2D u_sdf;
uniform vec2 u_res;
uniform mat3 u_toObject;
uniform mat3 u_toWorld;
uniform vec3 u_key;
uniform float u_thick;
uniform float u_swell;
uniform float u_ambient; // 0 = dark page, 1 = light one
uniform float u_exposure;

// The camera. Close enough that the perspective is doing real work — the far arm of the
// mark is visibly smaller than the near one, which is most of what separates a turning
// solid from a shaded picture of one.
const float CAM_Z = 2.35;
const float FOV = 0.66;
// Everything the mark can reach, so a ray that misses this sphere can be thrown away
// before a single step is taken.
const float BOUND = 1.02;
const int STEPS = 96;
// The radius of the rolled edge around the whole solid. Small: a ray of this mark is only
// a couple of hundredths wide out near its tip, and a fillet wider than that would eat it.
const float ROUND = 0.022;

// The mark as a distance, read straight out of the field. Outside the texture the sampler
// clamps, and the border of the field holds a real distance to the mark (the fit leaves a
// margin all round), so the clamped value is always an underestimate — which is exactly
// what sphere tracing needs to stay safe. No branch required.
float field2d(vec2 p) {
  vec2 uv = p * 0.5 + 0.5;
  return texture(u_sdf, vec2(uv.x, 1.0 - uv.y)).r;
}

// The solid: the 2D mark extruded along z and rounded. Shrinking both the outline and the
// half-height by ROUND and then subtracting it again is what puts a fillet on every edge
// at once, including the ones where the face meets the wall.
float map(vec3 q) {
  // The faces are not flat. A flat mirror reflects one patch of room across its whole
  // surface and comes out looking like painted plastic; a very shallow lens gives the
  // reflection somewhere to travel as the mark turns. It also thins the arms toward their
  // points, which is what a struck or cast medallion does.
  float r = min(length(q.xy) / 1.15, 1.0);
  float halfDepth = (u_thick - ROUND) * (0.45 + 0.55 * sqrt(max(1.0 - r * r, 0.0)));
  vec2 w = vec2(field2d(q.xy / u_swell) * u_swell + ROUND, abs(q.z) - halfDepth);
  return min(max(w.x, w.y), 0.0) + length(max(w, 0.0)) - ROUND;
}

// The offset has to straddle more than one texel of the field. Narrower, and the four taps
// land inside a single bilinear cell, sample its flat interpolant, and every arm comes out
// corrugated with the field's own texel grid.
vec3 normalAt(vec3 q) {
  vec2 e = vec2(1.0, -1.0) * (3.5 / float(${SDF_SIZE}));
  return normalize(
    e.xyy * map(q + e.xyy) + e.yyx * map(q + e.yyx) +
    e.yxy * map(q + e.yxy) + e.xxx * map(q + e.xxx)
  );
}

// How much of the sky a point can actually see. On this shape it is the whole game: the
// narrow valleys where two arms meet are the only place a viewer can read the thickness,
// and without occlusion they light up exactly as brightly as the open faces do.
float occlusion(vec3 q, vec3 n) {
  float occ = 0.0;
  float scale = 1.0;
  for (int i = 0; i < 4; i++) {
    float step = 0.014 + 0.055 * float(i);
    occ += (step - map(q + n * step)) * scale;
    scale *= 0.72;
  }
  return clamp(1.0 - 2.4 * occ, 0.0, 1.0);
}

// The room, as a function of direction. No cubemap, no texture memory, and correct
// everywhere the mark curves.
//
// Two things govern how this had to be built. First, every value is linear radiance rather
// than a colour picker's number — a softbox really is several times brighter than a white
// wall, and that ratio is what the roll-off at the bottom of main() has to work with.
// Authoring these as display colours is what makes a shader like this clip to white the
// moment anything catches a light.
//
// Second, a mirror this flat only ever sees a narrow cone of directions, magnified across
// its whole surface. So the room has to vary within that cone, and it has to vary with
// azimuth and not only with height: an environment that is a function of elevation alone
// gives every arm at the same height the same reflection, and the mark comes back as two
// flat tones split by a hard line. The tube lights below are what break that up, and they
// have hard edges on purpose — a soft gradient reflects as a soft gradient and reads as
// painted plastic, where a hard-edged source reflects as a streak that travels.
//
// The floor and wall lift with the page's colour scheme. A dark studio reflected onto a
// mark sitting on a white page draws a black ring round it, because at grazing angles a
// mirror shows nothing but environment.
// The spread argument is how far the reflected direction swings from one pixel to the next, in
// radians. Along the fillets it is large — the edge turns a right angle inside a handful of
// pixels — and a tube light only a few degrees wide then lands entirely inside one pixel
// and misses its neighbours, which is a dotted line along every edge rather than a
// highlight. Widening the sources by that swing, and dimming them to match, is the same
// trick a mip bias performs for a texture.
vec3 room(vec3 d, float spread) {
  vec3 floorCol = mix(vec3(0.008, 0.009, 0.012), vec3(0.038, 0.036, 0.035), u_ambient);
  vec3 wallCol = mix(vec3(0.055, 0.060, 0.072), vec3(0.26, 0.26, 0.275), u_ambient);
  vec3 ceilCol = mix(vec3(0.32, 0.34, 0.40), vec3(1.30, 1.29, 1.26), u_ambient);

  vec3 c = mix(floorCol, wallCol, smoothstep(-0.42, 0.06, d.y));
  c = mix(c, ceilCol, smoothstep(0.10, 0.70, d.y));
  // The wall-to-floor seam: a soft darkening, not a cut. Hard, it lands straight across the
  // middle of the mark and splits it in half.
  c *= 1.0 - 0.22 * exp(-pow((d.y + 0.02) * 9.0, 2.0));

  float gain = 1.0 / (1.0 + 5.0 * spread);
  float sharp = 1.0 / (1.0 + 14.0 * spread);

  // Three tube lights, as bands about an axis rather than bands of constant height, which
  // is what a real strip suspended across a room actually subtends.
  float pitchAngle = atan(d.y, d.z);
  float yawAngle = atan(d.x, d.z);
  c += vec3(1.00, 0.99, 0.96) * smoothstep(0.115 + spread, 0.025, abs(pitchAngle - 0.92)) * 2.6 * gain;
  c += vec3(0.94, 0.96, 1.00) * smoothstep(0.085 + spread, 0.015, abs(pitchAngle + 1.05)) * 1.6 * gain;
  c += vec3(1.00, 0.97, 0.93) * smoothstep(0.090 + spread, 0.020, abs(yawAngle + 1.05)) * 1.3 * gain;

  // A softbox behind the camera. This one matters more than any of the others: a face
  // pointed at the viewer reflects the space the viewer is standing in, so without a source
  // there the whole front of the mark is a mirror of an empty wall.
  c += vec3(1.0, 0.99, 0.97) * pow(max(dot(d, normalize(vec3(0.28, 0.34, 0.90))), 0.0), 11.0 * sharp) * 2.2 * gain;
  // The key, which is the one that tracks and so the one the eye follows.
  c += vec3(1.0, 0.97, 0.92) * pow(max(dot(d, u_key), 0.0), 20.0 * sharp) * 3.0 * gain;
  // A cool fill from behind, so a face turning away from the key does not fall into a dead
  // half, and a warm bounce off the floor so the undersides are not black either.
  c += vec3(0.62, 0.68, 0.80) * pow(max(dot(d, normalize(vec3(-0.7, 0.3, -0.65))), 0.0), 6.0) * 0.55;
  vec3 bounceDir = normalize(vec3(-u_key.x, -0.85, -u_key.z));
  c += vec3(0.95, 0.62, 0.42) * pow(max(dot(d, bounceDir), 0.0), 3.0) * 0.30;
  return c;
}

// Narkowicz's fit of the ACES curve, then the sRGB transfer. Everything above works in
// linear radiance that runs well past 1.0; this is what turns a highlight several times
// brighter than the wall into a highlight rather than into a hole.
vec3 tonemap(vec3 x) {
  x = (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14);
  return pow(clamp(x, 0.0, 1.0), vec3(1.0 / 2.2));
}

void main() {
  vec2 uv = v_uv * 2.0 - 1.0;
  uv.x *= u_res.x / u_res.y;

  vec3 roWorld = vec3(0.0, 0.0, CAM_Z);
  vec3 rdWorld = normalize(vec3(uv * FOV, -1.0));
  // Marching happens in the mark's own frame, because that is the frame the field is in.
  // Turning the ray rather than the geometry is what makes the rotation free.
  vec3 ro = u_toObject * roWorld;
  vec3 rd = u_toObject * rdWorld;

  float b = dot(ro, rd);
  float disc = b * b - (dot(ro, ro) - BOUND * BOUND);

  float cov = 0.0;
  vec3 hitPos = vec3(0.0);
  if (disc > 0.0) {
    float root = sqrt(disc);
    float t = max(-b - root, 0.0);
    float tMax = -b + root;
    // How close the ray ever came to the surface, in pixels. A raymarched silhouette is
    // otherwise a hard binary edge, and on a shape made almost entirely of points and thin
    // arms that reads as a jagged mess at any resolution.
    //
    // This measure is for rays that MISS. A ray that lands stops with some leftover
    // distance below the hit threshold, and that leftover is a step-quantisation artefact,
    // not a statement about coverage — feeding it into the edge term ribs every wall with
    // the marcher's own step remainder.
    float nearest = 1e9;
    vec3 nearestPos = ro + rd * t;
    float prev = 1e9;
    bool hit = false;
    for (int i = 0; i < STEPS; i++) {
      vec3 q = ro + rd * t;
      float h = map(q);
      float pixel = (2.0 * FOV / u_res.y) * t;
      if (h < pixel * 0.7) {
        hit = true;
        hitPos = q;
        break;
      }
      // A ray that slides past the surface reaches its closest approach BETWEEN two steps,
      // so reading the minimum off the sampled points alone makes the edge beat against the
      // marcher's step phase and come out as a dotted line. Two consecutive distances give
      // the crossing point on the segment, which is the standard estimator used for soft
      // shadows and does the same job here.
      // Only valid while the ray is still closing on the surface; where it is opening out
      // again the formula overshoots past h, which drives the estimate to zero and paints
      // full coverage into empty space as a dust of stray pixels.
      float back = (i == 0 || h >= prev) ? 0.0 : min(h * h / (2.0 * prev), h);
      float closest = sqrt(max(h * h - back * back, 0.0));
      float ratio = closest / max((2.0 * FOV / u_res.y) * max(t - back, 1e-4), 1e-6);
      if (ratio < nearest) {
        nearest = ratio;
        nearestPos = q - rd * back;
      }
      prev = h;
      if (t > tMax) break;
      t += max(h, 0.0015);
    }
    if (!hit) {
      cov = clamp(1.0 - nearest, 0.0, 1.0);
      hitPos = nearestPos;
    } else {
      cov = 1.0;
    }
  }

  if (cov <= 0.002) {
    outColor = vec4(0.0);
    return;
  }

  vec3 nObj = normalAt(hitPos);
  float ao = occlusion(hitPos, nObj);
  vec3 N = u_toWorld * nObj;
  vec3 V = -rdWorld;

  // Polished metal, warmed a little toward the mark's terracotta so that a mirror of a
  // grey room still reads as this mark rather than as a generic chrome asset. Linear, since
  // that is the space everything above lights in.
  const vec3 F0 = vec3(0.92, 0.80, 0.74);
  float ndv = clamp(dot(N, V), 0.0, 1.0);
  vec3 F = F0 + (1.0 - F0) * pow(1.0 - ndv, 5.0);

  vec3 R = reflect(-V, N);
  // A Fresnel-weighted reflection of the room already is the bright rim: at grazing angles
  // the weight goes to 1 and the edge shows nothing else. There is no separate rim term
  // here, and adding one would be a sign the reflection was not doing its job.
  // The room's own sources are the specular. A separate hand-placed highlight on top of
  // them speckles: the fillets are a couple of pixels wide and turn the reflection through
  // a wide angle inside that, so a lobe tight enough to read as a glint lands on some
  // pixels of an edge and misses the rest.
  // How far the reflection swings between neighbouring pixels. On the flat faces this is
  // almost nothing and the room stays crisp; across a fillet it is large, and the room is
  // blurred exactly as much as that pixel is actually averaging over.
  float spread = clamp(length(fwidth(R)) * 0.75, 0.0, 0.6);
  vec3 color = room(R, spread) * F * mix(0.35, 1.0, ao);

  // Premultiplied, so the mark composites cleanly over whatever the page puts behind it.
  outColor = vec4(tonemap(max(color, vec3(0.0)) * u_exposure) * cov, cov);
}`;

// The outline, flattened to line segments in the field's own coordinates. The mark is a
// polygon apart from a single cubic, so this is nearly a straight parse; the one curve is
// subdivided far enough that its error lands well under a texel.
function flattenPath(): Float64Array {
  const span = Math.max(LOGO_VIEWBOX.w, LOGO_VIEWBOX.h);
  const scale = (2 * FIT) / span;
  const toX = (x: number) => (x - LOGO_VIEWBOX.w / 2) * scale;
  const toY = (y: number) => (y - LOGO_VIEWBOX.h / 2) * scale;

  const out: number[] = [];
  let cx = 0;
  let cy = 0;
  let sx = 0;
  let sy = 0;
  const line = (nx: number, ny: number) => {
    out.push(toX(cx), toY(cy), toX(nx), toY(ny));
    cx = nx;
    cy = ny;
  };
  const cubic = (x1: number, y1: number, x2: number, y2: number, x: number, y: number) => {
    const ax = cx;
    const ay = cy;
    for (let i = 1; i <= 12; i++) {
      const t = i / 12;
      const u = 1 - t;
      out.push(
        toX(cx),
        toY(cy),
        toX(u * u * u * ax + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x),
        toY(u * u * u * ay + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y),
      );
      cx = out[out.length - 2] / scale + LOGO_VIEWBOX.w / 2;
      cy = out[out.length - 1] / scale + LOGO_VIEWBOX.h / 2;
    }
  };

  for (const token of LOGO_PATH.match(/[a-zA-Z][^a-zA-Z]*/g) ?? []) {
    const cmd = token[0];
    const rel = cmd === cmd.toLowerCase();
    const n = (token.slice(1).match(/-?\d*\.?\d+(?:e-?\d+)?/g) ?? []).map(Number);
    const lower = cmd.toLowerCase();
    if (lower === "m") {
      cx = rel ? cx + n[0] : n[0];
      cy = rel ? cy + n[1] : n[1];
      sx = cx;
      sy = cy;
      // Everything after the first pair of a moveto is an implicit lineto.
      for (let i = 2; i < n.length; i += 2)
        line(rel ? cx + n[i] : n[i], rel ? cy + n[i + 1] : n[i + 1]);
    } else if (lower === "l") {
      for (let i = 0; i < n.length; i += 2)
        line(rel ? cx + n[i] : n[i], rel ? cy + n[i + 1] : n[i + 1]);
    } else if (lower === "h") {
      for (const v of n) line(rel ? cx + v : v, cy);
    } else if (lower === "v") {
      for (const v of n) line(cx, rel ? cy + v : v);
    } else if (lower === "c") {
      for (let i = 0; i < n.length; i += 6) {
        cubic(
          rel ? cx + n[i] : n[i],
          rel ? cy + n[i + 1] : n[i + 1],
          rel ? cx + n[i + 2] : n[i + 2],
          rel ? cy + n[i + 3] : n[i + 3],
          rel ? cx + n[i + 4] : n[i + 4],
          rel ? cy + n[i + 5] : n[i + 5],
        );
      }
    } else if (lower === "z") {
      line(sx, sy);
    }
  }
  return new Float64Array(out);
}

function segmentDistance(segs: Float64Array, i: number, px: number, py: number): number {
  const ax = segs[i];
  const ay = segs[i + 1];
  const ex = segs[i + 2] - ax;
  const ey = segs[i + 3] - ay;
  const wx = px - ax;
  const wy = py - ay;
  const len = ex * ex + ey * ey;
  const t = len > 0 ? Math.min(1, Math.max(0, (wx * ex + wy * ey) / len)) : 0;
  const dx = wx - ex * t;
  const dy = wy - ey * t;
  return Math.sqrt(dx * dx + dy * dy);
}

// The distance to the outline itself, computed exactly rather than measured off a raster.
//
// A raster distance transform is exact about the distance and lumpy about its direction:
// the nearest boundary pixel is a lattice point, so along a shallow wall the gradient steps
// from one candidate to the next instead of turning. The march takes its normals from that
// gradient, and the steps come out as fine ribbing down the side of every arm — visible on
// whichever arm the camera magnifies most, and not fixable by blurring the field, because
// blurring wide enough to hide it also eats the points.
//
// Measuring against the geometry costs about the same and has no lattice to snap to. It is
// affordable because of the blocking: for each block of texels, the nearest segment to any
// texel inside it must lie within the block's own nearest distance plus twice the block's
// half diagonal, which cuts a couple of hundred segments down to a handful.
function buildSdf(size: number): Float32Array | undefined {
  const segs = flattenPath();
  const count = segs.length / 4;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return undefined;
  const span = Math.max(LOGO_VIEWBOX.w, LOGO_VIEWBOX.h);
  const scale = (size * FIT) / span;
  ctx.translate(size / 2, size / 2);
  ctx.scale(scale, scale);
  ctx.translate(-LOGO_VIEWBOX.w / 2, -LOGO_VIEWBOX.h / 2);
  ctx.fillStyle = "#fff";
  ctx.fill(new Path2D(LOGO_PATH));
  const pixels = ctx.getImageData(0, 0, size, size).data;

  const field = new Float32Array(size * size);
  const BLOCK = 16;
  const half = (BLOCK / size) * Math.SQRT2;
  const centreDist = new Float64Array(count);
  const shortlist = new Int32Array(count);

  for (let by = 0; by < size; by += BLOCK) {
    for (let bx = 0; bx < size; bx += BLOCK) {
      const ccx = ((bx + BLOCK / 2) / size) * 2 - 1;
      const ccy = ((by + BLOCK / 2) / size) * 2 - 1;
      let nearest = Infinity;
      for (let s = 0; s < count; s++) {
        const d = segmentDistance(segs, s * 4, ccx, ccy);
        centreDist[s] = d;
        if (d < nearest) nearest = d;
      }
      const cutoff = nearest + 2 * half;
      let listed = 0;
      for (let s = 0; s < count; s++) {
        if (centreDist[s] <= cutoff) shortlist[listed++] = s * 4;
      }

      for (let y = by; y < by + BLOCK; y++) {
        const py = ((y + 0.5) / size) * 2 - 1;
        for (let x = bx; x < bx + BLOCK; x++) {
          const px = ((x + 0.5) / size) * 2 - 1;
          let best = Infinity;
          for (let k = 0; k < listed; k++) {
            const d = segmentDistance(segs, shortlist[k], px, py);
            if (d < best) best = d;
          }
          const index = y * size + x;
          // The rasteriser only has to answer in or out; the magnitude is exact already, and
          // where the sign is uncertain the magnitude is a fraction of a texel anyway.
          field[index] = pixels[index * 4 + 3] >= 128 ? -best : best;
        }
      }
    }
  }
  return field;
}

function compile(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("shader");
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "compile");
  }
  return shader;
}

function linkProgram(gl: WebGL2RenderingContext, vert: string, frag: string): WebGLProgram {
  const program = gl.createProgram();
  if (!program) throw new Error("program");
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vert));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? "link");
  }
  return program;
}

interface Handle {
  flick: () => void;
  dispose: () => void;
}

// Object-to-world for the mark: yaw about the vertical, then pitch, then a slight roll.
// Column major, because that is how GLSL reads a mat3.
function orientation(yaw: number, pitch: number, roll: number): Float32Array {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const cr = Math.cos(roll);
  const sr = Math.sin(roll);
  // Ry * Rx * Rz, multiplied out.
  const m = [
    cy * cr + sy * sp * sr,
    cp * sr,
    -sy * cr + cy * sp * sr,
    -cy * sr + sy * sp * cr,
    cp * cr,
    sy * sr + cy * sp * cr,
    sy * cp,
    -sp,
    cy * cp,
  ];
  return new Float32Array(m);
}

function boot(canvas: HTMLCanvasElement, onLost: () => void): Handle | undefined {
  const gl = canvas.getContext("webgl2", {
    antialias: false,
    alpha: true,
    premultipliedAlpha: true,
    failIfMajorPerformanceCaveat: true,
  });
  if (!gl) return undefined;
  const field = buildSdf(SDF_SIZE);
  if (!field) return undefined;

  const program = linkProgram(gl, QUAD_VERT, FRAG);
  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const aPos = gl.getAttribLocation(program, "a_pos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  // R32F rather than a packed 8-bit encoding: eight bits of distance quantises the march
  // into visible terraces across the flat faces.
  // A hard requirement, not a nicety: every step of the march is a difference of
  // neighbouring texels, and with point sampling the marcher would be walking a staircase.
  // Better to hand the page its flat fallback than to render a broken solid.
  if (!gl.getExtension("OES_texture_float_linear")) return undefined;
  const sdf = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, sdf);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, SDF_SIZE, SDF_SIZE, 0, gl.RED, gl.FLOAT, field);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const at = (name: string) => gl.getUniformLocation(program, name);
  const u = {
    sdf: at("u_sdf"),
    res: at("u_res"),
    toObject: at("u_toObject"),
    toWorld: at("u_toWorld"),
    key: at("u_key"),
    thick: at("u_thick"),
    swell: at("u_swell"),
    ambient: at("u_ambient"),
    exposure: at("u_exposure"),
  };

  const lightScheme = window.matchMedia("(prefers-color-scheme: light)");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  const angle = { yaw: 0, pitch: 0 };
  const aim = { yaw: 0, pitch: 0 };
  let tracking = false;
  // The flick's own contribution to the yaw, kept apart from the idle sway so the two can
  // be composed rather than fought over.
  let flickAngle = 0;
  let flickVel = 0;
  let burst = 0;
  let time = 2;
  let disposed = false;
  let raf = 0;
  let last = 0;
  let lastDraw = 0;

  const resize = () => {
    const dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
  };

  const draw = () => {
    resize();
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(program);
    gl.bindVertexArray(vao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sdf);
    gl.uniform1i(u.sdf, 0);

    const toWorld = orientation(angle.yaw + flickAngle, angle.pitch, Math.sin(time * 0.19) * 0.05);
    // The rotation is orthonormal, so the inverse is the transpose — which for a
    // column-major 3x3 is the same nine numbers read the other way round.
    const toObject = new Float32Array([
      toWorld[0],
      toWorld[3],
      toWorld[6],
      toWorld[1],
      toWorld[4],
      toWorld[7],
      toWorld[2],
      toWorld[5],
      toWorld[8],
    ]);
    gl.uniformMatrix3fv(u.toWorld, false, toWorld);
    gl.uniformMatrix3fv(u.toObject, false, toObject);

    gl.uniform2f(u.res, canvas.width, canvas.height);
    gl.uniform1f(u.thick, THICKNESS);
    // The mark breathes, and a press swells it. Scaling the field the march reads is the
    // cheapest possible way to do that, and the outline stays exactly the shipped one.
    gl.uniform1f(u.swell, 1 + Math.sin(time * 0.7) * 0.012 + burst * 0.05);

    // The key orbits slowly on its own even when nothing is touching the mark, because a
    // still light on a still object is the one arrangement in which none of this looks
    // real.
    const kx = Math.cos(time * 0.31) * 0.34;
    const ky = 0.6 + Math.sin(time * 0.23) * 0.16;
    const kl = Math.hypot(kx, ky, 0.7);
    gl.uniform3f(u.key, kx / kl, ky / kl, 0.7 / kl);

    gl.uniform1f(u.ambient, lightScheme.matches ? 1 : 0);
    // A press lifts the exposure for a moment, so the flick reads as light flashing across
    // the object rather than as the object changing colour.
    gl.uniform1f(u.exposure, 1 + burst * 0.45);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);
  };

  const approach = (from: number, to: number, k: number) => from + (to - from) * k;

  const frame = (now: number) => {
    if (disposed) return;
    raf = requestAnimationFrame(frame);
    if (now - lastDraw < 1000 / FPS - 1) return;
    lastDraw = now;

    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    time += dt;

    // The flick is angular momentum with drag rather than a tween: it carries past the
    // press and slows the way something heavy does. Once it has run down it settles onto
    // the nearest whole turn instead of unwinding, so the mark never rotates backwards.
    flickAngle += flickVel * dt;
    flickVel *= Math.exp(-dt * 1.35);
    if (Math.abs(flickVel) < 0.35) {
      const settled = Math.round(flickAngle / (Math.PI * 2)) * Math.PI * 2;
      flickAngle = approach(flickAngle, settled, Math.min(1, dt * 2.2));
    }
    burst *= Math.exp(-dt * 3.2);

    if (!tracking) {
      // Wide enough that the near arms clearly pass in front of the far ones and the
      // thickness of the plate comes into view on one side. A shallower sway leaves it
      // looking like a picture that is being lit from different angles.
      aim.yaw = Math.sin(time * 0.29) * 0.5;
      aim.pitch = Math.sin(time * 0.21 + 1.1) * 0.26;
    }
    const ease = Math.min(1, dt * (tracking ? 5.5 : 1.6));
    angle.yaw = approach(angle.yaw, aim.yaw, ease);
    angle.pitch = approach(angle.pitch, aim.pitch, ease);

    draw();
  };

  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };
  // Reduced motion keeps the whole appearance and drops only the clock: one frame, struck
  // again whenever the colour scheme changes.
  const sync = () => {
    if (disposed) return;
    if (reduced.matches || document.visibilityState !== "visible") {
      stop();
      if (reduced.matches) draw();
      return;
    }
    if (raf) return;
    last = performance.now();
    lastDraw = 0;
    raf = requestAnimationFrame(frame);
  };

  const move = (e: PointerEvent) => {
    const b = canvas.getBoundingClientRect();
    aim.yaw = (((e.clientX - b.left) / b.width) * 2 - 1) * 0.85;
    aim.pitch = (1 - ((e.clientY - b.top) / b.height) * 2) * 0.5;
    tracking = true;
    if (!raf) draw();
  };
  const leave = () => {
    tracking = false;
  };
  const lost = (e: Event) => {
    e.preventDefault();
    disposed = true;
    stop();
    onLost();
  };

  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerleave", leave);
  canvas.addEventListener("webglcontextlost", lost);
  document.addEventListener("visibilitychange", sync);
  reduced.addEventListener("change", sync);
  lightScheme.addEventListener("change", sync);

  const observer = new ResizeObserver(() => {
    if (!raf) draw();
  });
  observer.observe(canvas);

  draw();
  sync();

  return {
    flick: () => {
      flickVel += 7.5;
      burst = Math.min(1, burst + 0.8);
      if (!raf) draw();
    },
    dispose: () => {
      disposed = true;
      stop();
      observer.disconnect();
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerleave", leave);
      canvas.removeEventListener("webglcontextlost", lost);
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
      lightScheme.removeEventListener("change", sync);
      gl.deleteBuffer(quad);
      gl.deleteVertexArray(vao);
      gl.deleteTexture(sdf);
      gl.deleteProgram(program);
    },
  };
}

export const ClaudeMark = () => {
  const gradientId = useId();
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
    <div className="flex h-full w-full items-center justify-center p-6 font-pretendard select-none">
      <motion.button
        type="button"
        onClick={() => handleRef.current?.flick()}
        whileTap={{ scale: 0.975 }}
        transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.6 }}
        aria-label="The Claude mark, in chrome. Press to spin it."
        className="relative aspect-square w-full cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary"
        style={{ maxWidth: MAX_SIZE }}
      >
        {/* The fallback, for every machine with hardware acceleration switched off, a
            blocklisted GPU or a lost context. Same outline, and a gradient standing in for
            the room it would otherwise be reflecting — flat, but unmistakably this mark. */}
        <svg
          aria-hidden
          viewBox={`0 0 ${LOGO_VIEWBOX.w} ${LOGO_VIEWBOX.h}`}
          className="absolute inset-[16%] size-[68%] transition-opacity duration-500"
          style={{ opacity: live ? 0 : 1 }}
        >
          <linearGradient id={gradientId} x1="0.15" y1="0" x2="0.8" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.38" stopColor="#e2d3cc" />
            <stop offset="0.72" stopColor="#8a7871" />
            <stop offset="1" stopColor="#f2e6e0" />
          </linearGradient>
          <path d={LOGO_PATH} fill={`url(#${gradientId})`} />
        </svg>
        <canvas
          ref={canvasRef}
          aria-hidden
          className="absolute inset-0 size-full touch-none transition-opacity duration-500"
          style={{ opacity: live ? 1 : 0 }}
        />
      </motion.button>
    </div>
  );
};
