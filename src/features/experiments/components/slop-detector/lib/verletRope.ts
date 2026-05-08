export class VerletRope {
  pos: Float32Array
  prev: Float32Array
  N: number
  segLen: number

  constructor(N: number, totalLen: number) {
    this.N = N
    this.pos = new Float32Array(N * 3)
    this.prev = new Float32Array(N * 3)
    this.segLen = totalLen / (N - 1)
  }

  setLength(totalLen: number) {
    this.segLen = totalLen / (this.N - 1)
  }

  init(ax: number, ay: number, az: number, bx: number, by: number, bz: number) {
    for (let i = 0; i < this.N; i++) {
      const t = i / (this.N - 1)
      const x = ax + (bx - ax) * t
      const y = ay + (by - ay) * t
      const z = az + (bz - az) * t
      const k = i * 3
      this.pos[k] = x
      this.pos[k + 1] = y
      this.pos[k + 2] = z
      this.prev[k] = x
      this.prev[k + 1] = y
      this.prev[k + 2] = z
    }
  }

  step(ax: number, ay: number, az: number, bx: number, by: number, bz: number) {
    const damping = 0.92
    const gx = 0
    const gy = -0.0009
    const gz = 0.0014
    const N = this.N
    const last = (N - 1) * 3

    for (let i = 1; i < N - 1; i++) {
      const k = i * 3
      const vx = (this.pos[k] - this.prev[k]) * damping
      const vy = (this.pos[k + 1] - this.prev[k + 1]) * damping
      const vz = (this.pos[k + 2] - this.prev[k + 2]) * damping
      this.prev[k] = this.pos[k]
      this.prev[k + 1] = this.pos[k + 1]
      this.prev[k + 2] = this.pos[k + 2]
      this.pos[k] += vx + gx
      this.pos[k + 1] += vy + gy
      this.pos[k + 2] += vz + gz
    }

    this.pos[0] = ax
    this.pos[1] = ay
    this.pos[2] = az
    this.pos[last] = bx
    this.pos[last + 1] = by
    this.pos[last + 2] = bz
    this.prev[0] = ax
    this.prev[1] = ay
    this.prev[2] = az
    this.prev[last] = bx
    this.prev[last + 1] = by
    this.prev[last + 2] = bz

    for (let it = 0; it < 6; it++) {
      for (let i = 0; i < N - 1; i++) {
        const a = i * 3
        const b = (i + 1) * 3
        const dx = this.pos[b] - this.pos[a]
        const dy = this.pos[b + 1] - this.pos[a + 1]
        const dz = this.pos[b + 2] - this.pos[a + 2]
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6
        const diff = ((dist - this.segLen) / dist) * 0.5
        const cdx = dx * diff
        const cdy = dy * diff
        const cdz = dz * diff
        if (i > 0) {
          this.pos[a] += cdx
          this.pos[a + 1] += cdy
          this.pos[a + 2] += cdz
        }
        if (i < N - 2) {
          this.pos[b] -= cdx
          this.pos[b + 1] -= cdy
          this.pos[b + 2] -= cdz
        }
      }
      this.pos[0] = ax
      this.pos[1] = ay
      this.pos[2] = az
      this.pos[last] = bx
      this.pos[last + 1] = by
      this.pos[last + 2] = bz
    }
  }
}
