import type { Biomarker } from "./types";

// Generic showcase data - simplified for demonstration purposes
export const MOCK_BIOMARKERS: Biomarker[] = [
  {
    id: "energy-score",
    name: "Energy Score",
    unit: "pts",
    category: "Vitality",
    ranges: [
      { status: "LOW", low: 0, high: 40 },
      { status: "NORMAL", low: 40, high: 60 },
      { status: "OPTIMAL", low: 60, high: 85 },
      { status: "HIGH", low: 85, high: 100 },
    ],
    data: [
      { value: 72, date: "2024-11-15" },
      { value: 65, date: "2024-08-20" },
      { value: 52, date: "2024-05-10" },
      { value: 45, date: "2024-02-01" },
    ],
  },
  {
    id: "recovery-index",
    name: "Recovery Index",
    unit: "%",
    category: "Performance",
    ranges: [
      { status: "LOW", low: 0, high: 50 },
      { status: "OPTIMAL", low: 50, high: 80 },
      { status: "NORMAL", low: 80, high: 90 },
      { status: "HIGH", low: 90, high: 100 },
    ],
    data: [
      { value: 92, date: "2024-11-15" },
      { value: 78, date: "2024-08-20" },
      { value: 71, date: "2024-05-10" },
    ],
  },
];

export default MOCK_BIOMARKERS;
