import { fragmentShaderSource } from "./crt-shader.frag";
import { vertexShaderSource } from "./crt-shader.vert";

export class CRTShaderRenderer {
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private texture: WebGLTexture;
  private posBuffer: WebGLBuffer;

  private uTexture: WebGLUniformLocation;
  private uResolution: WebGLUniformLocation;
  private uTime: WebGLUniformLocation;
  private uTurnOn: WebGLUniformLocation;

  private startTime: number;
  private _turnOnProgress: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      premultipliedAlpha: false,
    });
    if (!gl) throw new Error("WebGL not supported");
    this.gl = gl;
    this.startTime = performance.now();

    this.program = this.createProgram(vertexShaderSource, fragmentShaderSource);
    gl.useProgram(this.program);

    // Fullscreen quad (two triangles, clip-space)
    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    this.posBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(this.program, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    this.texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    this.uTexture = gl.getUniformLocation(this.program, "uTexture")!;
    this.uResolution = gl.getUniformLocation(this.program, "uResolution")!;
    this.uTime = gl.getUniformLocation(this.program, "uTime")!;
    this.uTurnOn = gl.getUniformLocation(this.program, "uTurnOn")!;
  }

  set turnOnProgress(value: number) {
    this._turnOnProgress = Math.min(1, Math.max(0, value));
  }

  render(sourceCanvas: HTMLCanvasElement): void {
    const { gl } = this;

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.program);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sourceCanvas);
    gl.uniform1i(this.uTexture, 0);

    gl.uniform2f(this.uResolution, gl.canvas.width, gl.canvas.height);
    gl.uniform1f(this.uTime, (performance.now() - this.startTime) / 1000);
    gl.uniform1f(this.uTurnOn, this._turnOnProgress);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  resize(width: number, height: number): void {
    const canvas = this.gl.canvas as HTMLCanvasElement;
    canvas.width = width;
    canvas.height = height;
  }

  dispose(): void {
    const { gl } = this;
    gl.deleteTexture(this.texture);
    gl.deleteBuffer(this.posBuffer);
    gl.deleteProgram(this.program);
  }

  private createProgram(vertSrc: string, fragSrc: string): WebGLProgram {
    const { gl } = this;
    const vs = this.compileShader(gl.VERTEX_SHADER, vertSrc);
    const fs = this.compileShader(gl.FRAGMENT_SHADER, fragSrc);
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(`Shader program link failed: ${info}`);
    }
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return program;
  }

  private compileShader(type: number, source: string): WebGLShader {
    const { gl } = this;
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`Shader compile failed: ${info}`);
    }
    return shader;
  }
}
