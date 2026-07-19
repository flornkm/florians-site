export const fragmentShaderSource = `
precision mediump float;

varying vec2 vUv;

uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform float uTime;
uniform float uTurnOn; // 0.0 = off, 1.0 = fully on

const float CURVATURE       = 4.0;
const float CHROMA_SHIFT    = 0.0015;
const float SCANLINE_WEIGHT = 0.12;
const float SCANLINE_COUNT  = 240.0;
const float BLOOM_RADIUS    = 2.0;
const float BLOOM_STRENGTH  = 0.35;
const float VIGNETTE_AMOUNT = 0.25;
const float FLICKER_AMP     = 0.01;
const float NOISE_AMP       = 0.02;
const float PHOSPHOR_SCALE  = 3.0;
const float BRIGHTNESS      = 1.8;

vec2 curveUV(vec2 uv) {
  vec2 cu = uv * 2.0 - 1.0;
  vec2 offset = cu.yx * cu.yx * cu.xy * (CURVATURE / 100.0);
  return (cu + offset) * 0.5 + 0.5;
}

float rand(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 sampleBloom(vec2 uv) {
  vec2 px = BLOOM_RADIUS / uResolution;
  vec3 sum = texture2D(uTexture, uv).rgb * 0.25;
  sum += texture2D(uTexture, uv + vec2( px.x, 0.0)).rgb * 0.125;
  sum += texture2D(uTexture, uv + vec2(-px.x, 0.0)).rgb * 0.125;
  sum += texture2D(uTexture, uv + vec2(0.0,  px.y)).rgb * 0.125;
  sum += texture2D(uTexture, uv + vec2(0.0, -px.y)).rgb * 0.125;
  sum += texture2D(uTexture, uv + vec2( px.x,  px.y)).rgb * 0.0625;
  sum += texture2D(uTexture, uv + vec2(-px.x,  px.y)).rgb * 0.0625;
  sum += texture2D(uTexture, uv + vec2( px.x, -px.y)).rgb * 0.0625;
  sum += texture2D(uTexture, uv + vec2(-px.x, -px.y)).rgb * 0.0625;
  return sum;
}

vec3 phosphorMask(vec2 fragCoord) {
  int col = int(mod(fragCoord.x, PHOSPHOR_SCALE));
  if (col == 0) return vec3(1.0, 0.5, 0.5);
  if (col == 1) return vec3(0.5, 1.0, 0.5);
  return vec3(0.5, 0.5, 1.0);
}

void main() {
  vec2 uv = curveUV(vUv);

  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  float r = texture2D(uTexture, uv + vec2( CHROMA_SHIFT, 0.0)).r;
  float g = texture2D(uTexture, uv).g;
  float b = texture2D(uTexture, uv + vec2(-CHROMA_SHIFT, 0.0)).b;
  vec3 color = vec3(r, g, b);

  color += sampleBloom(uv) * BLOOM_STRENGTH;

  vec2 fragCoord = uv * uResolution;
  color *= phosphorMask(fragCoord);

  float scanline = sin(fragCoord.y * 3.14159265 * 2.0 / (uResolution.y / SCANLINE_COUNT)) * 0.5 + 0.5;
  color *= 1.0 - SCANLINE_WEIGHT * (1.0 - scanline);

  vec2 vig = uv * (1.0 - uv);
  color *= pow(vig.x * vig.y * 15.0, VIGNETTE_AMOUNT);

  color *= 1.0 + FLICKER_AMP * sin(uTime * 8.0);
  color += (rand(uv + fract(uTime)) - 0.5) * NOISE_AMP;

  color *= BRIGHTNESS;

  // Turn-on: fade from black, revealing vertically from the center outward.
  if (uTurnOn < 1.0) {
    float t = uTurnOn * uTurnOn;
    float distFromCenter = abs(vUv.y - 0.5) * 2.0;
    float reveal = smoothstep(1.0, 0.0, distFromCenter - t);
    color *= reveal * t;
  }

  gl_FragColor = vec4(color, 1.0);
}
`;
