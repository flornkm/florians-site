declare module "flubber" {
  interface InterpolateOptions {
    maxSegmentLength?: number;
    string?: boolean;
  }

  type Interpolator = (
    fromShape: string,
    toShape: string,
    options?: InterpolateOptions,
  ) => (t: number) => string;

  export const interpolate: Interpolator;
}
