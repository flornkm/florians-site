import { useFrame } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"

export function KeyLight({ anchor }: { anchor: THREE.Object3D | null }) {
  const lightRef = useRef<THREE.DirectionalLight>(null!)
  const target = useMemo(() => new THREE.Object3D(), [])
  const wp = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => {
    const l = lightRef.current
    if (!l) return
    l.target = target
    l.parent?.add(target)
    return () => {
      l.parent?.remove(target)
    }
  }, [target])

  useFrame(() => {
    const l = lightRef.current
    if (!l || !anchor) return
    anchor.getWorldPosition(wp)
    target.position.copy(wp)
    target.updateMatrixWorld()
    l.position.set(wp.x - 0.18, wp.y + 0.55, wp.z - 0.18)
  })

  return (
    <directionalLight
      ref={lightRef}
      intensity={0.55}
      color="#fff4e0"
      castShadow
      shadow-mapSize={[1024, 1024]}
      shadow-camera-near={0.05}
      shadow-camera-far={1.4}
      shadow-camera-left={-0.18}
      shadow-camera-right={0.18}
      shadow-camera-top={0.18}
      shadow-camera-bottom={-0.18}
      shadow-bias={-0.00008}
      shadow-normalBias={0.004}
      shadow-radius={20}
      shadow-blurSamples={25}
    />
  )
}
