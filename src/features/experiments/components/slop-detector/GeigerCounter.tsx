import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
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
