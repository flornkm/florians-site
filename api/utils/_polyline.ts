// Pure route geometry — no Firebase/Strava IO, so it's safe to import and unit-test in isolation.

// Longest edge of the normalized route, in viewBox units.
const VIEWBOX_SIZE = 100;

export type RoutePath = { d: string; w: number; h: number };

// Google encoded-polyline algorithm (precision 5) → [lat, lng] pairs.
export function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    result = 0;
    shift = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}

// Project to a coordinate-free SVG path: absolute lat/lng are discarded, only the
// translated + uniformly-scaled shape survives, so no location can be recovered.
export function toNormalizedPath(points: [number, number][]): RoutePath | null {
  if (points.length < 2) return null;

  const meanLat = points.reduce((sum, [lat]) => sum + lat, 0) / points.length;
  const cosLat = Math.cos((meanLat * Math.PI) / 180);

  const xs = points.map(([, lng]) => lng * cosLat);
  const ys = points.map(([lat]) => lat);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const spanX = Math.max(...xs) - minX || 1;
  const spanY = Math.max(...ys) - minY || 1;
  const scale = VIEWBOX_SIZE / Math.max(spanX, spanY);

  const h = +(spanY * scale).toFixed(1);
  const d = points
    .map(([lat, lng], i) => {
      const x = ((lng * cosLat - minX) * scale).toFixed(1);
      // Flip Y: SVG grows downward, latitude grows upward.
      const y = (h - (lat - minY) * scale).toFixed(1);
      return `${i === 0 ? "M" : "L"}${x} ${y}`;
    })
    .join(" ");

  return { d, w: +(spanX * scale).toFixed(1), h };
}
