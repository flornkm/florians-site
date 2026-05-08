import { ContactShadows } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"

export function GroundShadows({ anchor }: { anchor: THREE.Object3D | null }) {
  const ref = useRef<THREE.Group>(null!)
  const wp = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    if (!anchor || !ref.current) return
    anchor.getWorldPosition(wp)
    ref.current.position.set(wp.x + 0.004, -0.0008, wp.z + 0.004)
  })

  return (
    <group ref={ref}>
      <ContactShadows
        scale={0.46}
        blur={3.4}
        opacity={0.32}
        far={0.08}
        resolution={384}
        frames={60}
        color="#0a1310"
      />
    </group>
  )
}
