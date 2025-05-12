import { useRive, UseRiveOptions, UseRiveParameters } from "@rive-app/react-canvas";

export default function Animation({
  riveParams,
  options,
  className,
}: {
  riveParams?: UseRiveParameters;
  options?: Partial<UseRiveOptions>;
  className?: string;
}) {
  const { RiveComponent } = useRive({
    ...riveParams,
    ...options,
  });

  return <RiveComponent className={className} />;
}
