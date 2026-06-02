import { CopyExperiment } from "@/features/experiments/components/copy-demo";
import { CrtChat } from "@/features/experiments/components/crt-chat-demo";
import { DepthInput } from "@/features/experiments/components/depth-input";
import { FigmaSelect } from "@/features/experiments/components/figma-select-demo";
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
import { useCallback, useRef, useState } from "react";

interface Experiment {
  slug: string;
  title: string;
  tag: string;
  // A single transparent poster at public/experiments/<slug>.webp works on both light
  // and dark grids. Until the file exists the tile falls back to a plain panel.
  poster: string;
  Component: ComponentType;
}

// The centered modal the tile morphs into when opened.
const DIALOG_SIZE = "h-[min(88vh,33rem)] w-[min(92vw,44rem)]";

const experiment = (
  slug: string,
  title: string,
  tag: string,
  Component: ComponentType,
): Experiment => ({ slug, title, tag, poster: `/experiments/${slug}.webp`, Component });

const EXPERIMENTS: Experiment[] = [
  experiment("copy", "Copy", "Motion", CopyExperiment),
  experiment("figma-select", "Figma Select", "UI", FigmaSelect),
  experiment("video-player", "Video Player", "Video", VideoPlayerExperiment),
  experiment("slop-detector", "Slop Detector", "3D", SlopDetector),
  experiment("frosted-camera", "Frosted Camera", "Camera", FrostedCamera),
  experiment("scroll-mask-fade", "Scroll Mask Fade", "Scroll", ScrollMaskFade),
  experiment("font-smoothing", "Font Smoothing", "Type", FontSmoothing),
  experiment("lazy-image", "Lazy Image", "Image", LazyImage),
  experiment("depth-input", "Depth Input", "Input", DepthInput),
  experiment("crt-terminal", "CRT Terminal", "Terminal", CrtChat),
  experiment("ios-context-menu", "iOS Context Menu", "Menu", IosContextMenu),
  experiment("text-shimmer", "Text Shimmer", "Type", TextShimmerExperiment),
];

const TRANSITION = { duration: 0.45, ease: [0.22, 1, 0.36, 1] } as const;

interface ExperimentsSearch {
  demo?: string;
}

export const Route = createFileRoute("/experiments")({
  validateSearch: (search: Record<string, unknown>): ExperimentsSearch => {
    const demo = search.demo;
    return typeof demo === "string" && EXPERIMENTS.some((e) => e.slug === demo) ? { demo } : {};
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
  const close = useCallback(() => navigate({ search: {}, resetScroll: false }), [navigate]);

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
      <div className="md:grid md:grid-cols-9 md:gap-x-6">
        <div className="md:col-span-9">
          <ul className="grid grid-cols-1 gap-1 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9">
            {EXPERIMENTS.map((item) => (
              <ExperimentTile
                key={item.slug}
                experiment={item}
                isActive={activeSlug === item.slug}
                morph={!isMobile}
                onOpen={() => open(item.slug)}
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
  const { title, poster, Component } = experiment;
  const expanded = isActive && morph;

  // Hide a missing poster gracefully instead of showing a broken-image glyph.
  const [posterError, setPosterError] = useState(false);

  return (
    // 4:3 cell — matches the poster ratio (so object-cover never crops) and the dialog ratio
    // (so the open morph is a clean uniform scale).
    // Fixed-size placeholder so the grid never reflows while the tile lifts into the expanded view.
    <li className="relative aspect-[4/3]">
      <motion.div
        layout
        data-experiment-tile={expanded ? "open" : "closed"}
        onKeyDown={(e) => {
          if (expanded && e.key === "Escape") onClose();
        }}
        className={cn(
          "group overflow-hidden",
          expanded
            ? // Definite width AND height (not aspect-ratio): inset-0 pins top/bottom, so
              // aspect-ratio would be ignored and the height would stretch to the viewport.
              // has-[[data-menu-open]]: lets the iOS context menu overflow instead of clipping.
              cn(
                "fixed inset-0 z-[110] m-auto rounded-lg bg-surface dark:bg-neutral-950 has-[[data-menu-open]]:overflow-visible",
                DIALOG_SIZE,
              )
            : "absolute inset-0 bg-surface-secondary",
        )}
      >
        {/* Resting state: a poster preview — no live component, so the grid stays cheap and the
            morph has nothing to resize. Fades out as the tile expands. */}
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-200",
            expanded ? "pointer-events-none opacity-0" : "opacity-100",
          )}
        >
          {!posterError && (
            <img
              src={poster}
              alt=""
              loading="lazy"
              decoding="async"
              onError={() => setPosterError(true)}
              className="absolute inset-0 size-full object-cover"
            />
          )}

          <div className="absolute inset-x-0 bottom-0 p-3">
            {/* White + difference inverts against whatever poster is behind, so the title
                stays legible over light and dark previews alike. */}
            <span className="type-tiny-strong leading-tight text-white mix-blend-difference">
              {title}
            </span>
          </div>
        </div>

        {/* Live component mounts only when expanded, laid out at the final dialog size so it
            never resizes during the morph; it cross-fades in over the box scale. */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              key="live"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center font-pretendard"
            >
              <Component />
            </motion.div>
          )}
        </AnimatePresence>

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
              // Pulls focus into the dialog on open so Escape (handled on the container
              // above) is reachable without a global key listener.
              autoFocus
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
