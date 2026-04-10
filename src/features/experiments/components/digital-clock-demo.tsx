import { AnimatePresence, motion } from "motion/react";
import { memo, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

type DigitCharacter = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
type GlyphCharacter = DigitCharacter | ":";
type GlyphRows = readonly [string, string, string, string, string, string, string];
type Listener = () => void;
type SlotStatus = "active" | "exiting";

interface AnimatedSlot {
  id: number;
  position: number;
  character: GlyphCharacter;
  status: SlotStatus;
  exitAt: number | null;
}

interface CityMarker {
  symbol: string;
  city: string;
  timezone: string;
  row: number;
  column: number;
}

interface LocalTimeInfo {
  hour: number;
  minute: number;
  second: number;
  hourText: string;
  minuteText: string;
  secondText: string;
}

interface GradientPreset {
  id: string;
  startHour: number;
  endHour: number;
  backgroundImage: string;
  foreground: string;
  footer: string;
  blendMode: "soft-light" | "screen" | "overlay";
}

const GLYPH_WIDTH = 5;
const GLYPH_HEIGHT = 7;
const FILLED_SLOT = "1";
const COLUMN_GAP = 0.16;
const ROW_GAP = 0.06;
const SLOT_WIDTH = "1ch";
const SLOT_HEIGHT = "1em";
const EXIT_DURATION_MS = 180;
const LAND_SLOT = "#";
const GLYPH_WIDTH_STYLE = `calc(${GLYPH_WIDTH} * ${SLOT_WIDTH} + ${GLYPH_WIDTH - 1} * ${COLUMN_GAP}em)`;
const GLYPH_HEIGHT_STYLE = `calc(${GLYPH_HEIGHT} * ${SLOT_HEIGHT} + ${GLYPH_HEIGHT - 1} * ${ROW_GAP}em)`;

const SLOT_MOVE_TRANSITION = {
  type: "spring",
  stiffness: 320,
  damping: 28,
  mass: 0.55,
} as const;

const SLOT_FADE_TRANSITION = {
  duration: EXIT_DURATION_MS / 1000,
  ease: [0.2, 0, 0, 1],
} as const;

const GLYPH_ROWS = {
  "0": ["11111", "10001", "10001", "10001", "10001", "10001", "11111"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["11111", "00001", "00001", "11111", "10000", "10000", "11111"],
  "3": ["11111", "00001", "00001", "01111", "00001", "00001", "11111"],
  "4": ["10001", "10001", "10001", "11111", "00001", "00001", "00001"],
  "5": ["11111", "10000", "10000", "11111", "00001", "00001", "11111"],
  "6": ["11111", "10000", "10000", "11111", "10001", "10001", "11111"],
  "7": ["11111", "00001", "00001", "00010", "00100", "00100", "00100"],
  "8": ["11111", "10001", "10001", "11111", "10001", "10001", "11111"],
  "9": ["11111", "10001", "10001", "11111", "00001", "00001", "11111"],
  ":": ["00000", "00100", "00000", "00000", "00100", "00000", "00000"],
} satisfies Record<GlyphCharacter, GlyphRows>;

const GLYPH_POSITIONS: Record<GlyphCharacter, readonly number[]> = {
  "0": getFilledPositions(GLYPH_ROWS["0"]),
  "1": getFilledPositions(GLYPH_ROWS["1"]),
  "2": getFilledPositions(GLYPH_ROWS["2"]),
  "3": getFilledPositions(GLYPH_ROWS["3"]),
  "4": getFilledPositions(GLYPH_ROWS["4"]),
  "5": getFilledPositions(GLYPH_ROWS["5"]),
  "6": getFilledPositions(GLYPH_ROWS["6"]),
  "7": getFilledPositions(GLYPH_ROWS["7"]),
  "8": getFilledPositions(GLYPH_ROWS["8"]),
  "9": getFilledPositions(GLYPH_ROWS["9"]),
  ":": getFilledPositions(GLYPH_ROWS[":"]),
};

const WORLD_MAP_ROWS = [
  "........................................................",
  "...##########.............######........................",
  "..############...........########...........######......",
  "..############..........##########........##########....",
  "...##########............########........###########....",
  ".....######...............######........############....",
  "......####..............................###########.....",
  "..............#####......................#########......",
  ".............#######......................######........",
  ".............#######.............#####..................",
  "..............#####............#########..........###...",
  "...............###............###########........#####..",
  "..............................###########........#####..",
  "...............................#########..........###...",
  "................................#####...................",
  "........................................................",
] as const;

const WORLD_MAP_COLUMNS = WORLD_MAP_ROWS.reduce(
  (maxColumns, row) => Math.max(maxColumns, row.length),
  0,
);

const CITY_MARKERS: readonly CityMarker[] = [
  createCityMarker("New York", "America/New_York", 3, 11),
  createCityMarker("Vancouver", "America/Vancouver", 2, 5),
  createCityMarker("São Paulo", "America/Sao_Paulo", 10, 16),
  createCityMarker("Quito", "America/Guayaquil", 9, 14),
  createCityMarker("London", "Europe/London", 2, 29),
  createCityMarker("Paris", "Europe/Paris", 3, 32),
  createCityMarker("Cairo", "Africa/Cairo", 10, 31),
  createCityMarker("Johannesburg", "Africa/Johannesburg", 12, 34),
  createCityMarker("Delhi", "Asia/Kolkata", 5, 43),
  createCityMarker("Tokyo", "Asia/Tokyo", 3, 48),
  createCityMarker("Auckland", "Pacific/Auckland", 11, 50),
  createCityMarker("Melbourne", "Australia/Melbourne", 12, 52),
];

const CITY_MARKERS_BY_CELL = CITY_MARKERS.reduce((map, marker) => {
  map.set(getCellKey(marker.row, marker.column), marker);
  return map;
}, new Map<string, CityMarker>());

const TIME_GRADIENT_PRESETS: readonly GradientPreset[] = [
  {
    id: "midnight",
    startHour: 0,
    endHour: 5,
    blendMode: "screen",
    foreground: "oklch(0.96 0.02 250)",
    footer: "oklch(0.88 0.01 250)",
    backgroundImage:
      "radial-gradient(120% 95% at 50% 115%, oklch(0.36 0.07 260 / 0.42) 0%, transparent 58%), linear-gradient(180deg, oklch(0.18 0.03 260) 0%, oklch(0.12 0.02 252) 100%)",
  },
  {
    id: "dawn",
    startHour: 5,
    endHour: 6.5,
    blendMode: "overlay",
    foreground: "oklch(0.92 0.03 245)",
    footer: "oklch(0.83 0.02 240)",
    backgroundImage:
      "radial-gradient(130% 90% at 50% 110%, oklch(0.82 0.08 78 / 0.65) 0%, transparent 56%), linear-gradient(180deg, oklch(0.34 0.05 278) 0%, oklch(0.2 0.03 260) 100%)",
  },
  {
    id: "sunrise",
    startHour: 6.5,
    endHour: 8,
    blendMode: "soft-light",
    foreground: "oklch(0.2 0.03 255)",
    footer: "oklch(0.32 0.02 250)",
    backgroundImage:
      "radial-gradient(125% 95% at 50% 108%, oklch(0.86 0.1 75 / 0.82) 0%, transparent 53%), linear-gradient(180deg, oklch(0.95 0.02 230) 0%, oklch(0.73 0.06 245) 100%)",
  },
  {
    id: "morning",
    startHour: 8,
    endHour: 11,
    blendMode: "soft-light",
    foreground: "oklch(0.23 0.03 245)",
    footer: "oklch(0.36 0.02 240)",
    backgroundImage:
      "radial-gradient(130% 85% at 60% -10%, oklch(0.98 0.03 105 / 0.85) 0%, transparent 54%), linear-gradient(180deg, oklch(0.95 0.02 220) 0%, oklch(0.86 0.03 195) 100%)",
  },
  {
    id: "noon",
    startHour: 11,
    endHour: 14,
    blendMode: "soft-light",
    foreground: "oklch(0.26 0.02 240)",
    footer: "oklch(0.4 0.02 235)",
    backgroundImage:
      "radial-gradient(115% 85% at 50% -12%, oklch(0.99 0.02 110 / 0.72) 0%, transparent 56%), linear-gradient(180deg, oklch(0.94 0.02 205) 0%, oklch(0.89 0.02 170) 100%)",
  },
  {
    id: "afternoon",
    startHour: 14,
    endHour: 17,
    blendMode: "soft-light",
    foreground: "oklch(0.24 0.02 235)",
    footer: "oklch(0.38 0.02 230)",
    backgroundImage:
      "radial-gradient(120% 85% at 70% -6%, oklch(0.95 0.04 85 / 0.48) 0%, transparent 58%), linear-gradient(180deg, oklch(0.9 0.02 200) 0%, oklch(0.8 0.03 155) 100%)",
  },
  {
    id: "sunset",
    startHour: 17,
    endHour: 19,
    blendMode: "overlay",
    foreground: "oklch(0.93 0.03 60)",
    footer: "oklch(0.86 0.02 70)",
    backgroundImage:
      "radial-gradient(130% 100% at 50% 112%, oklch(0.8 0.14 45 / 0.78) 0%, transparent 55%), linear-gradient(180deg, oklch(0.78 0.07 330) 0%, oklch(0.48 0.08 300) 100%)",
  },
  {
    id: "dusk",
    startHour: 19,
    endHour: 21,
    blendMode: "screen",
    foreground: "oklch(0.94 0.02 275)",
    footer: "oklch(0.86 0.02 270)",
    backgroundImage:
      "radial-gradient(125% 95% at 50% 108%, oklch(0.62 0.08 30 / 0.42) 0%, transparent 58%), linear-gradient(180deg, oklch(0.38 0.06 288) 0%, oklch(0.24 0.03 268) 100%)",
  },
  {
    id: "night",
    startHour: 21,
    endHour: 24,
    blendMode: "screen",
    foreground: "oklch(0.95 0.02 252)",
    footer: "oklch(0.86 0.01 252)",
    backgroundImage:
      "radial-gradient(120% 88% at 50% 118%, oklch(0.34 0.06 255 / 0.38) 0%, transparent 60%), linear-gradient(180deg, oklch(0.2 0.03 258) 0%, oklch(0.14 0.02 248) 100%)",
  },
];

let timeoutId: number | null = null;
const listeners = new Set<Listener>();
const timeFormatterCache = new Map<string, Intl.DateTimeFormat>();

function createCityMarker(city: string, timezone: string, row: number, column: number): CityMarker {
  return {
    symbol: city[0]?.toUpperCase() ?? "?",
    city,
    timezone,
    row,
    column,
  };
}

function getCellKey(row: number, column: number) {
  return `${row}:${column}`;
}

function getFilledPositions(rows: GlyphRows) {
  const positions: number[] = [];

  rows.forEach((row, rowIndex) => {
    row.split("").forEach((slot, columnIndex) => {
      if (slot === FILLED_SLOT) {
        positions.push(rowIndex * GLYPH_WIDTH + columnIndex);
      }
    });
  });

  return positions;
}

function getDelayToNextSecond(now: Date) {
  return 1000 - now.getMilliseconds();
}

function notifyListeners() {
  for (const listener of listeners) {
    listener();
  }
}

function scheduleNextTick() {
  if (typeof window === "undefined") return;

  timeoutId = window.setTimeout(() => {
    timeoutId = null;
    notifyListeners();

    if (listeners.size > 0) {
      scheduleNextTick();
    }
  }, getDelayToNextSecond(new Date()));
}

function subscribe(listener: Listener) {
  listeners.add(listener);

  if (listeners.size === 1 && timeoutId === null) {
    scheduleNextTick();
  }

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0 && timeoutId !== null) {
      window.clearTimeout(timeoutId);
      timeoutId = null;
    }
  };
}

function getSnapshot() {
  return Date.now();
}

function getMinuteSnapshot() {
  return Math.floor(Date.now() / 60000);
}

function getFormatter(timezone: string) {
  const cachedFormatter = timeFormatterCache.get(timezone);
  if (cachedFormatter) return cachedFormatter;

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  timeFormatterCache.set(timezone, formatter);

  return formatter;
}

function getLocalTimeInfo(timestamp: number, timezone: string): LocalTimeInfo {
  const parts = getFormatter(timezone).formatToParts(new Date(timestamp));
  let hourText = "00";
  let minuteText = "00";
  let secondText = "00";

  for (const part of parts) {
    if (part.type === "hour") hourText = part.value;
    if (part.type === "minute") minuteText = part.value;
    if (part.type === "second") secondText = part.value;
  }

  const hour = Number.parseInt(hourText, 10) || 0;
  const minute = Number.parseInt(minuteText, 10) || 0;
  const second = Number.parseInt(secondText, 10) || 0;

  return {
    hour: Math.min(23, Math.max(0, hour)),
    minute: Math.min(59, Math.max(0, minute)),
    second: Math.min(59, Math.max(0, second)),
    hourText,
    minuteText,
    secondText,
  };
}

function getTimeGradientPreset(localTime: LocalTimeInfo): GradientPreset {
  const localHourValue = localTime.hour + localTime.minute / 60 + localTime.second / 3600;

  for (const preset of TIME_GRADIENT_PRESETS) {
    if (localHourValue >= preset.startHour && localHourValue < preset.endHour) {
      return preset;
    }
  }

  return TIME_GRADIENT_PRESETS[0];
}

function getWorldMapGradientStyle(minuteTick: number) {
  const timestamp = minuteTick * 60000;
  const date = new Date(timestamp);
  const utcHour = date.getUTCHours() + date.getUTCMinutes() / 60;
  const subsolarLongitude = (((12 - utcHour) * 15 + 540) % 360) - 180;
  const brightX = ((subsolarLongitude + 180) / 360) * 100;
  const darkX = (brightX + 50) % 100;
  const violetX = (brightX + 20) % 100;

  return {
    backgroundColor: "oklch(0.84 0.014 236)",
    backgroundImage: [
      "linear-gradient(126deg, oklch(0.88 0.028 162) 0%, oklch(0.74 0.036 300) 58%, oklch(0.18 0.024 255) 100%)",
      `radial-gradient(138% 122% at ${brightX.toFixed(2)}% 64%, oklch(0.93 0.055 150 / 0.54) 0%, oklch(0.86 0.03 184 / 0.24) 38%, transparent 76%)`,
      `radial-gradient(118% 96% at ${violetX.toFixed(2)}% 30%, oklch(0.78 0.055 304 / 0.34) 0%, transparent 72%)`,
      `radial-gradient(148% 132% at ${darkX.toFixed(2)}% 44%, oklch(0.16 0.02 256 / 0.54) 0%, oklch(0.3 0.02 260 / 0.2) 50%, transparent 82%)`,
      `radial-gradient(116% 108% at ${(darkX + 7) % 100}% 83%, oklch(0.13 0.018 250 / 0.58) 0%, transparent 68%)`,
      "radial-gradient(170% 132% at 50% 54%, oklch(0.91 0.008 250 / 0.16) 0%, transparent 42%)",
      "radial-gradient(180% 140% at 52% 56%, transparent 36%, oklch(0.12 0.012 252 / 0.16) 100%)",
    ].join(", "),
  };
}

function getCityFocusPoint(city: CityMarker) {
  return {
    x: city.column / (WORLD_MAP_COLUMNS - 1),
    y: city.row / (WORLD_MAP_ROWS.length - 1),
  };
}

function getWorldMapCityPreviewLayers(timestamp: number) {
  return CITY_MARKERS.map((city) => {
    const localTime = getLocalTimeInfo(timestamp, city.timezone);
    const preset = getTimeGradientPreset(localTime);
    const focus = getCityFocusPoint(city);
    const centerX = (focus.x * 100).toFixed(2);
    const centerY = (focus.y * 100).toFixed(2);
    const maskImage = `radial-gradient(36% 30% at ${centerX}% ${centerY}%, oklch(0 0 0 / 0.82) 0%, oklch(0 0 0 / 0.48) 38%, oklch(0 0 0 / 0.12) 62%, oklch(0 0 0 / 0) 82%)`;

    return {
      key: city.city,
      backgroundImage: preset.backgroundImage,
      backgroundColor: "oklch(0.96 0.004 240)",
      maskImage,
    };
  });
}

function getPositionDistance(from: number, to: number) {
  const fromColumn = from % GLYPH_WIDTH;
  const fromRow = Math.floor(from / GLYPH_WIDTH);
  const toColumn = to % GLYPH_WIDTH;
  const toRow = Math.floor(to / GLYPH_WIDTH);

  return Math.abs(fromColumn - toColumn) + Math.abs(fromRow - toRow);
}

function matchSlotsToPositions(slots: readonly AnimatedSlot[], positions: readonly number[]) {
  const matches: Array<{ slotIndex: number; positionIndex: number }> = [];
  const candidates: Array<{ slotIndex: number; positionIndex: number; distance: number }> = [];
  const usedSlotIndexes = new Set<number>();
  const usedPositionIndexes = new Set<number>();

  slots.forEach((slot, slotIndex) => {
    positions.forEach((position, positionIndex) => {
      candidates.push({
        slotIndex,
        positionIndex,
        distance: getPositionDistance(slot.position, position),
      });
    });
  });

  candidates.sort((left, right) => left.distance - right.distance);

  for (const candidate of candidates) {
    if (
      usedSlotIndexes.has(candidate.slotIndex) ||
      usedPositionIndexes.has(candidate.positionIndex)
    ) {
      continue;
    }

    usedSlotIndexes.add(candidate.slotIndex);
    usedPositionIndexes.add(candidate.positionIndex);
    matches.push({ slotIndex: candidate.slotIndex, positionIndex: candidate.positionIndex });
  }

  return { matches, usedPositionIndexes };
}

function useAnimatedGlyphSlots(glyph: GlyphCharacter) {
  const positions = GLYPH_POSITIONS[glyph];
  const nextIdRef = useRef(0);
  const [slots, setSlots] = useState<AnimatedSlot[]>(() =>
    positions.map((position) => ({
      id: nextIdRef.current++,
      position,
      character: glyph,
      status: "active",
      exitAt: null,
    })),
  );

  useEffect(() => {
    const nextExitAt = Date.now() + EXIT_DURATION_MS;

    setSlots((currentSlots) => {
      const activeSlots: AnimatedSlot[] = [];
      const alreadyExitingSlots: AnimatedSlot[] = [];

      for (const slot of currentSlots) {
        if (slot.status === "active") {
          activeSlots.push(slot);
          continue;
        }

        alreadyExitingSlots.push(slot);
      }

      const { matches, usedPositionIndexes } = matchSlotsToPositions(activeSlots, positions);
      const matchedSlotIndexes = new Set(matches.map((match) => match.slotIndex));

      const nextSlots: AnimatedSlot[] = [];

      for (const match of matches) {
        const sourceSlot = activeSlots[match.slotIndex];
        nextSlots.push({
          id: sourceSlot.id,
          position: positions[match.positionIndex],
          character: glyph,
          status: "active",
          exitAt: null,
        });
      }

      positions.forEach((position, positionIndex) => {
        if (usedPositionIndexes.has(positionIndex)) return;

        nextSlots.push({
          id: nextIdRef.current++,
          position,
          character: glyph,
          status: "active",
          exitAt: null,
        });
      });

      activeSlots.forEach((slot, slotIndex) => {
        if (matchedSlotIndexes.has(slotIndex)) return;

        nextSlots.push({
          id: slot.id,
          position: slot.position,
          character: slot.character,
          status: "exiting",
          exitAt: nextExitAt,
        });
      });

      return [...nextSlots, ...alreadyExitingSlots];
    });
  }, [glyph, positions]);

  useEffect(() => {
    let nearestExitAt: number | null = null;

    slots.forEach((slot) => {
      if (slot.status !== "exiting" || slot.exitAt === null) return;
      if (nearestExitAt === null || slot.exitAt < nearestExitAt) {
        nearestExitAt = slot.exitAt;
      }
    });

    if (nearestExitAt === null) return;

    const delay = Math.max(0, nearestExitAt - Date.now());
    const cleanupId = window.setTimeout(() => {
      const now = Date.now();
      setSlots((currentSlots) =>
        currentSlots.filter((slot) => {
          if (slot.status !== "exiting") return true;
          if (slot.exitAt === null) return true;
          return slot.exitAt > now;
        }),
      );
    }, delay + 16);

    return () => window.clearTimeout(cleanupId);
  }, [slots]);

  return slots;
}

function getSlotStyle(position: number) {
  const column = position % GLYPH_WIDTH;
  const row = Math.floor(position / GLYPH_WIDTH);

  return {
    left: `calc(${column} * (${SLOT_WIDTH} + ${COLUMN_GAP}em))`,
    top: `calc(${row} * (${SLOT_HEIGHT} + ${ROW_GAP}em))`,
    width: SLOT_WIDTH,
    height: SLOT_HEIGHT,
  };
}

function WorldMapSelector({
  hoveredSymbol,
  onHover,
  onLeave,
  onSelect,
}: {
  hoveredSymbol: string | null;
  onHover(symbol: string): void;
  onLeave(): void;
  onSelect(marker: CityMarker): void;
}) {
  const minuteTick = useSyncExternalStore(subscribe, getMinuteSnapshot, getMinuteSnapshot);
  const timestamp = minuteTick * 60000;
  const worldMapGradientStyle = useMemo(() => getWorldMapGradientStyle(minuteTick), [minuteTick]);
  const cityPreviewLayers = useMemo(() => getWorldMapCityPreviewLayers(timestamp), [timestamp]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[inherit]">
      <div aria-hidden="true" className="absolute inset-0" style={worldMapGradientStyle} />
      {cityPreviewLayers.map((layer) => (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          key={layer.key}
          style={{
            backgroundColor: layer.backgroundColor,
            backgroundImage: layer.backgroundImage,
            maskImage: layer.maskImage,
            WebkitMaskImage: layer.maskImage,
          }}
        />
      ))}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(125% 110% at 50% 50%, oklch(0.88 0.01 245 / 0.2) 0%, transparent 60%), radial-gradient(155% 120% at 50% 50%, transparent 38%, oklch(0.09 0.01 252 / 0.14) 100%)",
        }}
      />

      <div className="relative z-10 flex h-full w-full items-center justify-center px-4 py-5">
        <div
          className="mx-auto grid w-max gap-x-[0.22em] gap-y-[0.12em] font-mono text-[oklch(0.24_0.01_255/0.72)] text-[clamp(0.35rem,0.9vw,0.55rem)] leading-none mix-blend-multiply sm:text-[clamp(0.28rem,1vw,0.65rem)]"
          role="grid"
          style={{ gridTemplateColumns: `repeat(${WORLD_MAP_COLUMNS}, minmax(0, 1ch))` }}
        >
          {WORLD_MAP_ROWS.map((row, rowIndex) =>
            Array.from({ length: WORLD_MAP_COLUMNS }, (_, columnIndex) => {
              const marker = CITY_MARKERS_BY_CELL.get(getCellKey(rowIndex, columnIndex));

              if (marker) {
                const isHighlighted = hoveredSymbol === marker.symbol;
                const isDimmed = hoveredSymbol !== null && !isHighlighted;

                return (
                  <button
                    aria-label={`${marker.city} (${marker.timezone})`}
                    className={[
                      "inline-flex h-[1em] w-[1ch] cursor-pointer items-center justify-center rounded-[2px] font-mono tabular-nums transition-all duration-150",
                      isHighlighted
                        ? "bg-[oklch(0.82_0.02_250/0.32)] opacity-100"
                        : "bg-transparent",
                      isDimmed ? "opacity-30" : "opacity-95",
                    ].join(" ")}
                    key={getCellKey(rowIndex, columnIndex)}
                    onBlur={onLeave}
                    onClick={() => onSelect(marker)}
                    onFocus={() => onHover(marker.symbol)}
                    onMouseEnter={() => onHover(marker.symbol)}
                    onMouseLeave={onLeave}
                    type="button"
                  >
                    {marker.symbol}
                  </button>
                );
              }

              const isLand = row[columnIndex] === LAND_SLOT;

              return (
                <span
                  aria-hidden="true"
                  className={[
                    "inline-flex h-[1em] w-[1ch] items-center justify-center select-none",
                    isLand ? "opacity-35" : "opacity-10",
                  ].join(" ")}
                  key={getCellKey(rowIndex, columnIndex)}
                >
                  ·
                </span>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}

const MatrixGlyph = memo(function MatrixGlyph({ glyph }: { glyph: GlyphCharacter }) {
  const slots = useAnimatedGlyphSlots(glyph);

  return (
    <div
      aria-hidden="true"
      className="relative shrink-0"
      style={{
        width: GLYPH_WIDTH_STYLE,
        height: GLYPH_HEIGHT_STYLE,
      }}
    >
      {slots.map((slot) => (
        <motion.span
          key={slot.id}
          animate={{
            opacity: slot.status === "active" ? 1 : 0,
            scale: slot.status === "active" ? 1 : 0.72,
          }}
          className="absolute inline-flex items-center justify-center font-mono leading-none tabular-nums select-none"
          initial={{ opacity: 0, scale: 0.72 }}
          layout="position"
          style={getSlotStyle(slot.position)}
          transition={{
            layout: SLOT_MOVE_TRANSITION,
            opacity: SLOT_FADE_TRANSITION,
            scale: SLOT_FADE_TRANSITION,
          }}
        >
          {slot.character}
        </motion.span>
      ))}
    </div>
  );
});

function TimezoneClock({ city, onReset }: { city: CityMarker; onReset(): void }) {
  const now = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const minuteTick = useSyncExternalStore(subscribe, getMinuteSnapshot, getMinuteSnapshot);
  const localTime = getLocalTimeInfo(now, city.timezone);
  const preset = getTimeGradientPreset(localTime);
  const mapTimestamp = minuteTick * 60000;
  const worldMapGradientStyle = useMemo(() => getWorldMapGradientStyle(minuteTick), [minuteTick]);
  const mapCityPreviewLayers = useMemo(
    () => getWorldMapCityPreviewLayers(mapTimestamp),
    [mapTimestamp],
  );
  const focusPoint = useMemo(() => getCityFocusPoint(city), [city]);
  const zoomOffsetX = (0.5 - focusPoint.x) * 180;
  const zoomOffsetY = (0.5 - focusPoint.y) * 110;
  const transformOrigin = `${(focusPoint.x * 100).toFixed(2)}% ${(focusPoint.y * 100).toFixed(2)}%`;
  const time = `${localTime.hourText}:${localTime.minuteText}:${localTime.secondText}`;
  const glyphs = time.split("") as GlyphCharacter[];

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[inherit]">
      <motion.div
        aria-hidden="true"
        animate={{ opacity: 0, scale: 1.9, x: zoomOffsetX, y: zoomOffsetY }}
        className="absolute inset-0 overflow-hidden"
        initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
        style={{ transformOrigin }}
        transition={{ duration: 0.85, ease: [0.2, 0.75, 0, 1] }}
      >
        <div aria-hidden="true" className="absolute inset-0" style={worldMapGradientStyle} />
        {mapCityPreviewLayers.map((layer) => (
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.5]"
            key={layer.key}
            style={{
              backgroundColor: layer.backgroundColor,
              backgroundImage: layer.backgroundImage,
              maskImage: layer.maskImage,
              WebkitMaskImage: layer.maskImage,
            }}
          />
        ))}
      </motion.div>

      <motion.div
        aria-hidden="true"
        animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
        className="absolute inset-0"
        initial={{ opacity: 0, scale: 1.18, x: zoomOffsetX * 0.45, y: zoomOffsetY * 0.45 }}
        style={{
          backgroundColor: "oklch(0.96 0.004 240)",
          backgroundImage: preset.backgroundImage,
          transformOrigin,
        }}
        transition={{ duration: 0.85, ease: [0.2, 0.75, 0, 1] }}
      />

      <div className="relative z-10 flex flex-col items-center gap-12 px-4 py-5">
        <div
          aria-label={`Current time in ${city.city}: ${time}`}
          className="flex items-center gap-[clamp(0.18rem,0.6vw,0.4rem)] text-[clamp(0.35rem,0.9vw,0.55rem)] font-medium leading-none sm:text-[clamp(0.28rem,1vw,0.65rem)]"
          style={{
            color: preset.foreground,
            mixBlendMode: preset.blendMode,
            textShadow: "0 1px 0 oklch(1 0 0 / 0.16)",
          }}
          suppressHydrationWarning
        >
          {glyphs.map((glyph, index) => (
            <MatrixGlyph glyph={glyph} key={index} />
          ))}
        </div>

        <div
          className="inline-flex items-center gap-2 font-mono text-[10px] sm:text-xs"
          style={{ color: preset.footer }}
        >
          <button
            aria-label="Back to map"
            className="inline-flex cursor-pointer items-center gap-1 transition-opacity hover:opacity-100"
            onClick={onReset}
            style={{ color: preset.footer }}
            type="button"
          >
            <span aria-hidden="true">←</span>
            <span>back</span>
          </button>

          <span aria-hidden="true">·</span>
          <span>{city.city}</span>
        </div>
      </div>
    </div>
  );
}

export const DigitalClock = () => {
  const [hoveredSymbol, setHoveredSymbol] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityMarker | null>(null);

  return (
    <div className="relative flex h-full w-full overflow-hidden rounded-[inherit] bg-primary text-primary">
      <div className="flex flex-1 items-center justify-center">
        <AnimatePresence mode="wait">
          {selectedCity === null ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="h-full w-full"
              exit={{ opacity: 0, y: -6 }}
              initial={{ opacity: 0, y: 6 }}
              key="map"
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <WorldMapSelector
                hoveredSymbol={hoveredSymbol}
                onHover={setHoveredSymbol}
                onLeave={() => setHoveredSymbol(null)}
                onSelect={(marker) => {
                  setHoveredSymbol(null);
                  setSelectedCity(marker);
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="h-full w-full"
              exit={{ opacity: 0, y: 6 }}
              initial={{ opacity: 0, y: -6 }}
              key="clock"
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <TimezoneClock
                city={selectedCity}
                onReset={() => {
                  setSelectedCity(null);
                  setHoveredSymbol(null);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p
        className="pointer-events-none absolute inset-x-0 bottom-4 z-10 text-center text-xs opacity-60"
        style={{ color: "oklch(0.24 0.01 255 / 0.72)" }}
      >
        Click a city to see its time
      </p>
    </div>
  );
};
