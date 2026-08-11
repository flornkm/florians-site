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

// The shader works in a unit circle, so drawing it into a wider-than-tall box is what
// makes the body an ellipse — the caustic and the rim stretch with it, which is the
// proportion the small status-bar version of this has.
const MAX_WIDTH = 200;
const ASPECT = "3 / 2";
// The band's motion is a slow swell, but it is a long smooth gradient — 30fps shows
// its steps, and this shader is cheap enough not to need the saving.
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
uniform vec2 u_light;
uniform float u_ambient; // 0 = dark surroundings, 1 = light ones
out vec4 outColor;

// How many wavelengths the interior is sampled at. Three (plain RGB) only fringes the
// band's two edges; a full spread needs the middle sampled too. Sharp ribbons need many
// more again — each wavelength draws its own copy, and at 14 they read as separate
// stripes rather than a continuous spectrum. Affordable only because the per-wavelength
// work below is a refract and a few exp() calls.
const int SPECTRAL_TAPS = 28;
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
// A sphere alone disperses along its own radius, so a horizontal ribbon separates
// lengthwise and stays white. The separation has to be vertical, which is what a wedge
// gives — a prism inside the glass with its apex horizontal.
const float WEDGE = 0.58;
// The wedge is used for the chromatic separation ONLY; the ribbon's position still
// comes from the sphere's own refraction. Applying the wedge directly displaces the
// whole image by its mean deviation and throws the band off the top of the glass.
const float SPREAD = 4.10;
// The far image is dimmer (it has been through more glass) and its spectrum is spread
// wider, because those rays travelled further apart before landing.
const float FAR_SPREAD = 2.60;
const float FAR_GAIN = 0.14;

// Sensitivity curve: the colour the eye assigns to a single wavelength, violet (0) to
// red (1). Stands in for the CIE curves, which are more than this needs.
vec3 wavelength(float u) {
  vec3 c = mix(vec3(0.86, 0.24, 0.90), vec3(0.30, 0.34, 1.00), smoothstep(0.00, 0.24, u));
  c = mix(c, vec3(0.18, 0.86, 1.00), smoothstep(0.20, 0.42, u));
  c = mix(c, vec3(0.42, 1.00, 0.36), smoothstep(0.34, 0.54, u));
  c = mix(c, vec3(1.00, 0.94, 0.20), smoothstep(0.50, 0.70, u));
  c = mix(c, vec3(1.00, 0.48, 0.10), smoothstep(0.66, 0.86, u));
  c = mix(c, vec3(0.96, 0.13, 0.09), smoothstep(0.82, 1.00, u));
  return c;
}

// The environment the sphere reflects: one large soft key, a dim cool gradient, and a
// bounce from below. Everything the edge does is a reflection of this — there is no rim
// term anywhere in this shader.
vec3 env(vec3 d, vec2 lightPos, float ambient) {
  d = normalize(d);
  vec3 key = normalize(vec3(lightPos.x * 0.55 - 0.30, lightPos.y * 0.35 + 0.72, 0.46));
  float up = smoothstep(-0.65, 0.95, d.y);
  // The surroundings track the page. Reflecting a dark studio while sitting on a light
  // background puts a hard black ring round the glass, because at grazing angles the
  // edge shows nothing but this.
  vec3 c = mix(mix(vec3(0.004, 0.005, 0.008), vec3(0.055, 0.064, 0.086), up),
               mix(vec3(0.40, 0.43, 0.50), vec3(0.88, 0.91, 0.96), up),
               ambient);
  float k = max(dot(d, key), 0.0);
  c += vec3(1.00, 0.98, 0.95) * pow(k, 26.0) * 3.4; // the softbox itself
  c += vec3(0.50, 0.60, 0.85) * pow(k, 3.5) * 0.18; // its falloff across the surface
  float fill = max(dot(d, normalize(vec3(0.52, -0.66, 0.54))), 0.0);
  c += vec3(0.32, 0.46, 0.86) * pow(fill, 7.0) * 0.75; // cool bounce off the floor
  return c;
}

// The three ribbon centre lines at a given x. Hoisted out of the wavelength loop below
// because the wedge displaces the sampling point almost purely vertically — x barely
// moves between wavelengths, so these sines would be recomputed identically 28 times.
vec3 centres(float x, float t, float lightY) {
  float b = -0.30 + lightY * 0.05;
  // Offset from one another as well as waved, so together they occupy a band rather
  // than three lines sharing a centre.
  return vec3(
    b + 0.075 + sin(x * 1.70 + t * 0.55) * 0.060 + sin(x * 3.10 - t * 0.31) * 0.022,
    b + 0.000 + sin(x * 2.10 - t * 0.42 + 2.1) * 0.075 + sin(x * 3.70 + t * 0.27) * 0.020,
    b - 0.075 + sin(x * 1.40 + t * 0.33 + 4.2) * 0.055 + sin(x * 2.60 - t * 0.50) * 0.026
  );
}

// Three emissive ribbons suspended inside the glass, each on its own travelling wave so
// they weave across one another rather than reading as a single line. White — every
// colour in the final image comes out of dispersion, not out of these. The exponent
// keeps their edges crisp; a plain gaussian has tails long enough that, once each is
// smeared across a spectrum, they overlap into a soft wash.
float ribbons(float y, vec3 cy, float w) {
  return exp(-pow(abs((y - cy.x) / w), 2.2))
       + exp(-pow(abs((y - cy.y) / (w * 0.85)), 2.2))
       + exp(-pow(abs((y - cy.z) / (w * 0.70)), 2.2));
}

// Everything about a ribbon set that depends only on x, so it too leaves the loop.
// x: half-width after taper, y: falloff along the length.
vec2 profile(float x) {
  return vec2(0.046 * pow(clamp(1.0 - pow(x / 0.94, 2.0), 0.0, 1.0), 0.72),
              exp(-pow(abs(x) / 0.66, 3.2)) * 0.90);
}

void main() {
  vec2 p = v_uv * 2.0 - 1.0;
  float r = length(p);
  float aa = fwidth(r) * 1.2;
  float mask = 1.0 - smoothstep(1.0 - aa, 1.0, r);
  if (mask <= 0.0) { outColor = vec4(0.0); return; }

  float z = sqrt(max(0.0, 1.0 - min(r * r, 1.0)));
  vec3 P = vec3(p, z);          // the point on the surface
  vec3 N = normalize(P);        // and its normal, which is the same thing on a sphere
  vec3 V = normalize(vec3(0.0, 0.0, 3.4) - P); // mild perspective, so the rim turns away
  float t = u_time;

  // Refraction, one wavelength at a time. Each gets its own index, so each bends by a
  // different amount and lands somewhere else on the emitter — which is the whole
  // rainbow, produced rather than painted.
  float iorMid = 0.5 * (IOR_VIOLET + IOR_RED);
  // The wedge undulates along x rather than being a flat prism, so the amount of
  // separation varies across the width. A different wavelength then lands on the ribbon
  // at each x, which is why the strands change hue along their length instead of every
  // column showing the same vertical stack of the whole spectrum.
  float wedgeAmt = WEDGE * (1.0 + 0.62 * sin(p.x * 1.35 + t * 0.24)
                                + 0.24 * sin(p.x * 2.60 - t * 0.17));
  vec3 wedgeN = normalize(N + vec3(0.0, wedgeAmt, 0.0));
  // Where the ribbon appears: straight sphere refraction, which is also what compresses
  // it toward the rim the way a real ball squeezes what is behind it.
  vec2 base = (P + refract(-V, N, 1.0 / iorMid) * BASE_DEPTH).xy;
  // The same ribbon again, but followed all the way to the far surface. A glass ball
  // shows two images of what is inside it, and this deep one is the arc that wraps the
  // rim — the sphere's own magnification bending it round the edge.
  vec2 farBase = (P + refract(-V, N, 1.0 / iorMid) * DEPTH).xy;
  // The wedge's own mid-wavelength landing, subtracted below so only the separation
  // between wavelengths survives.
  vec2 wedgeMid = (P + refract(-V, wedgeN, 1.0 / iorMid) * DEPTH).xy;

  vec3 cyNear = centres(base.x, t, u_light.y);
  vec3 cyFar = centres(farBase.x, t, u_light.y);
  vec2 profNear = profile(base.x);
  vec2 profFar = profile(farBase.x);
  // Weighted by how much glass the ray crossed, so the far image stays a band wrapping
  // the rim instead of flooding the middle, where the near one belongs.
  float farWeight = FAR_GAIN * smoothstep(0.10, 0.82, 1.0 - z);

  vec3 sum = vec3(0.0);
  vec3 weight = vec3(0.0);
  for (int i = 0; i < SPECTRAL_TAPS; i++) {
    float u = (float(i) + 0.5) / float(SPECTRAL_TAPS);
    vec3 w = wavelength(u);
    float dy = (P + refract(-V, wedgeN, 1.0 / mix(IOR_VIOLET, IOR_RED, u)) * DEPTH).y - wedgeMid.y;
    float near = ribbons(base.y + dy * SPREAD, cyNear, profNear.x) * profNear.y;
    float far = ribbons(farBase.y + dy * FAR_SPREAD, cyFar, profFar.x) * profFar.y;
    sum += w * (near + far * farWeight);
    weight += w;
  }

  // Dividing by the summed response keeps an undispersed emitter white instead of it
  // taking on the average colour of the sampling curve.
  vec3 inside = sum / max(weight, vec3(1e-4));

  // Reflection off the outer surface, weighted by Fresnel. At the rim the exponent
  // drives this to 1 and the sphere shows nothing but environment — that grazing
  // reflection *is* the specular edge, rather than a rim light standing in for one.
  vec3 reflected = env(reflect(-V, N), u_light, u_ambient);
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
  float absorb = (0.16 + 0.30 * (1.0 - z)) * mix(1.0, 0.62, u_ambient);
  // The spectrum is light being added, so it needs something dark to land on. That is
  // what the crown below provides on a light page — with it there, the gain can stay
  // high in both themes. Lowering it for light mode (which is what a bare white page
  // needs, to stop every hue clipping) leaves the colours flat once the crown exists.
  float alpha = clamp(absorb + fres * 0.92
                    + dot(inside, vec3(0.33)) * mix(0.90, 1.15, u_ambient), 0.0, 1.0);

  vec3 bodyTint = mix(vec3(0.020, 0.024, 0.034), vec3(0.88, 0.90, 0.94), u_ambient);
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
  float crown = smoothstep(-0.62, 0.42, p.y);
  vec3 body = bodyTint * absorb * (1.0 - 0.88 * band) * mix(1.0, 0.05, crown);
  alpha = clamp(alpha + crown * mix(0.62, 1.00, u_ambient), 0.0, 1.0);

  vec3 emit = inside * mix(3.10, 3.30, u_ambient)
            + reflected * fres * mix(1.0, 0.16, crown)
            + body;

  // The wall of the glass, seen edge-on. At the last few percent the ray path through
  // it is long enough to carry almost nothing out, which is a thin dark seam — and it
  // is the only thing giving the shape a defined edge on a light page, where the body
  // otherwise just fades into it. Sits outside the Fresnel highlight rather than over
  // it, so the bright reflected edge survives underneath.
  float seam = smoothstep(0.982, 1.0, r) * mix(0.70, 0.24, u_ambient);
  emit = mix(emit, emit * 0.42, seam);
  alpha = mix(alpha, max(alpha, 0.82), seam);

  outColor = vec4(clamp(emit, 0.0, 1.0) * mask, alpha * mask);
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

  const frame = (now: number) => {
    if (disposed) return;
    raf = requestAnimationFrame(frame);
    if (now - lastDraw < 1000 / FPS - 1) return;
    lastDraw = now;

    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    time += dt;

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
    tracking = nx * nx + ny * ny <= 1;
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
      style={{ maxWidth: MAX_WIDTH, aspectRatio: ASPECT }}
    >
      {/* The one thing the shader cannot do: WebGL has no access to the page behind the
          canvas, so the glass disturbs its real backdrop from the DOM side instead. The
          canvas on top is transparent through the body, so both are visible at once. */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{ backdropFilter: "blur(7px) saturate(1.2)", opacity: live ? 1 : 0 }}
      />
      {/* Placeholder and fallback: the dark sphere with a hint of the caustic. */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full transition-opacity duration-500"
        style={{
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
