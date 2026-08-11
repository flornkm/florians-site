// SFX for the Claude 2010 room, same Howler setup as the slop detector.
// door.mp3 is trimmed from the public-domain "Door handle creaking" recording on
// Wikimedia Commons; everything else is synthesized with ffmpeg (no copyright).
import { Howl } from "howler";

const AUDIO = "/audio/claude-2010";

const SPECS = {
  door: 0.6,
  click: 0.5,

  squeak: 0.55,
  thump: 0.6,
  kick: 0.6,
  whoosh: 0.9,
  static: 0.35,
  chirp: 0.4,
  winclick: 0.45,
  blip: 0.45,
} as const;

export type SfxName = keyof typeof SPECS;

let sfx: Partial<Record<SfxName, Howl>> | null = null;
let rain: Howl | null = null;
let birds: Howl | null = null;
let tvLoop: Howl | null = null;
let ringLoop: Howl | null = null;

function ensure() {
  if (sfx) return;
  sfx = {};
  for (const [name, volume] of Object.entries(SPECS)) {
    sfx[name as SfxName] = new Howl({ src: [`${AUDIO}/${name}.mp3`], volume, preload: true });
  }
}

export function play(name: SfxName) {
  ensure();
  sfx?.[name]?.play();
}

export function setAmbience(kind: "rain" | "birds" | null) {
  if (kind === "rain" && !rain) {
    rain = new Howl({ src: [`${AUDIO}/rain.mp3`], volume: 0.14, loop: true, preload: true });
  }
  if (kind === "birds" && !birds) {
    birds = new Howl({ src: [`${AUDIO}/birds.mp3`], volume: 0.08, loop: true, preload: true });
  }
  if (kind !== "rain") rain?.stop();
  if (kind !== "birds") birds?.stop();
  const target = kind === "rain" ? rain : kind === "birds" ? birds : null;
  if (target && !target.playing()) target.play();
}

export function setPhoneRing(on: boolean) {
  if (on && !ringLoop) {
    ringLoop = new Howl({ src: [`${AUDIO}/ring.mp3`], volume: 0.5, loop: true, preload: true });
  }
  if (on) {
    if (!ringLoop?.playing()) ringLoop?.play();
  } else {
    ringLoop?.stop();
  }
}

export function setTvLoop(on: boolean) {
  if (on && !tvLoop) {
    tvLoop = new Howl({
      src: ["/audio/claude-2010/static-loop.mp3"],
      volume: 0.1,
      loop: true,
      preload: true,
    });
  }
  if (on) {
    if (!tvLoop?.playing()) tvLoop?.play();
  } else {
    tvLoop?.stop();
  }
}
