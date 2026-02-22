// Simplified types for showcase purposes

export type Status = "optimal" | "normal" | "high" | "low";

export interface Range {
  status: Uppercase<Status>;
  low: number;
  high: number;
}

export interface DataPoint {
  value: number;
  date: string;
}

export interface Biomarker {
  id: string;
  name: string;
  unit: string;
  category: string;
  ranges: Range[];
  data: DataPoint[];
}

export interface ChartDimensions {
  minValue: number;
  maxValue: number;
  chartMinValue: number;
  chartMaxValue: number;
  totalRange: number;
  optimalLow: number;
  optimalHigh: number;
  normalLow: number;
  normalHigh: number;
}

export const STATUS_COLORS = {
  optimal: "rgba(17, 193, 130, 1)",
  normal: "rgb(227, 216, 17)",
  high: "rgba(255, 104, 222, 1)",
  low: "rgba(255, 104, 222, 1)",
} as const;

export type StatusColorKey = keyof typeof STATUS_COLORS;
