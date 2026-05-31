import { cn } from "@/lib/utils";
import flubber from "flubber";
import { motion, useMotionTemplate, useTransform, type MotionValue } from "motion/react";
import { useMemo } from "react";

// flubber is CommonJS; named ESM imports fail under Vite SSR, so destructure the default.
const { interpolate } = flubber;

interface LogoProps {
  className?: string;
  // Hover progress, 0 (collapsed "Fk") → 1 (full "FLORIAN KIEM").
  progress: MotionValue<number>;
}

// The K is a single morphing path (not a crossfade) so it reads as one continuous letter sliding right and reshaping.
const HEIGHT = 12;
const px = (units: number) => (units / 11) * HEIGHT;

const MIDDLE_WIDTH = 56.842; // L O R I A N (incl. the word space before K)
const K_VIEW_WIDTH = 72.72;

// Small k, translated to sit right after the F (collapsed position).
const SMALL_K =
  "M9.548 0V5.516L12.25 2.576H14.028L11.424 5.404L14.42 9.8H12.712L10.444 6.468L9.548 7.448V9.8H8.078V0H9.548Z";
// Uppercase K at its true wordmark position.
const BIG_K =
  "M66.4199 7.09814V9.94014H64.9219V0.140137H66.4199V4.92814L70.4939 0.140137H72.3419L68.9119 4.17214L72.7199 9.94014H70.9559L67.9179 5.33414L66.4199 7.09814Z";

export function Logo({ className, progress }: LogoProps) {
  const morphK = useMemo(() => interpolate(SMALL_K, BIG_K, { maxSegmentLength: 2 }), []);
  const kPath = useTransform(progress, morphK);

  const blur = useTransform(progress, [0, 1], [2, 0]);
  const filter = useMotionTemplate`blur(${blur}px)`;

  return (
    <span
      className={cn("relative inline-flex items-center text-primary", className)}
      role="img"
      aria-label="Florian Kiem"
    >
      <svg height={HEIGHT} width={px(8.078)} viewBox="0 0 8.078 11" fill="none" aria-hidden>
        <path
          d="M1.498 1.62414V4.25614H4.802V5.74014H1.498V9.94014H0V0.140137H5.782V1.62414H1.498Z"
          fill="currentColor"
        />
      </svg>

      {/* Spacer reserving the small-k width so the collapsed box hugs "Fk" */}
      <span aria-hidden style={{ width: px(7) }} />

      <motion.span
        className="absolute top-0 inline-flex"
        style={{ left: px(8.078), opacity: progress, filter }}
        aria-hidden
      >
        <svg height={HEIGHT} width={px(MIDDLE_WIDTH)} viewBox="8.078 0 56.842 11" fill="none">
          <path
            d="M8.07812 9.94014V0.140137H9.57613V8.45614H13.8601V9.94014H8.07812Z"
            fill="currentColor"
          />
          <path
            d="M20.9831 6.622V3.458C20.9831 2.086 19.9471 1.484 18.9671 1.484C17.9871 1.484 16.9511 2.086 16.9511 3.458V6.622C16.9511 7.994 17.9871 8.596 18.9671 8.596C19.9471 8.596 20.9831 7.994 20.9831 6.622ZM15.4531 6.622V3.458C15.4531 1.344 16.8671 0 18.9671 0C21.0671 0 22.4811 1.344 22.4811 3.458V6.622C22.4811 8.736 21.0671 10.08 18.9671 10.08C16.8671 10.08 15.4531 8.736 15.4531 6.622Z"
            fill="currentColor"
          />
          <path
            d="M26.9928 5.72614H25.4668V9.94014H23.9688V0.140137H27.8188C29.7648 0.140137 30.8288 1.24614 30.8288 2.94014C30.8288 4.38214 30.0588 5.39014 28.6308 5.65614L31.1507 9.94014H29.4708L26.9928 5.72614ZM29.3028 2.95414C29.3028 2.10014 28.7288 1.62414 27.8188 1.62414H25.4668V4.28414H27.8188C28.7288 4.28414 29.3028 3.80814 29.3028 2.95414Z"
            fill="currentColor"
          />
          <path
            d="M38.3367 1.62414H36.1947V8.45614H38.3367V9.94014H32.5547V8.45614H34.6967V1.62414H32.5547V0.140137H38.3367V1.62414Z"
            fill="currentColor"
          />
          <path
            d="M46.3366 9.94014L45.5106 7.57414H41.8426L41.0166 9.94014H39.4766L42.9066 0.140137H44.4466L47.8766 9.94014H46.3366ZM42.3186 6.18814H45.0346L43.6766 2.29614L42.3186 6.18814Z"
            fill="currentColor"
          />
          <path
            d="M55.4264 0.140137V9.94014H53.9284L49.8964 2.91214V9.94014H48.3984V0.140137H49.8964L53.9284 7.16814V0.140137H55.4264Z"
            fill="currentColor"
          />
        </svg>
      </motion.span>

      <span className="absolute top-0 left-0" aria-hidden>
        <svg
          height={HEIGHT}
          width={px(K_VIEW_WIDTH)}
          viewBox={`0 0 ${K_VIEW_WIDTH} 11`}
          fill="none"
        >
          <motion.path d={kPath} fill="currentColor" />
        </svg>
      </span>

      <motion.span
        className="absolute top-0 inline-flex"
        style={{ left: px(73.742), opacity: progress, filter }}
        aria-hidden
      >
        <svg height={HEIGHT} width={px(23.258)} viewBox="73.742 0 23.258 11" fill="none">
          <path
            d="M79.5242 1.62414H77.3822V8.45614H79.5242V9.94014H73.7422V8.45614H75.8842V1.62414H73.7422V0.140137H79.5242V1.62414Z"
            fill="currentColor"
          />
          <path
            d="M83.623 1.62414V4.25614H86.927V5.74014H83.623V8.45614H87.907V9.94014H82.125V0.140137H87.907V1.62414H83.623Z"
            fill="currentColor"
          />
          <path
            d="M93.0999 5.53014L95.0319 0.140137H96.6139V9.94014H95.1579V3.20614L93.6879 7.30814H92.5119L91.0419 3.20614V9.94014H89.5859V0.140137H91.1679L93.0999 5.53014Z"
            fill="currentColor"
          />
        </svg>
      </motion.span>
    </span>
  );
}
