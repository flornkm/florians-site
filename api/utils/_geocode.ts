const REVERSE_GEOCODE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

export type RunCountry = {
  // English country name, e.g. "Germany" / "United Arab Emirates".
  country: string | null;
  // ISO 3166-1 alpha-2, e.g. "DE" / "AE" — what filters key off.
  countryCode: string | null;
};

// Country for a run's start point from BigDataCloud's free reverse geocoder (no API key).
// Deliberately country-level only: the coordinate stays transient and nothing finer than
// the country is ever stored, so the location-safety of the feed holds. Nulls mean
// "unknown" (no GPS fix, or the geocoder was unreachable) — callers treat that as
// missing and simply retry on the next sync.
export async function fetchRunCountry(lat: number, lng: number): Promise<RunCountry> {
  const url = `${REVERSE_GEOCODE_URL}?latitude=${lat}&longitude=${lng}&localityLanguage=en`;

  try {
    const res = await fetch(url);
    if (!res.ok) return { country: null, countryCode: null };
    const data = (await res.json()) as { countryName?: string; countryCode?: string };
    const countryCode = data.countryCode || null;
    return {
      // The geocoder returns formal ISO names ("Netherlands (Kingdom of the)"); prefer the
      // common English name derived from the code, which is what a reader expects in a list.
      country: (countryCode && countryDisplayName(countryCode)) || data.countryName || null,
      countryCode,
    };
  } catch {
    return { country: null, countryCode: null };
  }
}

export function countryDisplayName(code: string): string | null {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? null;
  } catch {
    return null;
  }
}
