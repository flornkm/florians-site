import { useFrame } from "@react-three/fiber";
import { Howl } from "howler";
import { useEffect, useRef } from "react";
import { useStore } from "./lib/store";

const AUDIO = "/audio/slop-detector";

const TIERS: { url: string; max: number }[] = [
  { url: `${AUDIO}/normal.mp3`, max: 0.20 },
  { url: `${AUDIO}/medium.mp3`, max: 0.40 },
  { url: `${AUDIO}/high.mp3`, max: 0.62 },
  { url: `${AUDIO}/super-high.mp3`, max: 0.85 },
  { url: `${AUDIO}/ultra.mp3`, max: 1.01 },
];

const TIER_VOLUME = 0.5;
const FADE_MS = 240;
const CLICK_VOLUME = 0.55;

function tierFor(reading: number) {
  for (let i = 0; i < TIERS.length; i++) if (reading <= TIERS[i].max) return i;
  return TIERS.length - 1;
}

export function SoundManager() {
  const click = useRef<Howl | null>(null);
  const tracks = useRef<Howl[]>([]);
  const currentTier = useRef(-1);
  const wasPowered = useRef(false);

  useEffect(() => {
    click.current = new Howl({ src: [`${AUDIO}/click.mp3`], volume: CLICK_VOLUME, preload: true });
    tracks.current = TIERS.map(
      (t) => new Howl({ src: [t.url], loop: true, volume: 0, preload: true }),
    );
    return () => {
      click.current?.unload();
      tracks.current.forEach((t) => t.unload());
      tracks.current = [];
      currentTier.current = -1;
    };
  }, []);

  useFrame(() => {
    const { powered, reading } = useStore.getState();

    if (powered !== wasPowered.current) {
      wasPowered.current = powered;
      click.current?.play();
      if (!powered) {
        for (const t of tracks.current) {
          if (t.playing()) t.fade(t.volume(), 0, FADE_MS);
        }
        currentTier.current = -1;
      }
    }

    if (!powered) return;

    const next = tierFor(reading);
    if (next === currentTier.current) return;

    if (currentTier.current >= 0) {
      const prev = tracks.current[currentTier.current];
      prev.fade(prev.volume(), 0, FADE_MS);
    }
    const incoming = tracks.current[next];
    if (!incoming.playing()) incoming.play();
    incoming.fade(incoming.volume(), TIER_VOLUME, FADE_MS);
    currentTier.current = next;
  });

  return null;
}
