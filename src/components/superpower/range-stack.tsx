import type { ChartDimensions, Range } from "./types";
import { STATUS_COLORS } from "./types";
import { calculateChartDimensions, valueToYPercent } from "./utils";

const CONFIG = {
  HEIGHT: 64,
  PADDING: 8,
  WIDTH: 3,
  GAP: 0.5,
} as const;

interface Segment {
  y: number;
  height: number;
  color: string;
}

function buildSegments(dimensions: ChartDimensions, svgHeight: number, padding: number, gap: number): Segment[] {
  const segments: Segment[] = [];
  const { chartMaxValue, normalHigh, optimalHigh, optimalLow, normalLow, chartMinValue } = dimensions;

  const hasNormalRange = normalLow !== optimalLow || normalHigh !== optimalHigh;
  const getY = (value: number) => (valueToYPercent(dimensions, value) / 100) * (svgHeight - 2 * padding) + padding;

  const rangeDefinitions: Array<{ from: number; to: number; color: string }> = [];

  if (hasNormalRange) {
    const maxValue = Math.max(normalHigh, optimalHigh);
    const minValue = Math.min(normalLow, optimalLow);

    if (chartMaxValue > maxValue) {
      rangeDefinitions.push({ from: chartMaxValue, to: maxValue, color: STATUS_COLORS.high });
    }
    if (normalHigh > optimalHigh) {
      rangeDefinitions.push({ from: normalHigh, to: optimalHigh, color: STATUS_COLORS.normal });
    }
    rangeDefinitions.push({ from: optimalHigh, to: optimalLow, color: STATUS_COLORS.optimal });
    if (normalLow < optimalLow) {
      rangeDefinitions.push({ from: optimalLow, to: normalLow, color: STATUS_COLORS.normal });
    }
    if (chartMinValue < minValue) {
      rangeDefinitions.push({ from: minValue, to: chartMinValue, color: STATUS_COLORS.low });
    }
  } else {
    if (chartMaxValue > optimalHigh) {
      rangeDefinitions.push({ from: chartMaxValue, to: optimalHigh, color: STATUS_COLORS.high });
    }
    rangeDefinitions.push({ from: optimalHigh, to: optimalLow, color: STATUS_COLORS.optimal });
    if (chartMinValue < optimalLow) {
      rangeDefinitions.push({ from: optimalLow, to: chartMinValue, color: STATUS_COLORS.low });
    }
  }

  let currentY = padding;
  for (const range of rangeDefinitions) {
    const fromY = getY(range.from);
    const toY = getY(range.to);
    const startY = Math.max(currentY, fromY) + gap / 2;
    const height = Math.max(0, toY - startY - gap);

    if (height > 0) {
      segments.push({ y: startY, height, color: range.color });
      currentY = toY + gap;
    }
  }

  return segments.filter((s) => s.height > 0);
}

export interface RangeStackProps {
  ranges: Range[];
  values: number[];
  dimensions?: ChartDimensions;
  height?: number;
  padding?: number;
}

export function RangeStack({ ranges, values, dimensions: providedDimensions, height, padding }: RangeStackProps) {
  const svgHeight = height ?? CONFIG.HEIGHT;
  const svgPadding = padding ?? CONFIG.PADDING;

  const dimensions = providedDimensions ?? calculateChartDimensions(ranges, values);
  const segments = buildSegments(dimensions, svgHeight, svgPadding, CONFIG.GAP);

  if (!segments.length) return null;

  return (
    <svg width={CONFIG.WIDTH} height={svgHeight} className="overflow-visible">
      {segments.map((segment, index) => (
        <rect
          key={index}
          x={0}
          y={segment.y}
          width={CONFIG.WIDTH}
          height={segment.height}
          fill={segment.color}
          rx={CONFIG.WIDTH / 2}
        />
      ))}
    </svg>
  );
}
