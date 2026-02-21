import { MOCK_BIOMARKERS } from "./mock-data";
import { SparklineChart } from "./sparkline-chart";
import { STATUS_COLORS } from "./types";

export function BiomarkerShowcase() {
  return (
    <div className="not-prose">
      <div className="space-y-2">
        {MOCK_BIOMARKERS.map((biomarker) => (
          <div
            key={biomarker.id}
            className="flex h-20 items-center justify-between rounded-xl bg-surface px-4 shadow-sm shadow-black/[.03] border border-primary transition-all hover:bg-surface dark:hover:outline-secondary"
          >
            {/* Name & Category */}
            <div className="flex min-w-0 flex-1 flex-col justify-center pr-4">
              <div className="mb-0.5 flex items-center gap-2">
                <h4 className="truncate font-medium text-primary">{biomarker.name}</h4>
              </div>
              <p className="truncate text-sm text-tertiary">{biomarker.category}</p>
            </div>

            {/* Sparkline Chart */}
            <div className="shrink-0 pl-2">
              <SparklineChart biomarker={biomarker} maxPoints={4} width={140} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-center gap-6 text-xs text-secondary">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS.optimal }} />
          <span>Optimal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS.normal }} />
          <span>Normal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS.high }} />
          <span>High</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS.low }} />
          <span>Low</span>
        </div>
      </div>
    </div>
  );
}

export default BiomarkerShowcase;
