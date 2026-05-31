export const vertexShaderSource = `
attribute vec2 aPosition;
varying vec2 vUv;

void main() {
  // Flip Y: Canvas2D is top-down, WebGL is bottom-up
  vec2 uv = aPosition * 0.5 + 0.5;
  vUv = vec2(uv.x, 1.0 - uv.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;
