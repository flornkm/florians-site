import { useEffect, useRef, useState } from "react";

/* A small lens of glass with a white ribbon suspended inside it, and every colour you
   can see produced by dispersion rather than drawn.

   The optics are real: a surface normal, a Fresnel-weighted reflection of a procedural
   environment, and the interior sampled once per wavelength through `refract()`, each
   with its own index. The white ribbon comes back as a spectrum in the order glass puts
   it in, spreading wider toward the rim where the glass is thick — and the specular
   edge is not a rim term at all, it is the grazing reflection with Fresnel driving it
   to 1. Nothing here is a painted highlight.

   Two images of the ribbon are gathered, because a glass ball shows two: the near one
   through the front surface, and the deep one bent round the rim by the sphere's own
   magnification. */

// The drawing surface is wider than the glass, and the glass sits in the middle of it.
// That gap is the point: the line of text has to leave the body on both sides and carry
// on undistorted, or there is nothing to compare the bent copy against.
// The surface has to clear the body on every side, not just the two the text leaves
// through: the halo reaches past the outline as well, and whatever it spills onto the
// last row of pixels gets cut square by the canvas.
const MAX_WIDTH = 420;
const ASPECT_RATIO = 2.0;
// Half-extents of the glass within that surface, as a fraction of the box's own half
// width and half height. Everything the shader does happens in the space where these
// are 1, so the optics never learn that the body stopped filling the canvas.
const BODY_X = 0.457;
const BODY_Y = 0.595;
// The page behind the glass. Drawn to a canvas and handed to the shader as a texture,
// because the refraction has to sample it — a DOM node underneath would sit there
// undistorted, which is the one thing this is trying to show.
const TEXT = "Refraction through curved glass";
const TEXT_TEX_WIDTH = 768;
// The body is a superellipse, |x|^EXPO + |y|^EXPO = 1. At 2 that is the circle this
// started as; raising it flattens the sides and pulls the outline toward a rounded
// rectangle. Lives out here because the pointer hit test has to test the same shape the
// shader draws, and interpolating it into the source is cheaper than keeping two copies
// honest.
const EXPO = 2.6;
// The CSS layers underneath cannot be superellipses, so they get the elliptical corner
// that comes closest to this exponent at this aspect, and are inset onto the body's
// rectangle rather than the whole surface.
const CSS_RADIUS = "37% / 48%";
const BODY_BOX = {
  left: `${((1 - BODY_X) / 2) * 100}%`,
  right: `${((1 - BODY_X) / 2) * 100}%`,
  top: `${((1 - BODY_Y) / 2) * 100}%`,
  bottom: `${((1 - BODY_Y) / 2) * 100}%`,
  borderRadius: CSS_RADIUS,
} as const;
// The band's motion is a slow swell, but it is a long smooth gradient — 30fps shows
// its steps, and this shader is cheap enough not to need the saving.
const FPS = 60;
// One dial over every rate in here: the ribbon's own waves and the light's drift are all
// written against the same clock, so they stay in proportion to one another.
const TIME_SCALE = 1.55;

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
uniform vec2 u_light;
uniform float u_ambient; // 0 = dark surroundings, 1 = light ones
uniform sampler2D u_text; // the page behind the glass, alpha = ink coverage
out vec4 outColor;

// Glass is really about 1.51–1.53 across the visible range, which disperses far too
// little to see at this size. Exaggerating the spread is the one deliberate departure
// from physical here — everything else follows from it.
const float IOR_VIOLET = 1.66;
const float IOR_RED = 1.40;
// How far the refracted ray travels inside before it meets the emitter. Larger values
// spread the spectrum wider, because the per-wavelength directions have longer to
// diverge.
const float DEPTH = 1.75;
// The ribbon's own depth is kept short. Positioning it at the full DEPTH bends it into
// an arc that hugs the top of the glass, because the sphere's refraction magnifies
// hard the further in you look.
const float BASE_DEPTH = 0.30;
const float FAR_GAIN = 0.14;
// Nothing else here had to change for the outline: every optical term reads the shape
// through r and the normal, and both stay defined for any exponent.
const float EXPO = ${EXPO.toFixed(2)};
// Maps the drawing box onto the body: divide to enter body space, multiply to come back
// out and land on the page.
const vec2 BODY = vec2(${BODY_X.toFixed(4)}, ${BODY_Y.toFixed(4)});
// The text is not suspended in the glass the way the ribbons are — it lies on the page
// behind it, so it is sampled from further back and bends harder. Ramped across the body
// rather than constant, because the near image has a ceiling: past roughly half a unit
// the refracted rays have crossed the axis and the word comes back upside down. That
// inverted image is real and it is wanted — but at the rim, as the FAR sample below,
// not smeared across the clear middle where the upright one belongs.
const float TEXT_DEPTH_MID = 0.55;
const float TEXT_DEPTH_RIM = 1.70;
// The upside-down copy that wraps the lower rim is the same page followed all the way to
// the far surface. A real lens shows both, and the inverted one is what reads as glass.
const float TEXT_FAR_GAIN = 1.20;
// Wavelengths the page is sampled at. Far fewer than the ribbons take: a fringe on a
// legible edge reads at a fraction of the sampling a smeared emitter needs before it
// stops looking like separate stripes.
const int TEXT_TAPS = 9;
// The band runs on its own multiple of the clock. Sharing one rate with the light drift
// read as a single slow system; split, the ribbon can move at the speed it wants while
// the reflections stay calm enough not to strobe.
const float BAND_RATE = 1.6;
// The body's height, as a fraction of its own radius. At 1 this was a ball; below it the
// same outline becomes a lens, and the difference is most of what "thin glass" means —
// the middle goes quiet and all the bending piles up in the last of the radius.
const float THICK = 0.28;
// How abruptly the face rolls into the edge. At 2 the body is a squashed dome, which is
// the wrong shape for thin glass: the normal stands nearly straight up all the way out
// to the outline, leaving no steep band for the rim to reflect and almost nothing to
// bend the page through. Higher values hold the face flat and put the whole turn into
// the last of the radius, which is where both the specular and the edge distortion live.
const float EDGE_POW = 6.0;
const float GLOW_GAIN = 0.62;
// How much of the page the halo takes on a light background. Nothing on a dark one — see
// the compositing at the end of main().
const float GLOW_COVER = 0.45;
// Wavelengths the halo is taken at, and how far apart they land. What leaves the glass
// has already been through the prism, so the spill carries the band's own spectrum —
// white where every wavelength still overlaps, and opening into colour at the edges
// where only one end of it reaches.
const int SPILL_TAPS = 11;
const float SPILL_SPREAD = 0.60;

// Distance from the centre in units of "1 at the outline", which is what length() gave
// when the body was a circle. Everything downstream only ever asked for that.
float bodyNorm(vec2 p) {
  return pow(pow(abs(p.x), EXPO) + pow(abs(p.y), EXPO), 1.0 / EXPO);
}

// Normal of the height field z = sqrt(1 - r^2): the gradient of bodyNorm carried into
// 3D. Written as (|x|/r)^(EXPO-1) * r rather than the equivalent r^(2-EXPO) * |x|^(EXPO-1)
// so the ratio stays inside the unit interval — the second form asks the centre, where r
// is 0, to multiply an infinity by a zero. At EXPO = 2 it collapses to normalize(P),
// which is the sphere identity this replaced.
// Height of the face, and the z-component of its normal. The normal of a height field
// h(r) is proportional to (grad r * -h'(r) / r, 1), which rearranges to (g, -r/h'(r)) —
// so the second function is that bracket, and it is all that changes between one profile
// and another. At EDGE_POW = 2 both collapse back to the scaled dome they replaced.
float faceHeight(float r) {
  return THICK * sqrt(max(0.0, 1.0 - pow(min(r, 1.0), EDGE_POW)));
}
float faceNormalZ(float r) {
  // Clamped low: the face is flat at the centre, so this diverges there, and a normal of
  // (0, 0, huge) normalises to straight up either way.
  float rr = clamp(r, 0.02, 1.0);
  return (2.0 / (THICK * EDGE_POW)) * pow(rr, 2.0 - EDGE_POW)
       * sqrt(max(0.0, 1.0 - pow(rr, EDGE_POW)));
}

vec3 bodyNormal(vec2 p, float r, float z) {
  float rr = max(r, 1e-4);
  vec2 g = vec2(pow(abs(p.x) / rr, EXPO - 1.0) * sign(p.x),
                pow(abs(p.y) / rr, EXPO - 1.0) * sign(p.y)) * rr;
  return normalize(vec3(g, z));
}

// The loops below step uniformly across the SPREAD and ask this what colour arrives
// there. That is the way round it has to be: stepping uniformly through hue instead
// leaves the taps unevenly spaced in position, and wherever they spread past the ribbon's
// own width they stop being a spectrum and start being stripes.
//
// The curve is the point. A straight map gives every hue an equal band, and a spectrum
// does not look like that — violet and blue are a thin edge on a real one, while orange
// and red take up most of the width.
float hueAt(float v) {
  return pow(v, 1.0 / 2.20);
}

// Rolls a colour into range by its own peak instead of letting each channel clip on its
// own. Clipping per channel is what bleached the middle of the band: green sits where
// the ribbon is brightest, so its channel pinned to 1 while the others were still
// climbing, and the hue disappeared into white well before the light did. Scaling the
// whole colour by one factor keeps the ratios exactly, so a bright green goes pale green
// on its way to white rather than snapping there.
// Pushes a colour away from its own luminance, gently. The spectral sum divides through
// by the summed sensitivity, so anywhere the wavelengths still overlap comes back nearer
// grey than the light there actually is, and this is the counterweight.
//
// Kept small on purpose. Pushed hard it drives the weakest channel to zero, and a colour
// with a channel at zero is pigment, not light — vivid, but darker than what it replaced
// and quite unlike anything glowing. Brightness has to come from the gain and from the
// strands adding where they overlap; this only leans the hue.
vec3 saturated(vec3 c, float k) {
  return max(vec3(0.0), mix(vec3(dot(c, vec3(0.2126, 0.7152, 0.0722))), c, k));
}

vec3 shoulder(vec3 c) {
  float m = max(max(c.r, c.g), c.b);
  // A knee, not a global curve. Compressing the whole range — which is what a plain
  // Reinhard does — halves everything in the middle, and the middle is exactly where the
  // saturated colour lives; the band came back muted rather than bleached. Below the
  // knee nothing is touched at all.
  const float KNEE = 0.86;
  if (m <= KNEE) return c;
  float t = KNEE + (1.0 - KNEE) * (1.0 - exp(-(m - KNEE) / (1.0 - KNEE)));
  return c * (t / m);
}

// Sensitivity curve: the colour the eye assigns to a single wavelength, violet (0) to
// red (1). Stands in for the CIE curves, which are more than this needs.
vec3 wavelength(float u) {
  vec3 c = mix(vec3(0.64, 0.56, 0.98), vec3(0.32, 0.50, 1.00), smoothstep(0.00, 0.20, u));
  c = mix(c, vec3(0.24, 0.86, 0.96), smoothstep(0.16, 0.38, u));
  c = mix(c, vec3(0.44, 0.92, 0.32), smoothstep(0.32, 0.52, u));
  c = mix(c, vec3(0.94, 0.90, 0.20), smoothstep(0.48, 0.66, u));
  c = mix(c, vec3(1.00, 0.50, 0.10), smoothstep(0.62, 0.82, u));
  c = mix(c, vec3(0.98, 0.13, 0.09), smoothstep(0.78, 1.00, u));
  return c;
}

// The environment the sphere reflects: one large soft key, a dim cool gradient, and a
// bounce from below. Everything the edge does is a reflection of this — there is no rim
// term anywhere in this shader.
// The dim half of the surroundings: the gradient the studio itself stands in. This is
// what the crown's tint absorbs — a piece of glass dark enough to hide a room hides
// exactly this much of it.
vec3 envAmbient(vec3 d, float ambient) {
  float up = smoothstep(-0.65, 0.95, d.y);
  // The surroundings track the page. Reflecting a dark studio while sitting on a light
  // background puts a hard black ring round the glass, because at grazing angles the
  // edge shows nothing but this.
  return mix(mix(vec3(0.004, 0.005, 0.008), vec3(0.055, 0.064, 0.086), up),
             mix(vec3(0.40, 0.43, 0.50), vec3(0.88, 0.91, 0.96), up),
             ambient);
}

// The bright half: the key, its falloff across the surface, the floor bounce, and the
// source behind. A tint dark enough to swallow the room does NOT swallow these — a
// polished black surface still shows what is genuinely bright in front of it, and that
// reflection is the whole difference between the crown reading as glass and reading as
// a hole cut in the page.
vec3 envSources(vec3 d, vec2 lightPos, float ambient) {
  vec3 key = normalize(vec3(lightPos.x * 0.55 - 0.30, lightPos.y * 0.35 + 0.72, 0.46));
  float k = max(dot(d, key), 0.0);
  vec3 c = vec3(1.00, 0.98, 0.95) * pow(k, 26.0) * 3.4; // the softbox itself
  c += vec3(0.62, 0.70, 0.92) * pow(k, 3.5) * 0.30;     // its falloff across the surface
  float fill = max(dot(d, normalize(vec3(0.52, -0.66, 0.54))), 0.0);
  c += vec3(0.32, 0.46, 0.86) * pow(fill, 7.0) * 0.75;  // cool bounce off the floor

  // A source BEHIND the glass, which is the one thing the edge can see. At grazing
  // angles the reflected ray turns back past the body, so nothing standing in front of
  // it ever reaches the outline — leave this out and the rim reflects the dark studio
  // and the shape ends in a smudge. Steep exponent on purpose: only the last couple of
  // percent of the radius turns d that far, so it lands as a line and not a halo.
  float back = max(-d.z, 0.0);
  // Uneven around the shape rather than a traced outline. A ring of even brightness
  // reads as a stroke applied to the silhouette; this is a light with a position, so the
  // lower edge carries it and the top falls away.
  float sweep = 0.42 + 0.58 * smoothstep(-0.85, 0.55, -d.y + d.x * 0.30);
  c += vec3(0.80, 0.87, 1.00) * pow(back, 30.0) * sweep * mix(2.30, 1.50, ambient);
  // And a hot core inside that bloom. One exponent gives either a soft edge or a hard
  // one; a specular is both — a thin bright line with a wider falloff around it, which
  // is what a real source reflected off a surface that steep actually looks like.
  c += vec3(1.00, 1.00, 1.00) * pow(back, 150.0) * mix(3.00, 2.00, ambient);
  return c;
}

vec3 env(vec3 d, vec2 lightPos, float ambient) {
  d = normalize(d);
  return envAmbient(d, ambient) + envSources(d, lightPos, ambient);
}

// A third of a turn.
const float TWIST = 2.0943951;

// Where the twist has got to at a given point along the cord.
float twistPhase(float x, float t) {
  return x * 1.15 - t * 0.80;
}

// The three ribbon centre lines at a given x. Hoisted out of the wavelength loop below
// because the wedge displaces the sampling point almost purely vertically — x barely
// moves between wavelengths, so these would be recomputed identically 44 times.
//
// One twist sampled at three points a third of a turn apart, NOT three waves of their
// own. Separate waves with fixed offsets between them can never cross: whichever starts
// on top stays on top, and the result reads as one movement copied three times rather
// than as something rotating around itself. Sharing a phase and differing only in where
// they sit on it is what a cord is — the strands cross, swap order, and come back, and
// those crossings are the twist.
vec3 centres(float x, float t, float lightY) {
  // Just above the middle. Sitting low, the band ran along the boundary between the dark
  // crown and the clear glass, so it read as the edge of the tint rather than as
  // something suspended inside — and it left no clear glass under it for the page to
  // come through.
  float b = 0.02 + lightY * 0.05;
  float ph = twistPhase(x, t);
  // A slow wander of the whole bundle, so the cord drifts through the glass instead of
  // spinning on the spot.
  float drift = sin(x * 0.62 + t * 0.23) * 0.058 + sin(x * 1.40 - t * 0.17) * 0.022;
  // Small enough that the three read as one cord rather than three threads sharing a
  // frame. It only has to exceed the strand width for the crossings to be legible.
  return b + drift + sin(vec3(ph, ph + TWIST, ph + 2.0 * TWIST)) * 0.125;
}

// Where each strand is in the twist, -1 at the back and +1 at the front. This is the
// depth the strands are sorted by below, and it is what lets one pass in front of
// another instead of the three of them simply adding up.
vec3 twistDepth(float x, float t) {
  float ph = twistPhase(x, t);
  return cos(vec3(ph, ph + TWIST, ph + 2.0 * TWIST));
}

// How much of each strand is turned toward you. The one on the near side of the twist
// reads brighter and fuller; without it the strands still cross, but nothing says which
// way round they went and the rotation stays ambiguous.
vec3 twistFacing(float x, float t) {
  return 0.58 + 0.42 * twistDepth(x, t);
}

// Three emissive ribbons suspended inside the glass, each on its own travelling wave so
// they weave across one another rather than reading as a single line. White — every
// colour in the final image comes out of dispersion, not out of these. The exponent
// keeps their edges crisp; a plain gaussian has tails long enough that, once each is
// smeared across a spectrum, they overlap into a soft wash. Steep here, because the
// spectral sum below is itself a wide vertical blur and whatever softness these arrive
// with is added to it.
float ribbons(float y, vec3 cy, float w, vec3 facing) {
  return facing.x * exp(-pow(abs((y - cy.x) / w), 3.6))
       + facing.y * exp(-pow(abs((y - cy.y) / (w * 0.92)), 3.6))
       + facing.z * exp(-pow(abs((y - cy.z) / (w * 0.84)), 3.6));
}

// Everything about a ribbon set that depends only on x, so it too leaves the loop.
// x: half-width after taper, y: falloff along the length.
vec2 profile(float x) {
  // The cord is a compact bundle in the middle of the glass, not a band drawn across it.
  // Both lengths are keyed to a span well inside the body: the thickness taper closes the
  // strands to a point at about two thirds of the half-width, and the falloff has them
  // gone before that. That is what keeps colour off the sides, and what makes the bundle
  // read as a rounded lens rather than a streak with tails running out to the rim.
  return vec2(0.084 * pow(clamp(1.0 - pow(x / 0.62, 2.0), 0.0, 1.0), 0.55),
              exp(-pow(abs(x) / 0.34, 2.4)));
}

// Each strand's own place in the spectrum: a warm one, a cool one, and a pale one. This
// is the part that stopped being derived. Dispersing a single white emitter gives a full
// rainbow stacked top to bottom, and stacked is exactly what it looks like — every column
// showing the whole spectrum in order, which reads as a gradient however finely it is
// sampled. Distinct ribbons that cross one another cannot come out of that, so the colour
// now lives on the strands and the glass only bends and fringes it.
const vec3 STRAND_HUE = vec3(0.82, 0.22, 0.08);
// How far each strand's hue travels across its own width. The warm one is given a long
// sweep because it has to carry three of the reference's colours on its own — red along
// its top edge through orange into yellow. The cool one is kept short deliberately: let
// it run as far as the warm one does and its upper edge reaches green, and green is the
// one colour the reference does not have. That green was two strands meeting in the
// middle of the spectrum, not a strand of its own.
const vec3 STRAND_SWEEP = vec3(0.20, 0.10, 0.09);

// Levels a spectral colour to a common brightness. The wavelengths are nowhere near equal
// in luminance — a saturated red carries about a third the light of a cyan at the same
// intensity — so a cord built straight out of wavelength() has one strand that reads
// bright and another that reads muddy brown, whatever the gain is set to. Measured on the
// last round: the warm strand came back at (111,82,63) while the cool one hit (180,227,255)
// in the same frame. Dividing each by its own luminance is what makes them read as three
// strands of one light rather than one bright and two dim.
vec3 leveled(vec3 c) {
  return c / max(dot(c, vec3(0.2126, 0.7152, 0.0722)), 0.10);
}

// The cord at a point, resolved front to back. Premultiplied colour in rgb, coverage in a.
vec4 cord(float x, float y, float t, float lightY) {
  vec3 cy = centres(x, t, lightY);
  vec3 dep = twistDepth(x, t);
  vec2 prof = profile(x);
  // Not one width for the three. The warm strand has to carry red through orange into
  // yellow across its own face, and a strand as narrow as the other two has no room to
  // show that — it arrives as a single colour with a fringe.
  vec3 w = max(prof.x, 1e-4) * vec3(1.35, 0.86, 0.62);
  vec3 d = (vec3(y) - cy) / w;

  // A hard shoulder, not a gaussian. An edge you can follow along its length is the whole
  // difference between a ribbon and a smear, and it is what the crossings need to read.
  vec3 a = exp(-pow(abs(d), vec3(4.5))) * prof.y;

  // Hue sweeping across each strand's own width, so the warm one runs red along its upper
  // edge into yellow at the lower — the fringe a real ribbon of light has, rather than a
  // flat fill.
  vec3 h = STRAND_HUE + d * STRAND_SWEEP;
  vec3 c0 = leveled(wavelength(clamp(h.x, 0.0, 1.0))) * 0.46;
  vec3 c1 = leveled(wavelength(clamp(h.y, 0.0, 1.0))) * 0.46;
  // The third is the pale one the reference shows below the other two, not a colour in
  // its own right.
  vec3 c2 = mix(vec3(1.0), leveled(wavelength(clamp(h.z, 0.0, 1.0))) * 0.46, 0.34) * 0.17;

  // Whatever is nearer covers what is behind it. step() on the depths rather than a sort:
  // with three strands the occlusion is just the product of the ones in front.
  vec3 occ = vec3(
    (1.0 - a.y * step(dep.x, dep.y)) * (1.0 - a.z * step(dep.x, dep.z)),
    (1.0 - a.x * step(dep.y, dep.x)) * (1.0 - a.z * step(dep.y, dep.z)),
    (1.0 - a.x * step(dep.z, dep.x)) * (1.0 - a.y * step(dep.z, dep.y))
  );
  vec3 lit = 0.52 + 0.48 * dep;
  vec3 k = a * occ * lit;
  return vec4(c0 * k.x + c1 * k.y + c2 * k.z, dot(a * occ, vec3(1.0)));
}

// Light does not stop at the outline. The band is an emitter inside a body that is clear
// at the bottom and the sides, so some of it leaves — and on a dark page that spill is
// most of what makes the glass look lit from within rather than printed on top of it.
vec3 spill(vec2 p, float r, float t, float lightY) {
  // Outside points read the band at the nearest place on the outline, which is where the
  // light reaching them actually left the glass.
  vec2 q = p / max(r, 1.0);
  vec3 cy = centres(q.x, t, lightY);
  vec3 fac = twistFacing(q.x, t);
  float beyond = max(r - 1.0, 0.0);
  float fall = exp(-pow(beyond / 0.25, 1.5)) * exp(-pow(abs(q.x) / 0.70, 2.0));
  // Eleven taps of three gaussians each, on every pixel of a box the body only half
  // fills. Most of the outside contributes nothing, and this is what keeps it from being
  // paid for.
  if (fall < 0.004) return vec3(0.0);
  // The wavelengths keep diverging after they leave, so the further out a point is the
  // further apart they land on it. Which is why the halo is close to white against the
  // body and comes apart into colour at its outer reach.
  float spread = SPILL_SPREAD * (0.42 + beyond * 2.4);
  vec3 sum = vec3(0.0);
  vec3 weight = vec3(0.0);
  for (int i = 0; i < SPILL_TAPS; i++) {
    float v = (float(i) + 0.5) / float(SPILL_TAPS);
    vec3 w = wavelength(hueAt(v));
    // Far wider than the real ribbons: a halo is a blur, and a single pass with no
    // neighbours to average has to stand one in.
    sum += w * ribbons(q.y + (v - 0.5) * spread, cy, 0.26, fac);
    weight += w;
  }
  // Same normalisation the interior uses, and for the same reason — divided through by
  // the summed response, light that still has all its wavelengths comes back white
  // instead of taking on the average colour of the sampling curve.
  return (sum / max(weight, vec3(1e-4))) * fall;
}

// Lays the halo over whatever has already been worked out at this pixel. On a dark page
// it is light added to nothing and stays purely additive, which is what a glow is. On a
// light one added light has nowhere to go — white plus a colour is white — so it has to
// take a little of the page and put its own colour back instead, the same bargain the
// band strikes inside the body. Without this the halo simply did not exist on light.
vec4 halo(vec3 glow, vec3 rgb, float a, float ambient) {
  float peak = max(max(glow.r, glow.g), glow.b);
  // Curved, not linear. A halo whose coverage tracks its brightness one-for-one is a
  // pale wash everywhere it is not already bright, which reads as haze rather than light.
  float cover = pow(clamp(peak, 0.0, 1.0), 0.60) * GLOW_COVER * ambient;
  vec3 hue = glow / max(peak, 1e-4);
  vec3 c = hue * cover + (1.0 - cover) * rgb + glow * (1.0 - ambient);
  // A gradient this long steps visibly at 8 bits however finely the spectrum itself is
  // sampled. Half a level of noise costs nothing and takes the rings out.
  c += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  return vec4(clamp(c, 0.0, 1.0), clamp(cover + (1.0 - cover) * a, 0.0, 1.0));
}

void main() {
  vec2 p = (v_uv * 2.0 - 1.0) / BODY;
  float r = bodyNorm(p);
  float aa = fwidth(r) * 1.2;
  float mask = 1.0 - smoothstep(1.0 - aa, 1.0, r);

  // The text stored white, tinted here, so one texture serves both themes.
  vec3 ink = mix(vec3(0.74, 0.76, 0.80), vec3(0.11, 0.12, 0.14), u_ambient);
  // The page as it is where nothing bends it, which is everywhere outside the body.
  float plain = texture(u_text, v_uv).a;
  float t = u_time * BAND_RATE;
  vec3 glow = shoulder(saturated(spill(p, r, t, u_light.y), 1.20) * GLOW_GAIN);
  // Alpha stays at the page's own coverage: a halo is light ADDED to what is behind it,
  // never something standing in front.
  if (mask <= 0.0) { outColor = halo(glow, ink * plain, plain, u_ambient); return; }

  // Two different questions, deliberately answered by two different curves. Everything
  // asking how much glass a ray crossed wants a plain radial depth — that is what the
  // rim bands and the absorption are keyed to. Only the surface itself wants the real
  // profile, which is flat across the face and turns hard at the bevel.
  float zu = sqrt(max(0.0, 1.0 - min(r * r, 1.0)));
  float z = faceHeight(r);
  vec3 P = vec3(p, z);              // the point on the surface
  vec3 N = bodyNormal(p, r, faceNormalZ(r));
  vec3 V = normalize(vec3(0.0, 0.0, 3.4) - P); // mild perspective, so the rim turns away

  // Refraction, one wavelength at a time. Each gets its own index, so each bends by a
  // different amount and lands somewhere else on the emitter — which is the whole
  // rainbow, produced rather than painted.
  float iorMid = 0.5 * (IOR_VIOLET + IOR_RED);
  // Where the ribbon appears: straight sphere refraction, which is also what compresses
  // it toward the rim the way a real ball squeezes what is behind it.
  vec2 base = (P + refract(-V, N, 1.0 / iorMid) * BASE_DEPTH).xy;
  // The same ribbon again, but followed all the way to the far surface. A glass ball
  // shows two images of what is inside it, and this deep one is the arc that wraps the
  // rim — the sphere's own magnification bending it round the edge.
  vec2 farBase = (P + refract(-V, N, 1.0 / iorMid) * DEPTH).xy;
  // The page, on the same near path but further back. Sampled once at the mid
  // wavelength: the text is white and the dispersion at this depth is under a pixel, so
  // taking it through the spectral loop would cost 28 fetches to fringe nothing.

  // How much of the far surface a given point is looking through. Shared, because the
  // deep image of the page wraps the rim for exactly the reason the deep cord does, and
  // it keeps that second image a band round the rim instead of flooding the middle where
  // the near one belongs.
  float rim = smoothstep(0.34, 0.90, 1.0 - zu);
  float farWeight = FAR_GAIN * rim;

  vec4 nearCord = cord(base.x, base.y, t, u_light.y);
  vec4 farCord = cord(farBase.x, farBase.y, t, u_light.y);

  // A soft pool of light low in the glass, behind the cord. It is doing real work: it is
  // what the ribbons read as sitting in front of, and it is where the colour goes once
  // the cord has tapered out — without it the lower half is bare glass and the cord
  // floats in the middle of nothing.
  vec2 pp = vec2(base.x * 2.2, (base.y + 0.50) * 3.4);
  float pool = exp(-pow(dot(pp, pp), 1.1) * 3.4)
             * (0.78 + 0.22 * sin(base.x * 1.1 + t * 0.31));
  float poolLevel = pool * mix(0.20, 0.22, u_ambient);
  vec3 inside = nearCord.rgb + farCord.rgb * farWeight + vec3(0.94, 0.96, 1.00) * poolLevel;

  // Reflection off the outer surface, weighted by Fresnel. At the rim the exponent
  // drives this to 1 and the sphere shows nothing but environment — that grazing
  // reflection *is* the specular edge, rather than a rim light standing in for one.
  vec3 mirror = normalize(reflect(-V, N));
  vec3 reflAmbient = envAmbient(mirror, u_ambient);
  vec3 reflSources = envSources(mirror, u_light, u_ambient);
  vec3 reflected = reflAmbient + reflSources;
  float fres = 0.04 + 0.96 * pow(1.0 - max(dot(N, V), 0.0), 5.0);

  // No punctual specular lobe. The key light is already in the environment, and a
  // second, tighter copy of it lands as a hard white dot sitting on the surface.

  // Output is what the glass ADDS to whatever is behind it, plus how much of that
  // background it blocks — premultiplied source-over, so the page shows through the
  // clear middle and only the reflective rim goes properly opaque.
  // Clear glass over a bright page barely darkens it, so both how much the body blocks
  // and what it puts back have to follow the surroundings. Blocking a white page and
  // adding a near-black tint back — the same numbers that read as smoked glass on a
  // dark page — turns the body into a flat grey pebble on a light one.
  // Thinner glass takes less out of what passes through it. On a light page this is the
  // whole difference between a sheet and a milky pebble, so it is cut hardest there.
  float absorb = (0.07 + 0.20 * (1.0 - zu)) * mix(1.0, 0.95, u_ambient);
  // The spectrum is light being added, so it needs something dark to land on. That is
  // what the crown below provides on a light page — with it there, the gain can stay
  // high in both themes. Lowering it for light mode (which is what a bare white page
  // needs, to stop every hue clipping) leaves the colours flat once the crown exists.
  // Brighter on a light page. Emission on black needs no help; on white it is competing
  // with the page for the same range and starts out looking washed.
  vec3 spectrum = shoulder(saturated(inside, mix(1.46, 1.48, u_ambient)) * mix(1.75, 2.35, u_ambient));

  // What the light blocks, which is much less than what it emits. Two things follow from
  // that. It is taken from the CORD's own coverage rather than from the summed colour, so
  // the pool behind it adds light without ever standing in the way — a broad soft glow
  // that also blocks is exactly what fog is. And on a dark page it barely blocks at all:
  // emission does not need to displace anything to be seen there, so the glass stays
  // transparent and the page keeps reading straight through the light. Only a light page
  // forces the trade, because white plus a colour is white and the light has nowhere to
  // go unless it takes some of the page with it.
  // The pool carries coverage too. Left as pure addition it was light poured onto an
  // already-bright page with nowhere to go: the lower body measured BRIGHTER than the
  // page behind it, which is why that half kept blowing out however much the glass was
  // tinted. Light in the glass has to displace what is behind it, exactly as the cord
  // does — the only difference is how much of it there is.
  float cordCover = clamp(nearCord.a + farCord.a * farWeight + poolLevel * 1.7, 0.0, 1.0)
                  * clamp(max(max(spectrum.r, spectrum.g), spectrum.b), 0.0, 1.0);
  float alpha = clamp(absorb + fres * 0.92 + pow(cordCover, mix(1.0, 0.62, u_ambient)) * mix(0.14, 1.35, u_ambient),
                      0.0, 1.0);

  // Darker than the page it blocks, which is the difference between a tint and a haze.
  // At 0.88 the glass put back almost exactly what it took, so the lower half came out
  // indistinguishable from bare page — a hole rather than something you are looking
  // through. Raising the absorption alone cannot fix that; what it gives back has to be
  // darker than what it stops.
  vec3 bodyTint = mix(vec3(0.020, 0.024, 0.034), vec3(0.60, 0.65, 0.76), u_ambient);
  // Where the spectrum is strong it displaces the body rather than adding to it. On a
  // light page the two summed just clip to white, which is why the colours looked
  // bleached there while reading fine against black.
  float band = clamp(dot(inside, vec3(0.33)) * 1.7, 0.0, 1.0);

  // A graduated tint in the glass itself, densest at the crown and gone by the middle.
  // It blocks more of what is behind and gives back less, so the top goes dark on any
  // background. Deliberately applied to the body and its reflection only — the two
  // spectral images pass through it, or the arc wrapping the upper rim would be the
  // first thing it erased.
  // On a light page this has to go nearly opaque black, not translucent grey — the
  // reference's crown is properly dark and the colours emerge out of it. A partial
  // tint over white just reads as haze.
  // Reaches down past the band, not just over the top of the glass. The spectrum is
  // added light and needs something dark under it; leaving the crown above the band
  // puts the band back onto white and flattens it.
  // The upper bound sits past the top of the body on purpose. Ending it inside — at
  // 0.42, which is barely half way up — meant everything above that clamped to 1 and the
  // tint stopped being a gradient and became a flat cap with a hard lower edge. Still
  // climbing where the glass runs out is what keeps it reading as depth of tint rather
  // than as a painted shape.
  float crown = smoothstep(-0.60, 1.12, p.y);
  vec3 body = bodyTint * absorb * (1.0 - 0.88 * band) * mix(1.0, 0.05, crown);
  // Short of opaque now, in both themes. Driven to 1 the crown stopped being tinted
  // glass and became a painted cap, which is the other half of why the body read thick.
  // Raised to pay for the softer ramp: the top of the body no longer reaches a crown of
  // 1, so the coefficient has to make up the density it used to get for free.
  alpha = clamp(alpha + crown * mix(0.76, 1.15, u_ambient), 0.0, 1.0);

  // Lower than it was. In the middle of the glass the band sits over far more of the
  // dark crown than it did down at the rim, and the old gain clipped its core to white
  // there — a rainbow with a bleached stripe through it.
  // Two different things happen to a reflection under the crown. The room behind it is
  // absorbed almost entirely, which is what makes the top black. The sources are not:
  // the face is glossy and nearly flat, so it holds a broad soft sheen of the key across
  // the whole crown, and that sheen is what says the black is a surface.
  vec3 emit = spectrum
            + (reflAmbient * mix(1.0, 0.16, crown) + reflSources * mix(1.0, 0.92, crown))
            // Floored rather than left to Fresnel alone. The face is so nearly flat that
            // fres sits at its 0.04 normal-incidence value across all of it, and a
            // reflection that weak is not a sheen, it is nothing.
              * max(fres, mix(0.10, 0.05, u_ambient))
            + body;

  // The page goes UNDER the glass, not over it: source-over with the text as the
  // destination. Which means 1 - alpha is already the transmission, and the crown
  // hides the text at the top for the same reason it hides everything else — no second
  // falloff had to be invented to put the text behind anything.
  // A band, not a ramp. Run all the way to the outline and the inverted word arrives
  // where the glass has already gone opaque and 1 - alpha has nothing left to let it
  // through; it has to land just inside the rim, in the last of the clear glass.
  float thick = 1.0 - zu;
  float textRim = smoothstep(0.38, 0.64, thick) * (1.0 - smoothstep(0.78, 0.95, thick));
  float textDepth = mix(TEXT_DEPTH_MID, TEXT_DEPTH_RIM, smoothstep(0.25, 1.0, r));

  // The page, taken one wavelength at a time like everything else in here. Sampled at a
  // single index it came back a grey word with a clean edge, which is the one thing
  // glass never does to what it bends — the fringe IS the bend, so it opens up exactly
  // where the distortion does, at the rim and around the inverted copy, and stays shut
  // through the flat middle where the word has to stay readable.
  vec3 pageSum = vec3(0.0);
  vec3 pageWeight = vec3(0.0);
  for (int i = 0; i < TEXT_TAPS; i++) {
    float v = (float(i) + 0.5) / float(TEXT_TAPS);
    vec3 w = wavelength(hueAt(v));
    vec3 dir = refract(-V, N, 1.0 / mix(IOR_VIOLET, IOR_RED, v));
    float near = texture(u_text, (P + dir * textDepth).xy * BODY * 0.5 + 0.5).a;
    float deep = texture(u_text, (P + dir * DEPTH).xy * BODY * 0.5 + 0.5).a;
    pageSum += w * (near + deep * textRim * TEXT_FAR_GAIN);
    pageWeight += w;
  }
  vec3 behind = clamp(pageSum / max(pageWeight, vec3(1e-4)), 0.0, 1.0);
  float behindA = dot(behind, vec3(1.0 / 3.0));

  // Source-over with the page as the destination, which is why 1 - alpha is already the
  // transmission and the opaque crown hides the text without a second falloff invented
  // for it. The catch is that the three channels now have three different coverages and
  // the canvas composites through one — so the difference is paid out here, against what
  // the page behind is assumed to be. Exact when that assumption holds, and the theme is
  // the only thing it depends on.
  vec3 backdrop = mix(vec3(0.045, 0.047, 0.055), vec3(0.96, 0.96, 0.97), u_ambient);
  emit += (1.0 - alpha) * (ink * behind + (behindA - behind) * backdrop);
  alpha = 1.0 - (1.0 - alpha) * (1.0 - behindA);

  // The wall of the glass, seen edge-on. At the last few percent the ray path through
  // it is long enough to carry almost nothing out, which is a thin dark seam — and it
  // is the only thing giving the shape a defined edge on a light page, where the body
  // otherwise just fades into it. Sits outside the Fresnel highlight rather than over
  // it, so the bright reflected edge survives underneath.
  float seam = smoothstep(0.988, 1.0, r) * mix(0.80, 0.28, u_ambient);
  emit = mix(emit, emit * 0.42, seam);
  alpha = mix(alpha, max(alpha, 0.82), seam);

  // The halo goes on after the outline is resolved, not into emit — inside the body it
  // would be multiplied away by the mask at exactly the edge it has to cross.
  vec3 rgb = clamp(emit, 0.0, 1.0) * mask + ink * plain * (1.0 - mask);
  // Less bloom inside the body on a light page. There the glass is mostly clear and the
  // page reads straight through it, so the same bleed that makes the dark one glow just
  // hazes over the text underneath.
  outColor = halo(glow * mix(mix(0.16, 0.07, u_ambient), 1.0, 1.0 - mask), rgb,
                  alpha * mask + plain * (1.0 - mask), u_ambient);
}`;

// White ink on nothing: only the alpha channel is read, and the shader tints it per
// theme. Baked at a fixed size rather than at device density — it is sampled through a
// lens that magnifies unevenly, so matching the canvas would not have made it sharper
// where it actually matters.
function paintText(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = TEXT_TEX_WIDTH;
  // Same aspect as the surface it stands in for, so a texture lookup is a straight
  // reading of position and nothing has to be un-stretched at the sampling site.
  canvas.height = Math.round(TEXT_TEX_WIDTH / ASPECT_RATIO);
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const font = (size: number) =>
    `500 ${size}px Pretendard, ui-sans-serif, system-ui, -apple-system, sans-serif`;
  // Fitted to a target width rather than set as a size: the line has to overhang the
  // body by a visible margin at both ends, and that margin is what the whole figure is
  // for — undistorted text running into glass and coming out bent.
  let size = Math.round(canvas.height * 0.32);
  ctx.font = font(size);
  // Well past BODY_X, and still clear of the canvas edge: the refracted lookups run
  // outside the sampled rectangle near the rim, and CLAMP_TO_EDGE would smear the last
  // column of ink along it.
  const target = canvas.width * 0.86;
  size = Math.floor(size * (target / ctx.measureText(TEXT).width));
  ctx.font = font(size);

  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // Low in the frame, in the clear glass under the band. Higher up the crown swallows
  // it, which is true to a lens but leaves nothing to look at.
  // Held at a fixed height within the BODY rather than within the canvas, so changing
  // the margin around the glass does not slide the line down its face.
  ctx.fillText(TEXT, canvas.width / 2, canvas.height * (0.5 + BODY_Y * 0.225));
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
    alpha: true,
    premultipliedAlpha: true,
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
  const uLight = gl.getUniformLocation(program, "u_light");
  const uAmbient = gl.getUniformLocation(program, "u_ambient");
  const lightScheme = window.matchMedia("(prefers-color-scheme: light)");

  const textTex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textTex);
  // v_uv has y up; a 2D canvas has y down.
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  // The deep image squeezes the whole page into a few pixels at the rim. Without
  // mipmaps that copy is point-sampled and crawls as the light moves.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  const uploadText = () => {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, paintText());
    gl.generateMipmap(gl.TEXTURE_2D);
  };
  uploadText();
  gl.uniform1i(gl.getUniformLocation(program, "u_text"), 0);

  // One gaussian and a handful of smoothsteps per pixel: cheap enough to render at the
  // display's real density, where capping would just soften a very clean edge.
  const dpr = () => Math.min(3, window.devicePixelRatio || 1);
  const resize = () => {
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr()));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr()));
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
  };

  const light = { x: -0.35, y: 0.0 };
  const target = { x: -0.35, y: 0.0 };
  let tracking = false;
  let time = 6;
  let disposed = false;
  let raf = 0;
  let last = 0;
  let lastDraw = 0;

  const draw = () => {
    resize();
    gl.useProgram(program);
    gl.uniform1f(uTime, time);
    gl.uniform2f(uLight, light.x, light.y);
    gl.uniform1f(uAmbient, lightScheme.matches ? 1 : 0);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  // Canvas 2D takes whatever face is loaded at fillText time, so the first bake is the
  // fallback. One repaint after the webfont lands, and only if the demo is still alive.
  document.fonts?.ready.then(() => {
    if (disposed) return;
    uploadText();
    draw();
  });

  const frame = (now: number) => {
    if (disposed) return;
    raf = requestAnimationFrame(frame);
    if (now - lastDraw < 1000 / FPS - 1) return;
    lastDraw = now;

    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    time += dt * TIME_SCALE;

    if (!tracking) {
      target.x = -0.35 + Math.cos(time * 0.21) * 0.4;
      target.y = Math.sin(time * 0.17) * 0.35;
    }
    const ease = Math.min(1, dt * (tracking ? 6 : 1.8));
    light.x += (target.x - light.x) * ease;
    light.y += (target.y - light.y) * ease;

    draw();
  };

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };
  const sync = () => {
    if (disposed) return;
    const still = reduced.matches || document.visibilityState !== "visible";
    if (still) {
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
    const nx = ((e.clientX - b.left) / b.width) * 2 - 1;
    const ny = 1 - ((e.clientY - b.top) / b.height) * 2;
    tracking = Math.abs(nx / BODY_X) ** EXPO + Math.abs(ny / BODY_Y) ** EXPO <= 1;
    if (tracking) {
      target.x = nx;
      target.y = ny;
    }
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

  const observer = new ResizeObserver(() => {
    if (!raf) draw();
  });
  observer.observe(canvas);

  draw();
  sync();

  return () => {
    disposed = true;
    stop();
    observer.disconnect();
    canvas.removeEventListener("pointermove", move);
    canvas.removeEventListener("pointerleave", leave);
    canvas.removeEventListener("webglcontextlost", lost);
    document.removeEventListener("visibilitychange", sync);
    reduced.removeEventListener("change", sync);
    gl.deleteBuffer(quad);
    gl.deleteTexture(textTex);
    gl.deleteProgram(program);
  };
}

export const PrismOrb = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const teardown = canvasRef.current ? boot(canvasRef.current, () => setLive(false)) : undefined;
    if (teardown) setLive(true);
    return teardown;
  }, []);

  return (
    <div
      className="relative w-full select-none"
      style={{ maxWidth: MAX_WIDTH, aspectRatio: ASPECT_RATIO }}
    >
      {/* The one thing the shader cannot do: WebGL has no access to the page behind the
          canvas, so the glass disturbs its real backdrop from the DOM side instead. The
          canvas on top is transparent through the body, so both are visible at once. */}
      <div
        aria-hidden
        className="absolute"
        style={{ ...BODY_BOX, backdropFilter: "blur(7px) saturate(1.2)", opacity: live ? 1 : 0 }}
      />
      {/* Placeholder and fallback: the dark sphere with a hint of the caustic. */}
      <div
        aria-hidden
        className="absolute transition-opacity duration-500"
        style={{
          ...BODY_BOX,
          background: "radial-gradient(circle at 50% 34%, #16171c 0%, #0a0a0d 62%, #050506 100%)",
          opacity: live ? 0 : 1,
        }}
      />
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute inset-0 size-full touch-none transition-opacity duration-500"
        style={{ opacity: live ? 1 : 0 }}
      />
    </div>
  );
};
