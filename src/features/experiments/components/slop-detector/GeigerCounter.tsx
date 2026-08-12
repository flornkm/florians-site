import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { AIDetector } from "./AIDetector";
import { ButtonIcons } from "./ButtonIcons";
import { Cable } from "./Cable";
import { CornerAnchor } from "./CornerAnchor";
import { DeviceTilt } from "./DeviceTilt";
import { Display } from "./Display";
import { ElementHighlighter } from "./ElementHighlighter";
import { GroundShadows } from "./GroundShadows";
import { KeyLight } from "./KeyLight";
import { Labels } from "./Labels";
import { applyTexturedMaterials } from "./lib/materials";
import { PowerButton } from "./PowerButton";
import { Probe } from "./Probe";
import { Sticker } from "./Sticker";
import { Triangle } from "./Triangle";

const MODEL_URL = "/models/geiger.glb";
useGLTF.preload(MODEL_URL);

export function GeigerCounter() {
  const { scene } = useGLTF(MODEL_URL);

  const parts = useMemo(() => {
    const root = scene.clone(true);
    applyTexturedMaterials(root);

    root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });

    const bodyRoot = root.getObjectByName("GeigerBody_Root") ?? null;
    const probeRoot = root.getObjectByName("GeigerProbe_Root") ?? null;
    const anchorBody = root.getObjectByName("GeigerCableAnchor_Body") ?? null;
    const anchorProbe = root.getObjectByName("GeigerCableAnchor_Probe") ?? null;

    if (bodyRoot && anchorBody) bodyRoot.attach(anchorBody);
    if (probeRoot && anchorProbe) probeRoot.attach(anchorProbe);

    if (probeRoot) probeRoot.removeFromParent();

    return {
      root,
      body: bodyRoot,
      probe: probeRoot,
      cableMesh: root.getObjectByName("GeigerCable") ?? null,
      anchorBody,
      anchorProbe,
      triangle: root.getObjectByName("GeigerTriangle") ?? null,
      screen: root.getObjectByName("GeigerScreen") ?? null,
      power: root.getObjectByName("GeigerButtonPower") ?? null,
      mode: root.getObjectByName("GeigerButtonMode") ?? null,
      volUp: root.getObjectByName("GeigerButtonVolUp") ?? null,
      volDn: root.getObjectByName("GeigerButtonVolDn") ?? null,
      probeFace: (probeRoot && probeRoot.getObjectByName("GeigerProbeFace")) ?? null,
    };
  }, [scene]);

  if (parts.cableMesh) parts.cableMesh.visible = false;

  // Pan the top-down camera onto the device body every frame so it stays centered in
  // the view — the device drifts slightly via DeviceTilt, so a one-off center wouldn't
  // hold. Panning the camera (vs moving the model) keeps the shadow, lights and probe
  // in sync since nothing moves in world space.
  const { camera } = useThree();
  const aabb = useRef(new THREE.Box3());
  const mid = useRef(new THREE.Vector3());
  useFrame(() => {
    const body = parts.body;
    if (!body) return;
    aabb.current.setFromObject(body);
    if (aabb.current.isEmpty()) return;
    aabb.current.getCenter(mid.current);
    camera.position.x = mid.current.x;
    camera.position.z = mid.current.z;
  });

  return (
    <>
      <CornerAnchor>
        <DeviceTilt>
          <primitive object={parts.root} />
          {parts.triangle && <Triangle node={parts.triangle} />}
          {parts.power && <PowerButton node={parts.power} />}
          <Display hidden={parts.screen} />
          <Labels />
          <ButtonIcons />
          <Sticker bodyRoot={parts.body} />
        </DeviceTilt>
        {parts.probe && (
          <>
            <primitive object={parts.probe} />
            <Probe node={parts.probe} />
          </>
        )}
      </CornerAnchor>
      <Cable from={parts.anchorBody} to={parts.anchorProbe} />
      <GroundShadows anchor={parts.body} />
      <KeyLight anchor={parts.body} />
      <ElementHighlighter probeTip={parts.probeFace} />
      <AIDetector />
    </>
  );
}
