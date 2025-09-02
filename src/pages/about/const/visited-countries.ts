export interface CountryData {
  name: string;
  iso_a2: string;
}

export const VISITED_COUNTRIES: CountryData[] = [
  { name: "Germany", iso_a2: "DE" },
  { name: "Italy", iso_a2: "IT" },
  { name: "Austria", iso_a2: "AT" },
  { name: "Switzerland", iso_a2: "CH" },
  { name: "England", iso_a2: "GB" },
  { name: "USA", iso_a2: "US" },
  { name: "Romania", iso_a2: "RO" },
  { name: "Croatia", iso_a2: "HR" },
  { name: "Greece", iso_a2: "GR" },
  { name: "United Arab Emirates", iso_a2: "AE" },
  { name: "Netherlands", iso_a2: "NL" },
  { name: "Belgium", iso_a2: "BE" },
  { name: "Bulgaria", iso_a2: "BG" },
  { name: "Spain", iso_a2: "ES" },
];

export const VISITED_COUNTRY_CODES = new Set(VISITED_COUNTRIES.map((country) => country.iso_a2));
export const VISITED_COUNTRY_NAMES = new Set(VISITED_COUNTRIES.map((country) => country.name));
