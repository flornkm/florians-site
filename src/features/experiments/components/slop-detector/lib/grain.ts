import * as THREE from "three"

const cache = new Map<string, THREE.Texture>()

function valueNoise(x: number, y: number, seed: number) {
  const s = Math.sin(x * 12.9898 + y * 78.233 + seed * 37.719) * 43758.5453
  return s - Math.floor(s)
}

function smoothNoise(x: number, y: number, seed: number) {
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const fx = x - x0
  const fy = y - y0
  const ux = fx * fx * (3 - 2 * fx)
  const uy = fy * fy * (3 - 2 * fy)
  const a = valueNoise(x0, y0, seed)
  const b = valueNoise(x0 + 1, y0, seed)
  const c = valueNoise(x0, y0 + 1, seed)
  const d = valueNoise(x0 + 1, y0 + 1, seed)
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy
}

function fbm(x: number, y: number, seed: number) {
  let v = 0
  let amp = 0.5
  let freq = 1
  for (let i = 0; i < 4; i++) {
    v += smoothNoise(x * freq, y * freq, seed + i) * amp
    amp *= 0.5
    freq *= 2
  }
  return v
}

function drawScratch(
  heights: Float32Array,
  size: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  depth: number
) {
  const dx = x1 - x0
  const dy = y1 - y0
  const steps = Math.max(1, Math.round(Math.max(Math.abs(dx), Math.abs(dy))))
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const fade = Math.sin(t * Math.PI)
    const px = x0 + dx * t
    const py = y0 + dy * t
    const xi = ((Math.round(px) % size) + size) % size
    const yi = ((Math.round(py) % size) + size) % size
    heights[yi * size + xi] -= depth * fade
    const xj = (xi + 1) % size
    heights[yi * size + xj] -= depth * fade * 0.5
  }
}

export function makeGrainNormalMap(size = 256, scale = 32, seed = 7) {
  const key = `${size}-${scale}-${seed}`
  const cached = cache.get(key)
  if (cached) return cached

  const c = document.createElement("canvas")
  c.width = c.height = size
  const ctx = c.getContext("2d")!
  const img = ctx.createImageData(size, size)
  const heights = new Float32Array(size * size)

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      heights[y * size + x] = fbm((x / size) * scale, (y / size) * scale, seed)
    }
  }

  let s = seed * 1000
  const rand = () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }

  const NUM_SCRATCHES = 22
  for (let i = 0; i < NUM_SCRATCHES; i++) {
    const x0 = rand() * size
    const y0 = rand() * size
    const angle = rand() * Math.PI * 2
    const length = (8 + rand() * 96) * (size / 256)
    const x1 = x0 + Math.cos(angle) * length
    const y1 = y0 + Math.sin(angle) * length
    const depth = 0.04 + rand() * 0.10
    drawScratch(heights, size, x0, y0, x1, y1, depth)
  }

  const NUM_DOTS = 32
  for (let i = 0; i < NUM_DOTS; i++) {
    const cx = Math.floor(rand() * size)
    const cy = Math.floor(rand() * size)
    const r = 1 + Math.floor(rand() * 3)
    const depth = 0.06 + rand() * 0.08
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const d = Math.hypot(dx, dy)
        if (d > r) continue
        const xi = ((cx + dx) % size + size) % size
        const yi = ((cy + dy) % size + size) % size
        heights[yi * size + xi] -= depth * (1 - d / r)
      }
    }
  }

  const NUM_SMUDGES = 6
  for (let i = 0; i < NUM_SMUDGES; i++) {
    const cx = rand() * size
    const cy = rand() * size
    const rx = (12 + rand() * 28) * (size / 256)
    const ry = (8 + rand() * 22) * (size / 256)
    const angle = rand() * Math.PI
    const cosA = Math.cos(angle)
    const sinA = Math.sin(angle)
    const depth = 0.02 + rand() * 0.03
    for (let dy = -ry; dy <= ry; dy++) {
      for (let dx = -rx; dx <= rx; dx++) {
        const lx = dx * cosA + dy * sinA
        const ly = -dx * sinA + dy * cosA
        const norm = (lx * lx) / (rx * rx) + (ly * ly) / (ry * ry)
        if (norm > 1) continue
        const fade = 1 - norm
        const xi = ((Math.round(cx + dx) % size) + size) % size
        const yi = ((Math.round(cy + dy) % size) + size) % size
        heights[yi * size + xi] += depth * fade * 0.5
      }
    }
  }

  const sample = (x: number, y: number) => {
    const xi = ((x % size) + size) % size
    const yi = ((y % size) + size) % size
    return heights[yi * size + xi]
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = sample(x + 1, y) - sample(x - 1, y)
      const dy = sample(x, y + 1) - sample(x, y - 1)
      const nx = -dx * 4
      const ny = -dy * 4
      const nz = 1
      const len = Math.hypot(nx, ny, nz)
      const i = (y * size + x) * 4
      img.data[i] = Math.round(((nx / len) * 0.5 + 0.5) * 255)
      img.data[i + 1] = Math.round(((ny / len) * 0.5 + 0.5) * 255)
      img.data[i + 2] = Math.round(((nz / len) * 0.5 + 0.5) * 255)
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)

  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.NoColorSpace
  tex.anisotropy = 4
  cache.set(key, tex)
  return tex
}
