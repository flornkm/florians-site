import { CrtChat } from "@/features/experiments/components/crt-chat-demo";
import { DepthInput } from "@/features/experiments/components/depth-input";
import { FontSmoothing } from "@/features/experiments/components/font-smoothing-demo";
import { FrostedCamera } from "@/features/experiments/components/frosted-camera-demo";
import { IosContextMenu } from "@/features/experiments/components/ios-context-menu-demo";
import { LazyImage } from "@/features/experiments/components/lazy-image-demo";
import { ScrollMaskFade } from "@/features/experiments/components/scroll-mask-fade-demo";
import { SlopDetector } from "@/features/experiments/components/slop-detector";
import { TextShimmerExperiment } from "@/features/experiments/components/text-shimmer-demo";
import { VideoPlayerExperiment } from "@/features/experiments/components/video-player-demo";
import { ExperimentDrawer } from "@/features/experiments/components/experiment-drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { IconCrossSmall } from "central-icons/IconCrossSmall";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import type { ComponentType } from "react";
import { useCallback, useRef } from "react";

interface Experiment {
  slug: string;
  title: string;
  Component: ComponentType;
}

// Same box as the grid tiles so the morph is a clean uniform scale.
const DIALOG_SIZE = "h-[min(88vh,33rem)] w-[min(92vw,44rem)]";

const EXPERIMENTS: Experiment[] = [
  { slug: "video-player", title: "Video Player", Component: VideoPlayerExperiment },
  { slug: "slop-detector", title: "Slop Detector", Component: SlopDetector },
  { slug: "frosted-camera", title: "Frosted Camera", Component: FrostedCamera },
  { slug: "scroll-mask-fade", title: "Scroll Mask Fade", Component: ScrollMaskFade },
  { slug: "font-smoothing", title: "Font Smoothing", Component: FontSmoothing },
  { slug: "lazy-image", title: "Lazy Image", Component: LazyImage },
  { slug: "depth-input", title: "Depth Input", Component: DepthInput },
  { slug: "crt-terminal", title: "CRT Terminal", Component: CrtChat },
  { slug: "ios-context-menu", title: "iOS Context Menu", Component: IosContextMenu },
  { slug: "text-shimmer", title: "Text Shimmer", Component: TextShimmerExperiment },
];

const TRANSITION = { duration: 0.45, ease: [0.22, 1, 0.36, 1] } as const;

interface ExperimentsSearch {
  demo?: string;
}

export const Route = createFileRoute("/experiments")({
  validateSearch: (search: Record<string, unknown>): ExperimentsSearch => {
    const demo = search.demo;
    return typeof demo === "string" && EXPERIMENTS.some((e) => e.slug === demo)
      ? { demo }
      : {};
  },
  head: () => ({
    meta: [
      { title: "Experiments ‹ Florian Design Engineer" },
      {
        name: "description",
        content: "A page collecting different design engineering experiments.",
      },
      { property: "og:title", content: "Experiments" },
      {
        property: "og:description",
        content: "A page collecting different design engineering experiments.",
      },
      { property: "og:image", content: "/api/og?title=Experiments" },
      { name: "twitter:title", content: "Experiments" },
      {
        name: "twitter:description",
        content: "A page collecting different design engineering experiments.",
      },
      { name: "twitter:image", content: "/api/og?title=Experiments" },
    ],
  }),
  component: ExperimentsPage,
});

function ExperimentsPage() {
  const { demo } = Route.useSearch();
  const navigate = Route.useNavigate();

  // Dialog state lives in the URL so deep-links and reloads restore it.
  const open = useCallback(
    (slug: string) => navigate({ search: { demo: slug }, resetScroll: false }),
    [navigate],
  );
  const close = useCallback(
    () => navigate({ search: {}, resetScroll: false }),
    [navigate],
  );

  const activeSlug = demo;

  // On mobile the expanded view is a bottom-sheet drawer, not the centered morph.
  const isMobile = useMediaQuery("(max-width: 767px)");
  const activeExperiment = EXPERIMENTS.find((e) => e.slug === activeSlug) ?? null;

  // Keep the last experiment mounted so the drawer can play its close animation
  // after the URL has already cleared.
  const drawerExpRef = useRef<Experiment | null>(null);
  if (activeExperiment) drawerExpRef.current = activeExperiment;
  const drawerExperiment = drawerExpRef.current;

  return (
    <MotionConfig transition={TRANSITION}>
      {/* Inner wrapper clips the outer border of each edge cell, leaving only interior grid lines. */}
      <div className="md:grid md:grid-cols-9 md:gap-x-6">
        <div className="overflow-hidden md:col-span-5 md:col-start-3">
          <ul className="-mb-px -mr-px grid grid-cols-1 lg:grid-cols-2">
            {EXPERIMENTS.map((experiment) => (
              <ExperimentTile
                key={experiment.slug}
                experiment={experiment}
                isActive={activeSlug === experiment.slug}
                morph={!isMobile}
                onOpen={() => open(experiment.slug)}
                onClose={close}
              />
            ))}
          </ul>
        </div>
      </div>

      {/* initial={false}: on fresh load the backdrop is present from frame one and must not fade in. */}
      <AnimatePresence initial={false}>
        {!isMobile && activeSlug && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-[2px]"
          />
        )}
      </AnimatePresence>

      {drawerExperiment && (
        <ExperimentDrawer
          open={isMobile && activeExperiment?.slug === drawerExperiment.slug}
          title={drawerExperiment.title}
          Component={drawerExperiment.Component}
          onOpenChange={(next) => {
            if (!next) close();
          }}
        />
      )}
    </MotionConfig>
  );
}

interface ExperimentTileProps {
  experiment: Experiment;
  isActive: boolean;
  morph: boolean;
  onOpen: () => void;
  onClose: () => void;
}

function ExperimentTile({ experiment, isActive, morph, onOpen, onClose }: ExperimentTileProps) {
  const { title, Component } = experiment;
  const expanded = isActive && morph;

  return (
    // Fixed-size placeholder so the grid never reflows while the tile lifts into the expanded view.
    <li className="relative aspect-[4/3] border-b border-r border-primary">
      <motion.div
        layout
        className={cn(
          "group overflow-hidden",
          expanded
            ? // Definite width AND height (not aspect-ratio): inset-0 pins top/bottom, so
              // aspect-ratio would be ignored and the height would stretch to the viewport.
              // has-[[data-menu-open]]: lets the iOS context menu overflow instead of clipping.
              cn(
                "fixed inset-0 z-[110] m-auto rounded-lg bg-surface dark:bg-surface-tertiary has-[[data-menu-open]]:overflow-visible",
                DIALOG_SIZE,
              )
            : "absolute inset-0",
        )}
      >
        {/* Never unmounts — it just morphs. */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-opacity duration-200",
            expanded
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none select-none opacity-70 group-hover:opacity-100",
          )}
        >
          <Component />
        </div>

        {!expanded && (
          <button
            type="button"
            onClick={onOpen}
            aria-label={`Open ${title}`}
            className="absolute inset-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-default"
          />
        )}

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.button
              type="button"
              onClick={onClose}
              aria-label="Close"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "absolute right-3 top-3 z-10 flex size-6 items-center justify-center rounded-sm",
                "text-neutral-500 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5",
                "cursor-pointer transition-colors",
                "outline-none focus-visible:ring-2 focus-visible:ring-default",
              )}
            >
              <IconCrossSmall className="size-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </li>
  );
}
