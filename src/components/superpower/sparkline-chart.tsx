import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ChartTooltip } from "./chart-tooltip";
import { RangeStack } from "./range-stack";
import type { Biomarker, Status } from "./types";
import { STATUS_COLORS } from "./types";
import { calculateChartDimensions, formatDate, getValueStatus, prepareChartData, valueToYPercent } from "./utils";

const CHART_CONFIG = {
  HEIGHT: 64,
  PADDING: 8,
  CIRCLE_RADIUS: 5,
  STROKE_WIDTH: 2,
} as const;

interface PointData {
  x: number;
  y: number;
  value: number;
  date: string;
  status: Status;
}

interface TooltipData {
  index: number;
  value: number;
  date: string;
  clientX: number;
  clientY: number;
  status: Status;
}

export interface SparklineChartProps {
  biomarker: Biomarker;
  maxPoints?: number;
  width?: number;
}

export function SparklineChart({ biomarker, maxPoints = 4, width = 150 }: SparklineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const lastHoveredIndexRef = useRef<number | null>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prepare chart data
  const chartData = useMemo(() => prepareChartData(biomarker.data, maxPoints), [biomarker.data, maxPoints]);

  const values = useMemo(() => chartData.map((d) => d.value), [chartData]);

  const dimensions = useMemo(() => calculateChartDimensions(biomarker.ranges, values), [biomarker.ranges, values]);

  // Calculate point positions
  const points = useMemo((): PointData[] => {
    const { HEIGHT, PADDING } = CHART_CONFIG;
    const usableWidth = width - PADDING * 8;
    const xStep = chartData.length > 1 ? usableWidth / (chartData.length - 1) : 0;

    return chartData.map((dataPoint, index) => {
      const x = chartData.length === 1 ? width - PADDING * 6 : PADDING * 6 + index * xStep;
      const yPercent = valueToYPercent(dimensions, dataPoint.value);
      const y = (yPercent / 100) * (HEIGHT - 2 * PADDING) + PADDING;

      return {
        x: Number.isFinite(x) ? x : width / 2,
        y: Number.isFinite(y) ? y : HEIGHT / 2,
        value: dataPoint.value,
        date: dataPoint.date,
        status: getValueStatus(dimensions, dataPoint.value),
      };
    });
  }, [chartData, dimensions, width]);

  // Generate line segments
  const lines = useMemo(() => {
    const result: Array<{
      key: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      stroke: string;
      opacity?: number;
    }> = [];

    if (points.length > 0 && points[0]) {
      const first = points[0];
      result.push({
        key: "lead-in",
        x1: 0,
        y1: first.y,
        x2: chartData.length === 1 ? width - CHART_CONFIG.PADDING * 6 : CHART_CONFIG.PADDING * 6,
        y2: first.y,
        stroke: STATUS_COLORS[first.status],
        opacity: 0.6,
      });
    }

    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];

      result.push({
        key: `line-${i}`,
        x1: curr.x,
        y1: curr.y,
        x2: next.x,
        y2: next.y,
        stroke: STATUS_COLORS[next.status],
      });
    }

    return result;
  }, [points, chartData.length, width]);

  // Generate circle elements
  const circles = useMemo(
    () =>
      points.map((point, index) => ({
        key: `circle-${index}`,
        cx: point.x,
        cy: point.y,
        r: chartData.length === 1 ? CHART_CONFIG.CIRCLE_RADIUS + 1 : CHART_CONFIG.CIRCLE_RADIUS,
        fill: STATUS_COLORS[point.status],
      })),
    [points, chartData.length],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current || points.length === 0) return;

      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;

      const nearest = points.reduce((prev, curr) =>
        Math.abs(curr.x - mouseX) < Math.abs(prev.x - mouseX) ? curr : prev,
      );

      const nearestIndex = points.indexOf(nearest);
      if (lastHoveredIndexRef.current === nearestIndex) return;
      lastHoveredIndexRef.current = nearestIndex;

      setTooltip({
        index: nearestIndex,
        value: nearest.value,
        date: nearest.date,
        clientX: rect.left + nearest.x,
        clientY: rect.top + nearest.y,
        status: nearest.status,
      });
    },
    [points],
  );

  const handleMouseLeave = useCallback(() => {
    lastHoveredIndexRef.current = null;
    setTooltip(null);
  }, []);

  if (!chartData.length) {
    return <div className="flex h-16 items-center justify-center text-sm text-tertiary">No data</div>;
  }

  return (
    <div className="relative flex items-center justify-end gap-0 overflow-visible">
      <div
        className="relative py-1"
        style={{
          maskImage: "linear-gradient(to right, transparent 15%, black 30%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 15%, black 30%)",
        }}
      >
        <svg
          ref={svgRef}
          width={width}
          height={CHART_CONFIG.HEIGHT}
          className="cursor-crosshair touch-manipulation overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {lines.map((line) => (
            <line
              key={line.key}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={line.stroke}
              strokeWidth={CHART_CONFIG.STROKE_WIDTH}
              strokeLinecap="round"
              opacity={line.opacity}
            />
          ))}
          {circles.map((circle, idx) => (
            <g key={circle.key}>
              {tooltip?.index === idx && (
                <circle
                  cx={circle.cx}
                  cy={circle.cy}
                  r={circle.r + 3}
                  fill="none"
                  stroke={circle.fill}
                  strokeWidth={4}
                  strokeOpacity={0.3}
                />
              )}
              <circle
                cx={circle.cx}
                cy={circle.cy}
                r={circle.r}
                fill={circle.fill}
                stroke="var(--surface)"
                strokeWidth={CHART_CONFIG.STROKE_WIDTH}
              />
            </g>
          ))}
        </svg>
      </div>

      <RangeStack ranges={biomarker.ranges} values={values} dimensions={dimensions} />

      {isMounted && (
        <ChartTooltip
          isOpen={!!tooltip}
          position={{ x: tooltip?.clientX ?? 0, y: tooltip?.clientY ?? 0 }}
          side="top"
          onMouseLeave={handleMouseLeave}
        >
          {tooltip && (
            <div className="flex items-center gap-2">
              <div
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[tooltip.status] }}
              />
              <div className="text-xs">
                <div className="font-mono font-semibold text-primary">
                  {tooltip.value.toFixed(1)} {biomarker.unit}
                </div>
                <div className="text-secondary">{formatDate(tooltip.date)}</div>
              </div>
            </div>
          )}
        </ChartTooltip>
      )}
    </div>
  );
}

export default SparklineChart;
