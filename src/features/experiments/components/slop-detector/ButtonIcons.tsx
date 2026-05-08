import { useMemo } from "react"
import * as THREE from "three"

type IconDraw = (ctx: CanvasRenderingContext2D, s: number) => void

const SIZE = 256
const ICON_W = 0.0062
const ICON_Y = 0.0198

function makeIconTexture(draw: IconDraw) {
  const c = document.createElement("canvas")
  c.width = c.height = SIZE
  const ctx = c.getContext("2d")!
  draw(ctx, SIZE)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  t.needsUpdate = true
  return t
}

const power: IconDraw = (ctx, s) => {
  ctx.clearRect(0, 0, s, s)
  ctx.fillStyle = "#0a160e"
  ctx.strokeStyle = "#0a160e"
  ctx.lineWidth = s * 0.14
  ctx.lineCap = "butt"
  ctx.lineJoin = "miter"
  ctx.beginPath()
  ctx.arc(s / 2, s / 2 + s * 0.05, s * 0.30, -Math.PI * 0.42, Math.PI * 1.42, false)
  ctx.stroke()
  ctx.fillRect(s * 0.435, s * 0.13, s * 0.13, s * 0.40)
  ctx.beginPath()
  ctx.arc(s / 2, s * 0.86, s * 0.05, 0, Math.PI * 2)
  ctx.fill()
}

const triangle: IconDraw = (ctx, s) => {
  ctx.clearRect(0, 0, s, s)
  ctx.fillStyle = "#f4ede0"
  ctx.fillRect(s * 0.20, s * 0.22, s * 0.07, s * 0.56)
  ctx.beginPath()
  ctx.moveTo(s * 0.36, s * 0.22)
  ctx.lineTo(s * 0.36, s * 0.78)
  ctx.lineTo(s * 0.83, s / 2)
  ctx.closePath()
  ctx.fill()
}

const plus: IconDraw = (ctx, s) => {
  ctx.clearRect(0, 0, s, s)
  ctx.fillStyle = "#13231a"
  ctx.fillRect(s * 0.44, s * 0.16, s * 0.12, s * 0.68)
  ctx.fillRect(s * 0.16, s * 0.44, s * 0.68, s * 0.12)
  const cap = s * 0.06
  ctx.fillRect(s * 0.16, s * 0.38, cap, s * 0.24)
  ctx.fillRect(s - s * 0.16 - cap, s * 0.38, cap, s * 0.24)
  ctx.fillRect(s * 0.38, s * 0.16, s * 0.24, cap)
  ctx.fillRect(s * 0.38, s - s * 0.16 - cap, s * 0.24, cap)
}

const minus: IconDraw = (ctx, s) => {
  ctx.clearRect(0, 0, s, s)
  ctx.fillStyle = "#13231a"
  ctx.fillRect(s * 0.16, s * 0.44, s * 0.68, s * 0.12)
  const cap = s * 0.06
  ctx.fillRect(s * 0.16, s * 0.38, cap, s * 0.24)
  ctx.fillRect(s - s * 0.16 - cap, s * 0.38, cap, s * 0.24)
}

const SLOTS: { x: number; draw: IconDraw }[] = [
  { x: -0.030, draw: power },
  { x: -0.012, draw: triangle },
  { x: 0.008, draw: plus },
  { x: 0.026, draw: minus }
]

function Icon({ x, draw }: { x: number; draw: IconDraw }) {
  const texture = useMemo(() => makeIconTexture(draw), [draw])
  return (
    <mesh
      position={[x, ICON_Y, 0.014]}
      rotation={[-Math.PI / 2, 0, 0]}
      renderOrder={5}
      castShadow={false}
      receiveShadow={false}>
      <planeGeometry args={[ICON_W, ICON_W]} />
      <meshBasicMaterial
        map={texture}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  )
}

export function ButtonIcons() {
  return (
    <>
      {SLOTS.map((s, i) => (
        <Icon key={i} x={s.x} draw={s.draw} />
      ))}
    </>
  )
}
