const HALF_LIFE_FRAMES = 30;
const NOISE = 0.18;

export function stepReading(prev: number, target: number) {
  const drift = (target - prev) / HALF_LIFE_FRAMES;
  const jitter = (Math.random() - 0.5) * NOISE;
  return Math.max(0, Math.min(1, prev + drift + jitter * 0.05));
}

export function formatCps(reading: number) {
  return Math.round(reading * 9999)
    .toString()
    .padStart(4, "0");
}
