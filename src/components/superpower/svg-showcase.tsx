export function SVGShowcase() {
  return (
    <div className="not-prose my-16 space-y-16">
      <div className="overflow-hidden bg-surface">
        <div className="flex items-center justify-center p-4 rounded-lg bg-secondary dark:bg-inverted">
          <img src="/images/superpower/time-series-chart.svg" alt="Time Series chart" className="max-w-full h-auto" />
        </div>
      </div>
      <div className="overflow-hidden bg-surface">
        <div className="flex items-center justify-center p-4 rounded-lg bg-secondary dark:bg-inverted">
          <img src="/images/superpower/donut-chart.svg" alt="Donut chart" className="max-w-full h-auto" />
        </div>
      </div>
    </div>
  );
}

export default SVGShowcase;
