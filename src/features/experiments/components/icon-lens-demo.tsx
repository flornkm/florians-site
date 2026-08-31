import { useEffect, useRef, useState } from "react";

/* A photo-app icon — squircle, a watercolour wash for a tile, camera loupe resting on
   its bottom-right corner — where the loupe is not artwork. It is a piece of glass, and
   you can pick it up and drag it anywhere on the plate.

   Everything the icon is made of lives in one function, `scene()`: the surface, the
   tile, the wash, the loupe's own shadow. The glass never sees a rendered image of any of
   it — it calls the same function again along a refracted ray, and the rim, which is raw
   glass, calls it once per wavelength and comes back fringed with the spectrum it put
   there. Dragging the loupe over the tile edge bends the edge, because the edge is a term
   in the function the glass is sampling.

   The element in the middle is a corrected one and does the opposite: a single ray, at ten
   times, snapped to the lattice the icon is displayed on. Magnifying a function would only
   draw it larger, which is a bigger icon rather than a closer look at this one. What is
   actually under the glass is a raster, so ten times over it is ten times over its pixels
   — gutters, subpixel stripes and all, each fading out at the magnification where it would
   fall under the pixel drawing it.

   The tile is a wash rather than a gradient: the seven colour stops are sampled through
   a coordinate the noise has already pushed around, so the boundary between two of them
   is a front of fingers instead of a line, and the pigment thins into the backing at the
   outline the way it runs out of water. Under a dark theme the backing is the surrounding
   surface, not white — a white slab behind the wash reads as a border drawn around the
   icon rather than as the icon.

   The one number that is not physical is the index spread. Real crown glass disperses
   far too little to see at 90 pixels; everything else follows from exaggerating it. */

// Half-extents in the coordinate space the shader works in: y runs -1..1 over the
// canvas height, x is scaled by the aspect. The icon is measured off the reference at
// these proportions, so changing the tile moves everything with it.
// One dial for the whole drawing: every proportion below was measured off the reference
// at 1.0, so the icon resizes without any of them being re-derived.
const ICON = 0.88;

const TILE = 0.62 * ICON;
const GRAD = 0.445 * ICON;
const LENS_R = 0.33 * ICON; // 0.53 of the tile's half-width, measured off the reference
const LENS_HOME = { x: 0.223 * ICON, y: -0.248 * ICON };

// Every layer inside the loupe, as a fraction of its outer glass radius.
const BARREL_OUT = 0.845;
const BARREL_IN = 0.56;
const ELEMENT_R = 0.5;

const FPS = 60;

const VERT = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv = a_pos;
  gl_Position = vec4(a_pos * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform float u_time;
uniform float u_aspect;
uniform float u_ambient; // 0 = dark surroundings, 1 = light ones
uniform vec2 u_lens;     // loupe centre, in the same space as p
uniform float u_lensR;
uniform float u_lift;    // 0 resting on the tile, 1 held above it
uniform sampler2D u_engrave; // the ring text, alpha only, in loupe-local uv
out vec4 outColor;

const float TILE = ${TILE.toFixed(5)};
const float GRAD = ${GRAD.toFixed(5)};

const float BARREL_OUT = ${BARREL_OUT};
const float BARREL_IN = ${BARREL_IN};
const float ELEMENT_R = ${ELEMENT_R};

// How many wavelengths the glass is sampled at. Three (plain RGB) only fringes the two
// edges of whatever is behind; a continuous spectrum needs the middle sampled too. The
// wash underneath is soft everywhere, its own outline included, which is what lets this
// stop at 14 — the plate's edge is the only hard feature left, and it crosses the glass
// one side at a time.
const int TAPS = 14;
// Crown glass is 1.51-1.53 across the visible range. Pushed apart until the dispersion
// is visible at this size; the single deliberate departure from physical here.
const float IOR_RED = 1.44;
const float IOR_VIOLET = 1.62;

// The face is flat across the middle and turns hard in the last of the radius. At 2 the
// body is a squashed dome, the normal stands nearly straight up out to the outline, and
// there is neither a steep band for the rim to reflect nor anything to bend the tile
// through — which is most of what separates a lens from a bead.
const float EDGE_POW = 5.0;
const float BEZEL_THICK = 0.30;
// Sagitta of the centre element, which is a paraboloid rather than a cap of a sphere.
// A sphere's outer zones are far stronger than its middle: at the working distance a ten
// times loupe needs, the image has already turned over a third of the way out and by the
// rim it is compressed to a third of a pixel — moire, and an edge that appears to come in
// from the wrong side. A parabola's normal tilts in proportion to radius, so every zone
// has the same power. This is what an aspheric element is for, and why any loupe worth
// looking through has one.
const float ELEMENT_THICK = 0.42;
// How much the group actually bends a ray, which is not what its front face looks like it
// would. An element is a cemented pair, and the flint behind the crown bends the ray back:
// the face you see can be steeply curved while the pair's net power is a fraction of it.
// Reading the power off the visible curvature instead is what makes a lens look like a
// marble — refraction is only linear in the tilt for small tilts, so a forty-degree face
// magnifies its rim at a third of what its axis does and the field bulges. At this the
// rim magnifies about four fifths of what the axis does, which is enough curvature to
// know there is glass in the way and not enough to read as a bead.
const float ELEMENT_BEND = 0.16;
// What the loupe is actually for, and the only number here that is set rather than solved
// — the working distance follows from it. Lifting it off the page magnifies harder, the
// same way holding a real one further from the paper does, and at that point it is running
// at the rating engraved on its own barrel.
const float MAG_REST = 8.0;
const float MAG_LIFT = 10.0;

// Distance from the centre in units of "1 at the outline" — what length() gave when the
// shape was a circle, which is all anything downstream ever asked for. Apple's squircle
// is close to |x|^5 + |y|^5 = 1; the inner tile is rounder relative to its own size,
// which is the exponent, not the radius. Both are written out in multiplies because
// scene() runs once per wavelength and a generic pow(abs(q), n) is three pow calls.
float sq5(vec2 q) {
  vec2 a = abs(q);
  vec2 b = a * a;
  vec2 c = b * b * a;
  return pow(c.x + c.y, 0.2);
}

float sq4(vec2 q) {
  vec2 a = q * q;
  a = a * a;
  return sqrt(sqrt(a.x + a.y));
}

float coverage(float d, float w) {
  return 1.0 - smoothstep(1.0 - w, 1.0 + w, d);
}

// Value noise rather than gradient noise: the field is only ever used to push
// coordinates around, never sampled for an edge, and it runs up to fourteen times per
// pixel inside the glass. The quintic fade is what keeps the lattice from showing as a
// grid once the loupe magnifies it ten times.
float hash21(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
             mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x), u.y);
}

const int FBM_OCT_MAX = 6;
// Irrational-ish turn per octave, so the lattices never line up into a plaid.
const mat2 FBM_ROT = mat2(0.80, 0.60, -0.60, 0.80);

// fw is the pixel footprint in the same units as p. Octaves fade out as they approach it
// and the loop stops once one has gone under, so the field costs what the viewer can
// actually resolve: three octaves out on the plate, all six under the glass, where the
// same function is being asked for ten times the detail. Fading rather than clipping is
// what keeps those two the same field instead of two that pop into each other.
//
// This is the whole reason the icon is a function and not an image. There is nothing to
// run out of — magnify it and the next octave is simply there.
float fbm(vec2 p, float fw) {
  float sum = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int i = 0; i < FBM_OCT_MAX; i++) {
    float fade = 1.0 - smoothstep(0.25, 0.75, fw * freq);
    if (fade <= 0.0) break;
    // Octaves are summed as deviations from the middle, not as values, so one that has
    // gone under the pixel contributes what it averages to rather than nothing. Fading a
    // value toward zero instead is a bias that grows as the octaves drop out, and it would
    // show up as the tile changing tone wherever the loupe magnified it.
    sum += amp * fade * (vnoise(p * freq) - 0.5);
    p = FBM_ROT * p;
    freq *= 2.07;
    amp *= 0.5;
  }
  // Normalised against the three octaves that survive at rest, not against however many
  // ran: the ones that wake up under the loupe add detail on top of the coarse structure
  // rather than rescaling it.
  return 0.5 + sum / 0.875;
}

// The gradient's colour stops, drifting. Filled once per pixel in main() rather than
// inside pigment(), because it is called once per wavelength and the drift does not
// depend on where it is sampled — that hoist is what makes 14 taps cost about what one
// did.
vec2 gAt[7];
const vec3 G_COL[7] = vec3[7](
  vec3(0.145, 0.353, 0.902), vec3(0.361, 0.847, 0.961), vec3(0.769, 0.902, 1.000),
  vec3(0.608, 0.353, 0.925), vec3(0.937, 0.267, 0.616), vec3(0.976, 0.494, 0.271),
  vec3(1.000, 0.867, 0.898)
);
// Tight enough that each stop still owns its corner. Wide sigmas average the seven into
// one pale wash — the orange goes first, and with it the only warm note in the icon — and
// they also leave the warp nothing to tear apart, since a field that is already uniform
// looks the same after it has been pushed around.
const float G_SIG[7] = float[7](0.55, 0.50, 0.52, 0.52, 0.52, 0.50, 0.60);

void placeStops() {
  vec2 base[7] = vec2[7](
    vec2(-0.82, 0.80), vec2(0.14, 0.92), vec2(0.90, 0.60),
    vec2(0.86, -0.66), vec2(0.06, -0.92), vec2(-0.86, -0.46), vec2(-0.44, 0.10)
  );
  for (int i = 0; i < 7; i++) {
    // A slow lissajous per stop, each on its own phase. The gradient is the only thing
    // in the icon that moves by itself, so it stays under the rate where it would read
    // as animation rather than as light.
    gAt[i] = base[i] + 0.09 * vec2(
      cos(u_time * 0.21 + float(i) * 1.7),
      sin(u_time * 0.17 + float(i) * 2.3)
    );
  }
}

// The tile of colour, and how much of it is actually there.
//
// Stops blended by gaussian weight and normalised — a mesh gradient, not a stack of
// overlaid radials, so no stop can wash the others out and the field stays inside the
// hull of the colours that made it. What separates this from a gradient is where it is
// sampled: the coordinate has been through two levels of warp first, so a stop reaches
// into its neighbour in fingers, and the two run together along a front instead of
// meeting on a line.
//
// Alpha is not opacity for its own sake. It is how much pigment the water left behind,
// so the backing shows through wherever the wash ran thin — the outline included, which
// is why the tile has no hard edge anywhere. A wash does not have one.
vec4 pigment(vec2 g, float fw) {
  float drift = u_time * 0.035;
  vec2 w1 = vec2(fbm(g * 1.35 + vec2(1.7, drift), fw * 1.35),
                 fbm(g * 1.35 + vec2(6.2, 2.4 - drift), fw * 1.35)) - 0.5;
  // The fine level rides on the coarse one instead of being added beside it, which is
  // what makes the fingers branch rather than all lean the same way.
  vec2 w2 = vec2(fbm(g * 3.4 + 2.2 * w1 + vec2(9.1, 1.4), fw * 3.4),
                 fbm(g * 3.4 + 2.2 * w1 + vec2(3.7, 8.3), fw * 3.4)) - 0.5;
  vec2 gp = g + 0.38 * w1 + 0.14 * w2;

  vec3 sum = vec3(0.0);
  float wsum = 0.0;
  float lead = 0.0;
  float second = 0.0;
  for (int i = 0; i < 7; i++) {
    float d = length(gp - gAt[i]) / G_SIG[i];
    float w = exp(-d * d);
    sum += G_COL[i] * w;
    wsum += w;
    if (w > lead) { second = lead; lead = w; } else if (w > second) { second = w; }
  }
  vec3 col = sum / max(wsum, 1e-4);

  // Where two washes meet at equal strength the pigment piles up at the drying front and
  // dries deeper. It is the one feature that reads as watercolour rather than as an
  // airbrush, and it costs a comparison in a loop that was already running.
  //
  // Deeper, not darker: the colour at a boundary is already a mixture of two stops, and
  // multiplying it down just emphasises the mud and draws grey veins across the tile.
  // Pushing it away from its own luminance instead makes the front read as more pigment.
  float meet = smoothstep(0.55, 1.0, second / max(lead, 1e-4));
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(col, clamp(mix(vec3(lum), col, 1.30) * 0.975, 0.0, 1.0), meet * 0.55);

  // Granulation, and under the glass the tooth of the paper itself. The band starts near
  // the pixel and runs five octaves past it, so at arm's length it is a whisper of texture
  // and at ten times it is what the loupe is for: the glass is looking at a patch of tile
  // three hundredths of a unit across, and this is the only thing in the icon with any
  // structure left at that size.
  float grain = fbm(gp * 90.0, fw * 90.0);

  // A wash dries in steps, not as a ramp, and each step leaves a tide line where the
  // water stopped receding. Quantising the field into a few soft levels is that edge, and
  // it is most of what separates a wash from a gradient someone warped: a warped smooth
  // field is still a smooth field. The field quantised here is the one the warp already
  // computed, so the tide lines land along the fingers rather than across them.
  float pool = w2.x + 0.5;
  float tide = (smoothstep(0.36, 0.44, pool)
              + smoothstep(0.52, 0.60, pool)
              + smoothstep(0.68, 0.76, pool)) / 3.0;
  float dens = (0.30 + 0.70 * mix(tide, smoothstep(0.30, 0.70, w1.y + 0.5), 0.35))
             * (0.80 + 0.40 * grain);
  col *= 0.90 + 0.16 * dens;

  // How thin the wash is allowed to run. Under a dark theme the backing showing through
  // is the plate rather than paper, and there is far less headroom before the icon stops
  // reading, so the thinnest patch stays heavier.
  float thinnest = mix(0.86, 0.60, u_ambient);
  float wash = mix(thinnest, 1.0, dens);

  // The outline stays a squircle, one pixel wide. Everything above is what happens inside
  // the shape; letting the noise reach the silhouette as well turns the icon into a cloud,
  // which is a different drawing. Pigment pools against the edge of a wash rather than
  // fading out at it, so the rim runs at full density however thin the middle got — which
  // is both what paint does and what keeps the shape crisp.
  float rim = sq4(g);
  wash = mix(wash, 1.0, smoothstep(0.88, 1.0, rim));

  return vec4(col, wash * coverage(rim, fw));
}

// The surface the icon lies on, flat and exactly the colour of the panel around it, so
// the drawing has no edge of its own. Nothing separates the white tile from it but the
// shadow it casts, which is how an icon is usually shown anyway.
vec3 plate() {
  return mix(vec3(0.039, 0.039, 0.043), vec3(1.0), u_ambient);
}

// What the loupe takes away from the surface under it. The barrel is opaque and casts a
// real ring of shadow; the glass in the middle passes light and concentrates it, so the
// darkest part of a magnifier's shadow is its rim and the brightest point on the table
// is directly beneath its centre.
vec3 loupeShadow(vec2 p, vec3 col) {
  vec2 sp = (p - u_lens - vec2(0.10, -0.13) * u_lensR * (0.3 + u_lift))
          / (u_lensR * (1.0 + 0.18 * u_lift));
  float sr = length(sp);
  // A penumbra that widens as the loupe leaves the surface, which is the whole of what
  // "picked up" looks like from underneath. Kept close to the glass: the icon it falls
  // on is white on a white page, so a wide cloud would be a grey shape hanging in the
  // margin with nothing visible casting it.
  float soft = mix(0.12, 0.34, u_lift);
  float body = 1.0 - smoothstep(1.0 - soft, 1.0 + soft, sr);
  float middle = 1.0 - smoothstep(0.28, 0.64, sr);
  float f = sr / mix(0.30, 0.44, u_lift);
  // Onto whatever is under it, tile or bare surface. Clipping this to the icon left the
  // shadow ending on an invisible edge, which is worse than it landing on white.
  // Faint on purpose. It only has to say the glass is off the surface when it is picked
  // up; anything heavier is a grey cloud sitting on a white page.
  return col * (1.0 - body * (1.0 - 0.74 * middle) * mix(0.055, 0.125, u_lift))
             * (1.0 + exp(-f * f) * mix(0.05, 0.04, u_lift) * vec3(1.0, 0.95, 0.86));
}

// The whole icon as a function of position. The glass calls this again along its
// refracted rays, which is why the tile's outline bends when the loupe crosses it —
// there is no flat image of the icon anywhere for it to sample instead.
vec3 scene(vec2 p, float w) {
  vec3 col = plate();

  // No drop shadow under the tile. On a surface this exact colour any shadow reads as an
  // outline drawn around the icon rather than as light, so the only shadow in the frame
  // is the one the loupe casts — which is doing a job, not decorating.
  //
  // The backing behind the wash: paper under a light theme, and under a dark one the
  // surrounding surface itself, which leaves nothing of the plate to see. A white slab
  // here is a white ring around the artwork on a dark page, and reads as a border rather
  // than as part of the icon. Flat either way — any falloff across it shows up as a
  // gradient in the margin, which is the part that should read as nothing at all.
  float tile = coverage(sq5(p / TILE), w / TILE);
  col = mix(col, mix(plate(), vec3(1.0), u_ambient), tile);

  vec4 ink = pigment(p / GRAD, w / GRAD);
  col = mix(col, ink.rgb, ink.a * tile);

  return loupeShadow(p, col);
}

// Direction-to-colour, standing in for a cubemap: one key lobe, a vertical gradient and
// a floor bounce. A few pow calls, no upload, and correct everywhere the glass curves.
// The ambient level has to follow the theme — a dark studio reflected onto glass sitting
// on a white plate draws a hard black ring around it.
vec3 env(vec3 d, vec2 light) {
  vec3 key = normalize(vec3(-0.42 + light.x * 0.35, 0.62 + light.y * 0.30, 0.66));
  float k = max(dot(d, key), 0.0);
  float spec = pow(k, 26.0);
  float wash = k * k * k;
  float sky = smoothstep(-0.75, 0.95, d.y);
  vec3 hi = mix(vec3(0.88, 0.89, 0.92), vec3(1.0), sky);
  vec3 lo = mix(vec3(0.05, 0.05, 0.07), vec3(0.16, 0.16, 0.20), sky);
  return mix(lo, hi, u_ambient) + vec3(1.0, 0.99, 0.96) * (spec * 2.6 + wash * 0.35);
}

// Normal of h(r) = t * (1 - r^2), the one profile whose tilt is exactly proportional to
// radius, which is what makes the magnification the same across the whole field.
vec3 paraboloidNormal(vec2 q, float thick) {
  return normalize(vec3(2.0 * thick * q, 1.0));
}

// Normal of the height field h(r) = t * sqrt(1 - r^k) carried into 3D. The vector is
// -h'(r) * (q/r) against 1; at k = 2 it collapses back to normalize(vec3(q, h)).
vec3 domeNormal(vec2 q, float r, float thick, float k) {
  float rr = clamp(r, 0.001, 0.9995);
  float h = sqrt(max(1e-4, 1.0 - pow(rr, k)));
  return normalize(vec3(thick * k * pow(rr, k - 1.0) / (2.0 * h) * q / rr, 1.0));
}

// Sensitivity of each channel across the sampled band. The taps are normalised against
// the summed weight, so wherever the wavelengths land on the same colour the result
// comes back exactly that colour — the fringes appear only where they land apart.
vec3 sensitivity(float t) {
  vec3 d = (vec3(t) - vec3(0.08, 0.50, 0.90)) / vec3(0.30, 0.28, 0.28);
  return exp(-d * d);
}

// What a pixel looks like once there is enough magnification to have to admit it is not a
// point: three emitters side by side and a dark gutter around the group. Snapping the
// colour to a lattice is not enough on its own — a raster of a smooth wash has neighbours
// that differ by a value or two, so quantising it changes nothing anyone can see. It is
// the structure between the cells that reads as pixels, which is also the only part of
// this a macro shot of a real screen would show.
//
// f is the position inside the cell. Below a few times magnification the stripes are
// finer than the pixel drawing them and would alias into moire, so they fade out and the
// cell goes back to the flat colour it had.
vec3 display(vec3 lit, vec2 f, float mag) {
  // Each feature appears only once it is wider than the pixel drawing it: the cell needs a
  // couple, and a third of a cell needs three times as many. Even across one element the
  // magnification falls by half from axis to rim, so this is a fade and not a switch.
  float cellShow = smoothstep(1.8, 3.2, mag);
  if (cellShow <= 0.0) return lit;
  float subShow = smoothstep(4.5, 7.0, mag);
  // The gutter is what says these are cells and not a texture, and it only has to be
  // legible to do that. Wide and dark, it stops reading as the space between pixels and
  // starts reading as a grid drawn on top of them — a hairline at the very edge of the
  // cell is the whole of the job.
  float gutter = (1.0 - smoothstep(0.40, 0.50, abs(f.x - 0.5)))
               * (1.0 - smoothstep(0.40, 0.50, abs(f.y - 0.5)));
  vec3 stripe = 1.0 - smoothstep(0.34, 0.70, abs(f.x * 3.0 - vec3(0.5, 1.5, 2.5)));
  // Three emitters, but nowhere near the contrast a real display has between them. At
  // twenty cells across an element this size, a full triad turns every pale colour into
  // saturated banding and the icon stops being an icon.
  //
  // Both are held down to well under a tenth, which is roughly where the cells stop being
  // a pattern laid over the view and become the grain of the thing being viewed. They also
  // have to stay in proportion: drop one on its own and the other takes over, and the
  // stripes take over harder because there are three of them per cell.
  vec3 emit = lit * mix(vec3(1.0), stripe * 1.6 + 0.2, subShow * 0.09);
  return mix(lit, emit * mix(0.93, 1.0, gutter), cellShow);
}

// One refracted look through a surface with normal N at the scene depth below it. Used
// for the raw glass of the rim, which is uncorrected and fringes for everything behind it.
vec3 through(vec2 base, vec3 N, float depth, float w) {
  vec3 sum = vec3(0.0);
  vec3 wsum = vec3(0.0);
  for (int i = 0; i < TAPS; i++) {
    float t = (float(i) + 0.5) / float(TAPS);
    vec3 rd = refract(vec3(0.0, 0.0, -1.0), N, 1.0 / mix(IOR_RED, IOR_VIOLET, t));
    // Ray to the plane the icon lies on. Clamped because near the rim the ray turns
    // almost horizontal and the intersection runs away to infinity; past that angle a
    // real loupe has a wall, not a view.
    vec3 s = sensitivity(t);
    sum += scene(base + rd.xy * (depth / max(-rd.z, 0.34)), w) * s;
    wsum += s;
  }
  return sum / max(wsum, vec3(1e-4));
}

// The corrected element: one ray, not fourteen. An achromat has nothing to spread, and
// the lattice below only holds together if every wavelength lands in the same cell —
// fourteen rays a few cells apart average the pixel structure into rainbow moire, which
// is what dispersion looks like when it disagrees with a grid.
//
// What comes back is the icon as it is displayed, not as it is defined: the hit is snapped
// to the cell it falls in and asked for at the width that cell covers. Magnifying a
// function would just draw it larger, which is a bigger icon rather than a closer look at
// this one; what is under the glass is a raster, and ten times over a raster is ten times
// over its pixels.
vec3 element(vec2 base, vec3 N, float depth, float w, float cell, float legible) {
  vec3 rd = refract(vec3(0.0, 0.0, -1.0), N, 2.0 / (IOR_RED + IOR_VIOLET));
  vec2 hit = base + rd.xy * (depth / max(-rd.z, 0.34));
  vec2 index = floor(hit / cell);
  return display(scene((index + 0.5) * cell, w), hit / cell - index, legible);
}

void main() {
  vec2 p = (v_uv * 2.0 - 1.0) * vec2(u_aspect, 1.0);
  // One pixel, in scene units. Taken here and passed down rather than read with fwidth()
  // inside the glass, where the refracted taps sit behind a branch and derivatives are
  // undefined.
  float w = fwidth(p.x) * 0.8;
  // One device pixel of the canvas, in scene units — the cell the glass resolves the icon
  // into. w is eight tenths of one, which is the width the coverage tests are tuned for.
  float px = w * 1.25;
  vec2 light = vec2(cos(u_time * 0.19), sin(u_time * 0.23)) * 0.4;
  placeStops();

  vec3 col = scene(p, w);

  vec2 q = (p - u_lens) / u_lensR;
  float r = length(q);
  float aa = w / u_lensR;
  vec3 V = vec3(0.0, 0.0, 1.0);
  // Held above the tile, the glass is further from what it is looking at, so it
  // magnifies harder. The same value drives the shadow, which is what ties the two
  // halves of "picked up" together.
  float depth = u_lensR * mix(0.62, 1.05, u_lift);

  // The three glass and metal bands are disjoint, so each pixel pays for at most one
  // spectral loop. Nesting the tests is the difference between the refraction costing
  // the loupe's area and costing its bounding box.
  if (r < 1.0 + aa * 2.0) {
    if (r > BARREL_OUT - aa * 2.0) {
      vec3 N = domeNormal(q, r, BEZEL_THICK, EDGE_POW);
      float fresnel = 0.04 + 0.96 * pow(1.0 - max(dot(N, V), 0.0), 5.0);
      vec3 bezel = through(p, N, depth, w) * vec3(0.97, 0.985, 1.0);
      // The Fresnel-weighted reflection IS the specular edge: at grazing angles the
      // weight goes to 1 and the rim shows nothing but environment. A rim term added on
      // top of this would be admitting the reflection is not doing its job.
      bezel = mix(bezel, env(reflect(-V, N), light), fresnel);
      col = mix(col, bezel, coverage(r, aa) * (1.0 - coverage(r / BARREL_OUT, aa / BARREL_OUT)));
    }

    if (r < BARREL_OUT + aa * 2.0) {
      // --- barrel: anodised black, the only opaque part of the assembly ---
      vec2 dir = q / max(r, 1e-4);
      float sheen = pow(max(dot(dir, normalize(vec2(-0.55, 0.72) + light * 0.3)), 0.0), 3.0);
      vec3 barrel = vec3(0.043, 0.043, 0.051) + sheen * vec3(0.15, 0.155, 0.18);
      // Turned grooves, kept shallow and faded out where the ring is too oblique to
      // resolve them — as a hard wave they alias into moire the moment the loupe moves.
      barrel *= 1.0 + 0.10 * sin(r * 210.0) * smoothstep(BARREL_IN, BARREL_OUT, r);
      // Both edges of the ring are turned metal catching the key light.
      float chamfer =
          smoothstep(BARREL_OUT - 0.040, BARREL_OUT - 0.006, r) * (1.0 - smoothstep(BARREL_OUT - 0.006, BARREL_OUT, r))
        + smoothstep(BARREL_IN - 0.014, BARREL_IN + 0.004, r) * (1.0 - smoothstep(BARREL_IN + 0.004, BARREL_IN + 0.034, r));
      barrel += vec3(0.62, 0.63, 0.68) * chamfer * (0.10 + 0.90 * sheen);
      // Engraving. An alpha texture in loupe-local uv, so the ring text never has to be
      // unwrapped into polar coordinates at the sampling site.
      barrel = mix(barrel, vec3(0.86, 0.87, 0.90), texture(u_engrave, q * 0.5 + 0.5).a * 0.85);
      col = mix(col, barrel, coverage(r / BARREL_OUT, aa / BARREL_OUT)
                           * (1.0 - coverage(r / BARREL_IN, aa / BARREL_IN)));

      // --- retaining ring: bare metal, one bright arc where it faces the key ---
      vec3 metal = vec3(0.60, 0.61, 0.65)
                 + pow(max(dot(dir, normalize(vec2(-0.5, 0.8))), 0.0), 1.6) * 0.35;
      col = mix(col, metal, coverage(r / BARREL_IN, aa / BARREL_IN)
                          * (1.0 - coverage(r / ELEMENT_R, aa / ELEMENT_R)));
    }

    if (r < ELEMENT_R + aa * 2.0) {
      // --- front element ---
      vec2 e = q / ELEMENT_R;
      float er = length(e);
      vec3 N = paraboloidNormal(e, ELEMENT_THICK);
      float fresnel = 0.04 + 0.96 * pow(1.0 - max(dot(N, V), 0.0), 5.0);
      // The working distance is solved from the magnification rather than dialled in until
      // it looked right: a cap like this magnifies 1 / (1 - P * d) on the axis, so d is
      // whatever gets the number on the barrel, and the barrel stays honest if the glass
      // is ever reshaped.
      float mag = mix(MAG_REST, MAG_LIFT, u_lift);
      float mid = 0.5 * (IOR_RED + IOR_VIOLET);
      float power = (1.0 - 1.0 / mid) * 2.0 * ELEMENT_BEND / ELEMENT_R;
      // Coated optical glass reads dark because it absorbs on the way through and
      // reflects a dim room, not because it is painted dark. The cool cast is what a
      // multicoating leaves behind.
      // What is left of the pincushion, fitted against the mapping rather than guessed,
      // and fitted low: the cost of overestimating it is moire.
      float legible = mag / (1.0 + 0.32 * er * er);
      // Shaded off the front face, refracted through the group's net bend — the two are
      // the same paraboloid at different strengths, which is what an element is.
      vec3 elem = element(p, paraboloidNormal(e, ELEMENT_BEND),
                          u_lensR * (1.0 - 1.0 / mag) / power, w, px, legible)
                * vec3(0.80, 0.83, 0.90);
      elem = mix(elem, env(reflect(-V, N), light) * vec3(0.86, 0.92, 1.0),
                 min(1.0, fresnel * 0.7 + 0.05));
      col = mix(col, elem, coverage(er, aa / ELEMENT_R));
    }
  }

  outColor = vec4(col, 1.0);
}`;

// The ring text, painted straight into loupe-local space so the shader reads it with a
// plain texture lookup instead of unwrapping a polar strip.
const ENGRAVE_TEX = 512;
const ENGRAVE_TEXT = "50MM 1:1.8 · 10X";

function paintEngraving(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = ENGRAVE_TEX;
  canvas.height = ENGRAVE_TEX;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const half = ENGRAVE_TEX / 2;
  // Mid-barrel, so the text sits between the two chamfers rather than on one of them.
  const radius = half * ((BARREL_OUT + BARREL_IN) / 2);
  const size = Math.round(half * 0.055);
  ctx.font = `600 ${size}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const chars = [...ENGRAVE_TEXT];
  const widths = chars.map((c) => ctx.measureText(c).width);
  const span = widths.reduce((a, b) => a + b, 0) / radius;
  // Centred on the lower-left of the ring, running along the arc the way it reads on the
  // reference. Text below the axis has to be flipped, or it comes out upside down.
  const start = Math.PI * 1.28 - span / 2;

  ctx.translate(half, half);
  let angle = start;
  for (let i = 0; i < chars.length; i++) {
    const step = widths[i] / radius;
    angle += step / 2;
    ctx.save();
    ctx.rotate(-angle - Math.PI / 2);
    ctx.translate(0, radius);
    ctx.fillText(chars[i], 0, 0);
    ctx.restore();
    angle += step / 2;
  }
  return canvas;
}

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

function boot(canvas: HTMLCanvasElement, onLost: () => void): (() => void) | undefined {
  const gl = canvas.getContext("webgl2", {
    antialias: false,
    alpha: false,
    failIfMajorPerformanceCaveat: true,
  });
  if (!gl) return undefined;

  const program = linkProgram(gl);
  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, "a_pos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  gl.useProgram(program);
  const uTime = gl.getUniformLocation(program, "u_time");
  const uAspect = gl.getUniformLocation(program, "u_aspect");
  const uAmbient = gl.getUniformLocation(program, "u_ambient");
  const uLens = gl.getUniformLocation(program, "u_lens");
  const uLensR = gl.getUniformLocation(program, "u_lensR");
  const uLift = gl.getUniformLocation(program, "u_lift");
  const lightScheme = window.matchMedia("(prefers-color-scheme: light)");

  const engraveTex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, engraveTex);
  // v_uv has y up; a 2D canvas has y down.
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  const uploadEngraving = () => {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, engraveTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, paintEngraving());
    gl.generateMipmap(gl.TEXTURE_2D);
  };
  uploadEngraving();
  gl.uniform1i(gl.getUniformLocation(program, "u_engrave"), 0);

  // Fourteen refracted taps, but only over the loupe — roughly four percent of the
  // canvas. Everything else is one scene() call, which is what pays for full density.
  const dpr = () => Math.min(2, window.devicePixelRatio || 1);
  let aspect = 1;
  const resize = () => {
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr()));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr()));
    aspect = w / h;
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
  };

  const lens = { ...LENS_HOME };
  const target = { ...LENS_HOME };
  const velocity = { x: 0, y: 0 };
  let lift = 0;
  let liftTarget = 0;
  let held = false;
  let grab = { x: 0, y: 0 };
  let time = 0;
  let disposed = false;
  let raf = 0;
  let last = 0;
  let lastDraw = 0;

  // Canvas point -> scene space, the coordinates the shader lays the icon out in.
  const toScene = (e: PointerEvent) => {
    const b = canvas.getBoundingClientRect();
    const ratio = b.width / Math.max(1, b.height);
    return {
      x: (((e.clientX - b.left) / b.width) * 2 - 1) * ratio,
      y: 1 - ((e.clientY - b.top) / b.height) * 2,
    };
  };

  // The loupe stays whole and on the plate: it can be dragged anywhere, but not so far
  // that half of it is off the canvas with nothing to refract.
  const clamp = (pt: { x: number; y: number }) => {
    const mx = Math.max(0, aspect - LENS_R * 0.94);
    const my = Math.max(0, 1 - LENS_R * 0.94);
    pt.x = Math.min(mx, Math.max(-mx, pt.x));
    pt.y = Math.min(my, Math.max(-my, pt.y));
  };

  const draw = () => {
    resize();
    gl.useProgram(program);
    gl.uniform1f(uTime, time);
    gl.uniform1f(uAspect, aspect);
    gl.uniform1f(uAmbient, lightScheme.matches ? 1 : 0);
    gl.uniform2f(uLens, lens.x, lens.y);
    // Lifting the loupe brings it nearer the eye, so it grows. Small, but it is the
    // difference between the glass moving and the glass being carried.
    gl.uniform1f(uLensR, LENS_R * (1 + 0.055 * lift));
    gl.uniform1f(uLift, lift);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  document.fonts?.ready.then(() => {
    if (disposed) return;
    uploadEngraving();
    draw();
  });

  const step = (dt: number) => {
    lift += (liftTarget - lift) * Math.min(1, dt * 9);

    if (held) {
      // Critically-damped-ish follow rather than a hard bind to the cursor: the glass
      // has mass, and the slight lag is the only place that shows.
      const ease = Math.min(1, dt * 22);
      velocity.x = (target.x - lens.x) / Math.max(dt, 1e-3);
      velocity.y = (target.y - lens.y) / Math.max(dt, 1e-3);
      lens.x += (target.x - lens.x) * ease;
      lens.y += (target.y - lens.y) * ease;
      return;
    }
    // Let go, it carries the throw and slides to a stop. Clamped inside the loop so a
    // hard throw settles against the edge instead of stopping dead at it.
    const drag = Math.exp(-dt * 7.5);
    velocity.x *= drag;
    velocity.y *= drag;
    lens.x += velocity.x * dt;
    lens.y += velocity.y * dt;
    clamp(lens);
  };

  const frame = (now: number) => {
    if (disposed) return;
    raf = requestAnimationFrame(frame);
    if (now - lastDraw < 1000 / FPS - 1) return;
    lastDraw = now;
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    time += dt;
    step(dt);
    draw();
  };

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };
  // Reduced motion stops the gradient drift and the light, not the interaction: dragging
  // still repaints, because that motion is the user's own.
  const start = () => {
    if (disposed || raf) return;
    if (reduced.matches || document.visibilityState !== "visible") return;
    last = performance.now();
    lastDraw = 0;
    raf = requestAnimationFrame(frame);
  };
  const sync = () => {
    if (disposed) return;
    if (reduced.matches || document.visibilityState !== "visible") {
      stop();
      draw();
      return;
    }
    start();
  };

  // Manual pump for the reduced-motion / hidden case, where there is no loop to ride.
  let manual = 0;
  const pump = () => {
    if (raf) return;
    const now = performance.now();
    step(Math.min(0.1, (now - manual) / 1000));
    manual = now;
    draw();
    if (held || Math.hypot(velocity.x, velocity.y) > 0.01 || Math.abs(liftTarget - lift) > 0.01) {
      requestAnimationFrame(pump);
    }
  };

  const hit = (pt: { x: number; y: number }) =>
    Math.hypot(pt.x - lens.x, pt.y - lens.y) <= LENS_R * 1.05;

  const down = (e: PointerEvent) => {
    const pt = toScene(e);
    if (!hit(pt)) return;
    held = true;
    liftTarget = 1;
    grab = { x: lens.x - pt.x, y: lens.y - pt.y };
    target.x = lens.x;
    target.y = lens.y;
    velocity.x = 0;
    velocity.y = 0;
    canvas.setPointerCapture(e.pointerId);
    canvas.style.cursor = "grabbing";
    manual = performance.now();
    pump();
  };

  const move = (e: PointerEvent) => {
    if (!held) {
      canvas.style.cursor = hit(toScene(e)) ? "grab" : "default";
      return;
    }
    e.preventDefault();
    const pt = toScene(e);
    target.x = pt.x + grab.x;
    target.y = pt.y + grab.y;
    clamp(target);
    pump();
  };

  const up = (e: PointerEvent) => {
    if (!held) return;
    held = false;
    liftTarget = 0;
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    canvas.style.cursor = hit(toScene(e)) ? "grab" : "default";
    pump();
  };

  const leave = () => {
    if (!held) canvas.style.cursor = "default";
  };

  const lost = (e: Event) => {
    e.preventDefault();
    disposed = true;
    stop();
    onLost();
  };

  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);
  canvas.addEventListener("pointerleave", leave);
  canvas.addEventListener("webglcontextlost", lost);
  document.addEventListener("visibilitychange", sync);
  reduced.addEventListener("change", sync);

  const observer = new ResizeObserver(() => {
    clamp(lens);
    if (!raf) draw();
  });
  observer.observe(canvas);

  draw();
  sync();

  return () => {
    disposed = true;
    stop();
    observer.disconnect();
    canvas.removeEventListener("pointerdown", down);
    canvas.removeEventListener("pointermove", move);
    canvas.removeEventListener("pointerup", up);
    canvas.removeEventListener("pointercancel", up);
    canvas.removeEventListener("pointerleave", leave);
    canvas.removeEventListener("webglcontextlost", lost);
    document.removeEventListener("visibilitychange", sync);
    reduced.removeEventListener("change", sync);
    gl.deleteBuffer(quad);
    gl.deleteTexture(engraveTex);
    gl.deleteProgram(program);
  };
}

// Where the fallback has to land: same surface, same tile, same gradient, and a loupe
// that is a stack of rings instead of a piece of glass. It keeps the icon's identity on
// every machine with hardware acceleration switched off — a browser setting, not an
// exotic state. Proportions are the shader's own constants carried over by hand.
const FallbackIcon = () => (
  <div className="absolute inset-0 grid place-items-center bg-white dark:bg-[#0a0a0a]">
    <div className="relative aspect-square h-[55%] rounded-[28%] bg-white dark:bg-transparent">
      <div
        className="absolute inset-[14.1%] rounded-[26%]"
        style={{
          background:
            "radial-gradient(58% 58% at 9% 10%, #2559e6 0%, transparent 72%)," +
            "radial-gradient(54% 54% at 57% 4%, #5cd8f5 0%, transparent 72%)," +
            "radial-gradient(52% 52% at 95% 20%, #c4e6ff 0%, transparent 72%)," +
            "radial-gradient(56% 56% at 93% 83%, #9b5aec 0%, transparent 72%)," +
            "radial-gradient(56% 56% at 53% 96%, #ef449d 0%, transparent 72%)," +
            "radial-gradient(52% 52% at 7% 73%, #f97e45 0%, transparent 72%)," +
            "#ffdde5",
        }}
      />
      <div
        className="absolute rounded-full bg-white/50"
        style={{ left: "41.4%", top: "43.4%", width: "53.2%", height: "53.2%" }}
      >
        <div className="absolute inset-[7.8%] grid place-items-center rounded-full bg-[#0b0b0d]">
          <div className="grid size-[66%] place-items-center rounded-full bg-[#c9cad0]">
            <div className="size-[89%] rounded-full bg-[#a855c8]" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const IconLens = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const teardown = canvasRef.current ? boot(canvasRef.current, () => setLive(false)) : undefined;
    if (teardown) setLive(true);
    return teardown;
  }, []);

  return (
    <div className="absolute inset-0 select-none">
      {!live && <FallbackIcon />}
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="A photo app icon with a camera loupe resting on it. Drag the loupe to magnify the icon underneath."
        className="absolute inset-0 size-full touch-none transition-opacity duration-500"
        style={{ opacity: live ? 1 : 0 }}
      />
    </div>
  );
};
