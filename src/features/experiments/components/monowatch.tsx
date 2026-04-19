import { motion } from "motion/react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

type GlyphCharacter = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | ":";
type SlotStatus = "active" | "exiting";

interface AnimatedSlot {
  id: number;
  position: number;
  glyph: GlyphCharacter;
  status: SlotStatus;
  exitAt: number | null;
}

const GLYPH_WIDTH = 5;
const GLYPH_HEIGHT = 7;
const COLUMN_GAP = 0.16;
const ROW_GAP = 0.08;
const SLOT_WIDTH = "1ch";
const SLOT_HEIGHT = "1em";
const EXIT_DURATION_MS = 170;

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

const GLYPH_ROWS: Record<GlyphCharacter, readonly string[]> = {
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
};

const GLYPH_POSITIONS: Record<GlyphCharacter, readonly number[]> = {
  "0": toPositions(GLYPH_ROWS["0"]),
  "1": toPositions(GLYPH_ROWS["1"]),
  "2": toPositions(GLYPH_ROWS["2"]),
  "3": toPositions(GLYPH_ROWS["3"]),
  "4": toPositions(GLYPH_ROWS["4"]),
  "5": toPositions(GLYPH_ROWS["5"]),
  "6": toPositions(GLYPH_ROWS["6"]),
  "7": toPositions(GLYPH_ROWS["7"]),
  "8": toPositions(GLYPH_ROWS["8"]),
  "9": toPositions(GLYPH_ROWS["9"]),
  ":": toPositions(GLYPH_ROWS[":"]),
};

function toPositions(rows: readonly string[]) {
  const positions: number[] = [];
  rows.forEach((row, rowIndex) => {
    row.split("").forEach((slot, columnIndex) => {
      if (slot === "1") {
        positions.push(rowIndex * GLYPH_WIDTH + columnIndex);
      }
    });
  });
  return positions;
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

function formatElapsed(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function useAnimatedGlyphSlots(glyph: GlyphCharacter) {
  const positions = GLYPH_POSITIONS[glyph];
  const nextIdRef = useRef(0);
  const [slots, setSlots] = useState<AnimatedSlot[]>(() =>
    positions.map((position) => ({
      id: nextIdRef.current++,
      position,
      glyph,
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
        } else {
          alreadyExitingSlots.push(slot);
        }
      }

      const { matches, usedPositionIndexes } = matchSlotsToPositions(activeSlots, positions);
      const matchedSlotIndexes = new Set(matches.map((match) => match.slotIndex));
      const nextSlots: AnimatedSlot[] = [];

      for (const match of matches) {
        const sourceSlot = activeSlots[match.slotIndex];
        nextSlots.push({
          id: sourceSlot.id,
          position: positions[match.positionIndex],
          glyph,
          status: "active",
          exitAt: null,
        });
      }

      positions.forEach((position, positionIndex) => {
        if (usedPositionIndexes.has(positionIndex)) return;
        nextSlots.push({
          id: nextIdRef.current++,
          position,
          glyph,
          status: "active",
          exitAt: null,
        });
      });

      activeSlots.forEach((slot, slotIndex) => {
        if (matchedSlotIndexes.has(slotIndex)) return;
        nextSlots.push({
          id: slot.id,
          position: slot.position,
          glyph: slot.glyph,
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
          className="absolute inline-flex items-center justify-center font-mono leading-none tabular-nums"
          initial={{ opacity: 0, scale: 0.72 }}
          layout="position"
          style={getSlotStyle(slot.position)}
          transition={{
            layout: SLOT_MOVE_TRANSITION,
            opacity: SLOT_FADE_TRANSITION,
            scale: SLOT_FADE_TRANSITION,
          }}
        >
          {slot.glyph}
        </motion.span>
      ))}
    </div>
  );
});

export const MonoWatch = () => {
  const [displayTime, setDisplayTime] = useState("00:00:00");
  const startedAtRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const [running, setRunning] = useState(false);

  const tick = useCallback(() => {
    if (startedAtRef.current === null) return;
    const elapsed = accumulatedRef.current + (Date.now() - startedAtRef.current);
    setDisplayTime(formatElapsed(elapsed));
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(() => {
    startedAtRef.current = Date.now();
    setRunning(true);
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const stop = useCallback(() => {
    if (startedAtRef.current !== null) {
      accumulatedRef.current += Date.now() - startedAtRef.current;
      startedAtRef.current = null;
    }
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setRunning(false);
    setDisplayTime(formatElapsed(accumulatedRef.current));
  }, []);

  const reset = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    startedAtRef.current = null;
    accumulatedRef.current = 0;
    setRunning(false);
    setDisplayTime("00:00:00");
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const glyphs = displayTime.split("") as GlyphCharacter[];

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-8 rounded-[inherit] bg-primary text-primary">
      <div className="flex items-center gap-[clamp(0.18rem,0.6vw,0.4rem)] font-mono text-[clamp(0.35rem,0.9vw,0.55rem)] font-medium leading-none tabular-nums sm:text-[clamp(0.28rem,1vw,0.65rem)]">
        {glyphs.map((glyph, index) => (
          <MatrixGlyph glyph={glyph} key={index} />
        ))}
      </div>

      <div className="inline-flex items-center gap-4 font-mono text-[10px] sm:text-xs">
        <button
          className="cursor-pointer text-secondary transition-colors hover:text-primary disabled:cursor-default disabled:opacity-30"
          disabled={running}
          onClick={start}
          type="button"
        >
          start
        </button>

        <button
          className="cursor-pointer text-secondary transition-colors hover:text-primary disabled:cursor-default disabled:opacity-30"
          disabled={!running}
          onClick={stop}
          type="button"
        >
          stop
        </button>

        <button
          className="cursor-pointer text-secondary transition-colors hover:text-primary disabled:cursor-default disabled:opacity-30"
          disabled={running || accumulatedRef.current === 0}
          onClick={reset}
          type="button"
        >
          reset
        </button>
      </div>
    </div>
  );
};
