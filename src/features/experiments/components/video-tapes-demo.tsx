import { RoundedBox } from "@react-three/drei";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/* Three frutiger-aero video tapes, one three.js scene shot near-frontal
   (fov 18) so it reads as a flat 2D illustration — until a tape yaws on
   hover and turns out to be a 3D object. Nothing to accomplish: they are
   just nice to pick up and toss around. Handling is the spring physics from
   the legora shelf — velocity-carrying springs, a grab offset so a tape
   never jumps to the cursor, roll from drag velocity, solid-tape collision —
   and the translucent shells hold real internals (wound reels, hubs,
   ribbon). Labels are paper stickers with ruled lines and Cedarville Cursive
   handwriting, drawn to canvas textures. */

interface TapeSpec {
  id: string;
  title: string;
  light: string;
  base: string;
  deep: string;
  ink: string;
}

const TAPES: TapeSpec[] = [
  {
    id: "roadtrip",
    title: "Roadtrip",
    light: "#d3f1ff",
    base: "#5fc9ff",
    deep: "#2b9be0",
    ink: "#0d4a76",
  },
  {
    id: "beach-day",
    title: "Beach day",
    light: "#eeffc4",
    base: "#a9e063",
    deep: "#74c433",
    ink: "#365f10",
  },
  {
    id: "birthday",
    title: "Birthday",
    light: "#ffddf1",
    base: "#ff92d4",
    deep: "#ea5fb2",
    ink: "#7c2159",
  },
];

// Tape body in real VHS proportions (18.7 × 10.2 × 2.5 cm). The visual
// meshes are authored at BASE dimensions and scaled down as a group; the
// physics constants below are the scaled world-space size.
const TAPE_SCALE = 0.62;
const BASE_W = 1.06;
const BASE_H = 0.58;
const BASE_D = 0.15;
const TAPE_W = BASE_W * TAPE_SCALE;
const TAPE_H = BASE_H * TAPE_SCALE;
const TAPE_D = BASE_D * TAPE_SCALE;

const HOMES = [
  { pos: new THREE.Vector3(-0.85, 0.02, 0.5), roll: -0.05 },
  { pos: new THREE.Vector3(0, -0.03, 0.5), roll: 0.03 },
  { pos: new THREE.Vector3(0.85, 0.02, 0.5), roll: -0.04 },
];

const BOUNDS = { x: 1.6, y: 1.05 };

type Mode = "rest" | "drag" | "return";

interface TapeSpring {
  mode: Mode;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  target: THREE.Vector3;
  roll: number;
  rollT: number;
  yaw: number;
  yawT: number;
  grab: THREE.Vector3;
  home: (typeof HOMES)[number];
  object: THREE.Group | null;
}

// A critically damped-ish spring per axis; velocity carries through target
// changes, so a released drag keeps its momentum.
function stepSpring(spring: TapeSpring, stiffness: number, damping: number, dt: number) {
  const axes = ["x", "y", "z"] as const;
  for (const axis of axes) {
    const displacement = spring.pos[axis] - spring.target[axis];
    const accel = -stiffness * displacement - damping * spring.vel[axis];
    spring.vel[axis] += accel * dt;
    spring.pos[axis] += spring.vel[axis] * dt;
  }
}

function settled(spring: TapeSpring) {
  return spring.pos.distanceTo(spring.target) < 0.008 && spring.vel.length() < 0.04;
}

// Who yields when two tapes meet: the more deliberate motion keeps its path.
const MODE_RANK: Record<Mode, number> = {
  drag: 5,
  return: 1,
  rest: 0,
};

// Tapes are solid. After the springs integrate, separate any overlapping
// pair along the axis of least penetration; the lower-ranked tape is shoved
// aside and its own spring walks it back once the way is clear. Returns
// whether anything was pushed, so the frame loop keeps running until every
// displaced tape has settled home.
function resolveTapeCollisions(tapes: TapeSpring[]) {
  const pad = TAPE_H * 0.06;
  let pushed = false;

  for (let iteration = 0; iteration < 3; iteration++) {
    let overlapping = false;

    for (let i = 0; i < tapes.length; i++) {
      for (let j = i + 1; j < tapes.length; j++) {
        const a = tapes[i];
        const b = tapes[j];
        if (Math.abs(a.pos.z - b.pos.z) > TAPE_D * 0.9) continue;

        const dx = a.pos.x - b.pos.x;
        const dy = a.pos.y - b.pos.y;
        // A rolling tape sweeps its corners past its resting box; widen the
        // vertical extent by how much the two tilts disagree, so corners
        // cannot clip but parallel gliding neighbors do not false-collide.
        const tiltReach = Math.abs(Math.sin(a.roll - b.roll)) * TAPE_W * 0.5;
        const spanX = TAPE_W + pad - Math.abs(dx);
        const spanY = TAPE_H + tiltReach + pad - Math.abs(dy);
        if (spanX <= 0 || spanY <= 0) continue;

        overlapping = true;
        pushed = true;
        const axis = spanX < spanY ? "x" : "y";
        const amount = Math.min(spanX, spanY);
        const dir = (axis === "x" ? dx : dy) >= 0 ? 1 : -1;

        const rankA = MODE_RANK[a.mode];
        const rankB = MODE_RANK[b.mode];
        const movers = rankA === rankB ? [a, b] : rankA < rankB ? [a] : [b];
        for (const mover of movers) {
          const sign = mover === a ? dir : -dir;
          mover.pos[axis] += (sign * amount) / movers.length;
          mover.pos[axis] = THREE.MathUtils.clamp(mover.pos[axis], -BOUNDS[axis], BOUNDS[axis]);
          // Kill velocity pointing back into the contact so the spring does
          // not wind up and snap once the blocker moves on.
          if (mover.vel[axis] * sign < 0) mover.vel[axis] = 0;
        }
      }
    }

    if (!overlapping) break;
  }

  return pushed;
}

function drawLabel(canvas: HTMLCanvasElement, tape: TapeSpec) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  // The canvas is 2× the logical size; draw in logical coordinates so the
  // texture stays crisp when the tape renders large or the page is zoomed.
  const w = canvas.width / 2;
  const h = canvas.height / 2;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(2, 0, 0, 2, 0, 0);

  // Glossy colored plastic face with rounded corners; everything clips to it.
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, 18);
  const face = ctx.createLinearGradient(0, 0, 0, h);
  face.addColorStop(0, tape.light);
  face.addColorStop(0.55, tape.base);
  face.addColorStop(1, tape.deep);
  ctx.fillStyle = face;
  ctx.fill();
  ctx.save();
  ctx.clip();

  // Paper sticker with ruled lines, like the classic VHS label.
  ctx.save();
  ctx.translate(w / 2, 92);
  ctx.rotate(-0.012);
  ctx.shadowColor = "rgba(20, 30, 50, 0.28)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = "#fcfbf6";
  ctx.beginPath();
  ctx.roundRect(-192, -58, 384, 116, 7);
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "rgba(205, 95, 95, 0.55)";
  ctx.beginPath();
  ctx.moveTo(-176, -22);
  ctx.lineTo(176, -22);
  ctx.stroke();
  ctx.strokeStyle = "rgba(95, 125, 195, 0.45)";
  for (const y of [14, 44]) {
    ctx.beginPath();
    ctx.moveTo(-176, y);
    ctx.lineTo(176, y);
    ctx.stroke();
  }
  // Handwriting sits on the middle rule, pen-blue.
  ctx.fillStyle = "#2c3a60";
  ctx.font = "58px 'Cedarville Cursive', cursive";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(tape.title, 0, 8);
  ctx.restore();

  // Window: smoked glass with the wound reels and ribbon showing through,
  // printed to match the real internals behind the shell face.
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(w / 2 - 150, 182, 300, 72, 10);
  ctx.clip();
  ctx.fillStyle = "rgba(18, 23, 33, 0.6)";
  ctx.fillRect(w / 2 - 150, 182, 300, 72);
  for (const x of [-133, 133]) {
    ctx.fillStyle = "#252b37";
    ctx.beginPath();
    ctx.arc(w / 2 + x, 181, 112, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#dfe5ec";
    ctx.beginPath();
    ctx.arc(w / 2 + x, 181, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1a1f29";
    ctx.beginPath();
    ctx.arc(w / 2 + x, 181, 12, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#12151c";
  ctx.fillRect(w / 2 - 96, 236, 192, 13);
  ctx.restore();
  ctx.beginPath();
  ctx.roundRect(w / 2 - 150, 182, 300, 72, 10);
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(22, 28, 40, 0.35)";
  ctx.stroke();

  // Aero gloss: a bright sheen hugging the top with a curved lower edge.
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w, 0);
  ctx.lineTo(w, 52);
  ctx.quadraticCurveTo(w / 2, 104, 0, 62);
  ctx.closePath();
  const gloss = ctx.createLinearGradient(0, 0, 0, 104);
  gloss.addColorStop(0, "rgba(255, 255, 255, 0.7)");
  gloss.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = gloss;
  ctx.fill();

  ctx.restore();
}

function makeLabelTexture(tape: TapeSpec) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 560;
  drawLabel(canvas, tape);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

// Soft elliptical blob for the contact shadows under resting tapes.
function makeShadowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.translate(128, 32);
    ctx.scale(1, 0.25);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 126);
    g.addColorStop(0, "rgba(20, 26, 38, 1)");
    g.addColorStop(1, "rgba(20, 26, 38, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, 126, 0, Math.PI * 2);
    ctx.fill();
  }
  return new THREE.CanvasTexture(canvas);
}

function TapeScene() {
  const invalidate = useThree((state) => state.invalidate);
  const gl = useThree((state) => state.gl);
  const shadowMats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);

  const springs = useMemo(() => {
    const map = new Map<string, TapeSpring>();
    TAPES.forEach((tape, index) => {
      map.set(tape.id, {
        mode: "rest",
        pos: HOMES[index].pos.clone(),
        vel: new THREE.Vector3(),
        target: HOMES[index].pos.clone(),
        roll: HOMES[index].roll,
        rollT: HOMES[index].roll,
        yaw: 0,
        yawT: 0,
        grab: new THREE.Vector3(),
        home: HOMES[index],
        object: null,
      });
    });
    return map;
  }, []);

  const shadowTexture = useMemo(() => makeShadowTexture(), []);
  useEffect(() => () => shadowTexture.dispose(), [shadowTexture]);

  const dragPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), -HOMES[0].pos.z), []);
  const hit = useMemo(() => new THREE.Vector3(), []);
  const down = useRef<string | null>(null);

  const grabbable = (spring: TapeSpring) => spring.mode === "rest" || spring.mode === "return";

  const onPointerDown = (id: string) => (event: ThreeEvent<PointerEvent>) => {
    const spring = springs.get(id);
    if (!spring || !grabbable(spring)) return;
    event.stopPropagation();
    (event.target as Element).setPointerCapture(event.pointerId);
    // Grab where the cursor actually hit, so the tape hangs from that point
    // instead of snapping its center to the pointer.
    if (event.ray.intersectPlane(dragPlane, hit)) {
      spring.grab.copy(hit).sub(spring.pos);
    }
    down.current = id;
    spring.mode = "drag";
    spring.target.copy(spring.pos);
    spring.yawT = 0;
    gl.domElement.style.cursor = "grabbing";
    invalidate();
  };

  const onPointerMove = (id: string) => (event: ThreeEvent<PointerEvent>) => {
    const spring = springs.get(id);
    if (!spring || spring.mode !== "drag" || down.current !== id) return;
    event.stopPropagation();
    if (event.ray.intersectPlane(dragPlane, hit)) {
      spring.target.set(
        THREE.MathUtils.clamp(hit.x - spring.grab.x, -BOUNDS.x, BOUNDS.x),
        THREE.MathUtils.clamp(hit.y - spring.grab.y, -BOUNDS.y, BOUNDS.y),
        spring.pos.z,
      );
    }
    invalidate();
  };

  const onPointerUp = (id: string) => (event: ThreeEvent<PointerEvent>) => {
    const spring = springs.get(id);
    if (!spring || spring.mode !== "drag") return;
    event.stopPropagation();
    (event.target as Element).releasePointerCapture(event.pointerId);
    down.current = null;
    spring.mode = "return";
    spring.target.copy(spring.home.pos);
    gl.domElement.style.cursor = "auto";
    invalidate();
  };

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30);
    let resting = true;

    for (const spring of springs.values()) {
      if (!spring.object) continue;

      const snappy = spring.mode === "drag";
      stepSpring(spring, snappy ? 380 : 150, snappy ? 34 : 22, dt);

      // Velocity tilts the tape in the hand; it levels out as motion settles.
      spring.rollT =
        spring.mode === "rest"
          ? spring.home.roll
          : THREE.MathUtils.clamp(-spring.vel.x * 0.028, -0.16, 0.16);
      spring.roll = THREE.MathUtils.damp(spring.roll, spring.rollT, 12, dt);
      spring.yaw = THREE.MathUtils.damp(spring.yaw, spring.yawT, 10, dt);
    }

    // Solid tapes: separate overlaps before positions reach the meshes.
    const mounted = [...springs.values()].filter((spring) => spring.object);
    if (resolveTapeCollisions(mounted)) resting = false;

    // Contact shadows fade out as their tape lifts away from home.
    mounted.forEach((spring, index) => {
      const material = shadowMats.current[index];
      if (!material) return;
      const away = Math.hypot(
        spring.pos.x - spring.home.pos.x,
        spring.pos.y - spring.home.pos.y,
      );
      material.opacity = 0.3 * THREE.MathUtils.clamp(1 - away * 1.4, 0, 1);
    });

    for (const spring of springs.values()) {
      const object = spring.object;
      if (!object) continue;

      object.position.copy(spring.pos);
      object.rotation.set(0, spring.yaw, spring.roll);

      const done =
        settled(spring) &&
        Math.abs(spring.roll - spring.rollT) < 0.004 &&
        Math.abs(spring.yaw - spring.yawT) < 0.004;
      if (!done) {
        resting = false;
        continue;
      }

      if (spring.mode === "return") {
        spring.mode = "rest";
        spring.pos.copy(spring.target);
        spring.vel.set(0, 0, 0);
      }
    }

    if (!resting) invalidate();
  });

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[2, 4, 6]} intensity={0.55} />

      {HOMES.map((home, index) => (
        <mesh
          key={home.pos.x}
          position={[home.pos.x, home.pos.y - TAPE_H / 2 - 0.05, home.pos.z - 0.02]}
        >
          <planeGeometry args={[0.82, 0.2]} />
          <meshBasicMaterial
            ref={(material) => {
              shadowMats.current[index] = material;
            }}
            map={shadowTexture}
            transparent
            opacity={0.3}
            depthWrite={false}
          />
        </mesh>
      ))}

      {TAPES.map((tape) => (
        <Tape
          key={tape.id}
          tape={tape}
          spring={springs.get(tape.id)!}
          onPointerDown={onPointerDown(tape.id)}
          onPointerMove={onPointerMove(tape.id)}
          onPointerUp={onPointerUp(tape.id)}
        />
      ))}
    </>
  );
}

function Tape({
  tape,
  spring,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  tape: TapeSpec;
  spring: TapeSpring;
  onPointerDown: (event: ThreeEvent<PointerEvent>) => void;
  onPointerMove: (event: ThreeEvent<PointerEvent>) => void;
  onPointerUp: (event: ThreeEvent<PointerEvent>) => void;
}) {
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);
  const label = useMemo(() => makeLabelTexture(tape), [tape]);

  // Canvas 2D never triggers a webfont download on its own; fetch the label
  // face explicitly and redraw once it lands.
  useEffect(() => {
    let cancelled = false;
    document.fonts?.load("58px 'Cedarville Cursive'").then(() => {
      if (cancelled) return;
      drawLabel(label.image as HTMLCanvasElement, tape);
      label.needsUpdate = true;
      invalidate();
    });
    return () => {
      cancelled = true;
      label.dispose();
    };
  }, [label, tape, invalidate]);

  return (
    <group
      ref={(object) => {
        spring.object = object;
        object?.position.copy(spring.pos);
        if (object) object.rotation.z = spring.roll;
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerOver={() => {
        if (spring.mode === "rest" || spring.mode === "return") {
          gl.domElement.style.cursor = "grab";
          // The resting tape yaws a touch on hover — the moment the flat
          // illustration turns out to be a 3D object.
          spring.yawT = 0.22;
          invalidate();
        }
      }}
      onPointerOut={() => {
        if (spring.mode !== "drag") gl.domElement.style.cursor = "auto";
        spring.yawT = 0;
        invalidate();
      }}
    >
      <group scale={TAPE_SCALE}>
        {/* Real internals: wound reels, hubs and the ribbon along the front —
            visible through the window glass and the translucent shell. */}
        <group position={[0, -0.03, 0]}>
          {[-0.26, 0.26].map((x) => (
            <group key={x} position={[x, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <mesh>
                <cylinderGeometry args={[0.225, 0.225, 0.09, 32]} />
                <meshLambertMaterial color="#1c212b" />
              </mesh>
              <mesh>
                <cylinderGeometry args={[0.07, 0.07, 0.1, 24]} />
                <meshLambertMaterial color="#e6ebf1" />
              </mesh>
            </group>
          ))}
          <mesh position={[0, -0.19, 0.055]}>
            <boxGeometry args={[0.62, 0.1, 0.012]} />
            <meshLambertMaterial color="#141820" />
          </mesh>
        </group>

        {/* Slightly transparent shell: the internals ghost through the sides
            while the label plane keeps the face solid. */}
        <RoundedBox args={[BASE_W, BASE_H, BASE_D]} radius={0.02} smoothness={4}>
          <meshLambertMaterial color={tape.base} transparent opacity={0.85} />
        </RoundedBox>
        <mesh position={[0, 0, BASE_D / 2 + 0.002]}>
          <planeGeometry args={[BASE_W * 0.94, BASE_H * 0.94]} />
          {/* Basic + untonemapped: the label keeps its full candy saturation
              instead of being washed grey by ACES filmic. */}
          <meshBasicMaterial map={label} transparent toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

// The 18° fov is vertical, so on a tall mobile canvas the visible width
// collapses and the tape row overflows the frame. Zoom out with the aspect
// ratio until the row (homes ±0.85 plus half a tape) fits the width;
// landscape/desktop stays at zoom 1.
function FitTapeRow() {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    camera.zoom = Math.min(1, size.width / size.height);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, size, invalidate]);

  return null;
}

export const VideoTapes = () => (
  <div className="absolute inset-0">
    <Canvas
      frameloop="demand"
      flat
      dpr={[1, 3]}
      resize={{ offsetSize: true }}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 1.35, 9], fov: 18 }}
      onCreated={(state) => state.camera.lookAt(0, 0, 0)}
      style={{ touchAction: "none" }}
    >
      <FitTapeRow />
      <TapeScene />
    </Canvas>
  </div>
);
