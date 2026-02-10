// Consolidated utilities for sparkline charts

import type { Biomarker, ChartDimensions, DataPoint, Range, Status } from "./types";

const RANGE_EXTENSION_FACTOR = 0.1;

/**
 * Calculate chart dimensions from ranges and values
 */
export function calculateChartDimensions(ranges: Range[], values: number[]): ChartDimensions {
  const defaultDimensions: ChartDimensions = {
    minValue: 0,
    maxValue: 100,
    chartMinValue: 0,
    chartMaxValue: 100,
    totalRange: 100,
    optimalLow: 0,
    optimalHigh: 100,
    normalLow: 0,
    normalHigh: 100,
  };

  if (!values.length || values.some((v) => !Number.isFinite(v))) {
    return defaultDimensions;
  }

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  const optimalRange = ranges.find((r) => r.status === "OPTIMAL");
  const normalRange = ranges.find((r) => r.status === "NORMAL");

  if (!optimalRange) {
    const totalRange = maxValue - minValue || 1;
    return {
      ...defaultDimensions,
      minValue,
      maxValue,
      chartMinValue: minValue,
      chartMaxValue: maxValue,
      totalRange,
    };
  }

  const optimalLow = optimalRange.low;
  const optimalHigh = optimalRange.high;

  const normalLow = normalRange?.low ?? optimalLow;
  const normalHigh = normalRange?.high ?? optimalHigh;

  const rangeSpan = Math.max(normalHigh, optimalHigh) - Math.min(normalLow, optimalLow);
  const rangeExtension = rangeSpan * RANGE_EXTENSION_FACTOR;

  const chartMinValue = Math.min(minValue, normalLow, optimalLow) - rangeExtension;
  const chartMaxValue = Math.max(maxValue, normalHigh, optimalHigh) + rangeExtension;
  const totalRange = chartMaxValue - chartMinValue || 1;

  return {
    minValue,
    maxValue,
    chartMinValue,
    chartMaxValue,
    totalRange,
    optimalLow,
    optimalHigh,
    normalLow,
    normalHigh,
  };
}

/**
 * Convert a value to Y position (0-100 percentage, inverted for SVG)
 */
export function valueToYPercent(dimensions: ChartDimensions, value: number): number {
  if (!Number.isFinite(value) || dimensions.totalRange === 0) {
    return 50;
  }

  const percentage = ((value - dimensions.chartMinValue) / dimensions.totalRange) * 100;
  return Math.max(0, Math.min(100, 100 - percentage));
}

/**
 * Determine status color based on value position within ranges
 */
export function getValueStatus(dimensions: ChartDimensions, value: number): Status {
  if (value >= dimensions.optimalLow && value <= dimensions.optimalHigh) {
    return "optimal";
  }

  const hasNormalRange =
    dimensions.normalLow !== dimensions.optimalLow || dimensions.normalHigh !== dimensions.optimalHigh;

  if (hasNormalRange) {
    const maxHigh = Math.max(dimensions.normalHigh, dimensions.optimalHigh);
    const minLow = Math.min(dimensions.normalLow, dimensions.optimalLow);

    if (value > maxHigh) return "high";
    if (value < minLow) return "low";
    if (value >= dimensions.normalLow && value <= dimensions.normalHigh) return "normal";

    return "normal";
  }

  return value < dimensions.optimalLow ? "low" : "high";
}

/**
 * Sort data points by date (newest first) and limit count
 */
export function prepareChartData(data: DataPoint[], maxPoints: number): DataPoint[] {
  return [...data]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, maxPoints)
    .reverse(); // Reverse for left-to-right chronological display
}

/**
 * Get the newest data point from a biomarker
 */
export function getNewestDataPoint(biomarker: Biomarker): DataPoint | null {
  if (!biomarker.data.length) return null;

  return [...biomarker.data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] ?? null;
}

/**
 * Format date for tooltip display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}
