import { AbsolutePosition } from "@/features/experiments/components/absolute-position-demo";
import { BlurFade } from "@/features/experiments/components/blur-fade-demo";
import { CopyExperiment } from "@/features/experiments/components/copy-demo";
import { CrtChat } from "@/features/experiments/components/crt-chat-demo";
import { DepthInput } from "@/features/experiments/components/depth-input";
import { DragImageDrawer } from "@/features/experiments/components/drag-image-drawer-demo";
import { FigmaSelect } from "@/features/experiments/components/figma-select-demo";
import { FontSmoothing } from "@/features/experiments/components/font-smoothing-demo";
import { FrostedCamera } from "@/features/experiments/components/frosted-camera-demo";
import { IosContextMenu } from "@/features/experiments/components/ios-context-menu-demo";
import { LazyImage } from "@/features/experiments/components/lazy-image-demo";
import { LoginError } from "@/features/experiments/components/login-error-demo";
import { ScrollMaskFade } from "@/features/experiments/components/scroll-mask-fade-demo";
import { ScrollbarGutter } from "@/features/experiments/components/scrollbar-gutter-demo";
import { ShadowRing } from "@/features/experiments/components/shadow-ring-demo";
import { SlopDetector } from "@/features/experiments/components/slop-detector";
import { TextShimmerExperiment } from "@/features/experiments/components/text-shimmer-demo";
import { VariableWeight } from "@/features/experiments/components/variable-weight-demo";
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
  // Transparent posters at public/experiments/<slug>.webp (light) and <slug>-dark.webp
  // (dark). A <picture> media source swaps them by prefers-color-scheme — no JS. Until
  // the files exist the tile falls back to a plain panel.
  poster: string;
  posterDark: string;
  Component: ComponentType;
}

// The centered modal the tile morphs into when opened.
const DIALOG_SIZE = "h-[min(88vh,33rem)] w-[min(92vw,44rem)]";

const experiment = (
  slug: string,
  title: string,
  tag: string,
  Component: ComponentType,
): Experiment => ({
  slug,
  title,
  tag,
  poster: `/experiments/${slug}.webp`,
  posterDark: `/experiments/${slug}-dark.webp`,
  Component,
});

const EXPERIMENTS: Experiment[] = [
  experiment("blur-fade", "Blur Fade", "Motion", BlurFade),
  experiment("absolute-position", "Absolute Position", "Layout", AbsolutePosition),
  experiment("login-error", "Login", "UX", LoginError),
  experiment("variable-weight", "Variable Weight", "Type", VariableWeight),
  experiment("drawer-drag", "Drawer", "Base UI", DragImageDrawer),
  experiment("shadow-ring", "Shadow Ring", "Shadow", ShadowRing),
  experiment("scrollbar-gutter", "Scrollbar Gutter", "Layout", ScrollbarGutter),
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
  const { title, poster, posterDark, Component } = experiment;
  const expanded = isActive && morph;

  // Hide a missing poster gracefully instead of showing a broken-image glyph.
  const [posterError, setPosterError] = useState(false);

  // The morph back into the grid is a `layout` animation, not an unmount — so the box keeps
  // painting at its old DOM position. Without an elevated z-index for the whole animation it
  // would slide back *under* the neighbouring tiles. Hold the lift until the layout settles.
  const [morphing, setMorphing] = useState(false);
  const elevated = expanded || morphing;

  return (
    // 4:3 cell — matches the poster ratio (so object-cover never crops) and the dialog ratio
    // (so the open morph is a clean uniform scale).
    // Fixed-size placeholder so the grid never reflows while the tile lifts into the expanded view.
    <li className="relative aspect-[4/3]">
      <motion.div
        layout
        data-experiment-tile={expanded ? "open" : "closed"}
        onLayoutAnimationStart={() => setMorphing(true)}
        onLayoutAnimationComplete={() => setMorphing(false)}
        style={{ zIndex: elevated ? 110 : undefined }}
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
                "fixed inset-0 m-auto rounded-lg bg-surface dark:bg-neutral-950 has-[[data-menu-open]]:overflow-visible",
                DIALOG_SIZE,
              )
            : "absolute inset-0 bg-surface-secondary",
        )}
      >
        {/* Resting state: a poster preview — no live component, so the grid stays cheap and the
            morph has nothing to resize. Fades out as the tile expands. */}
        <div
          className={cn(
            "absolute inset-0",
            // Fade out on open only; on close it snaps back instantly (no transition class)
            // so the poster — not the live component — is what scales down with the box.
            expanded
              ? "pointer-events-none opacity-0 transition-opacity duration-200"
              : "opacity-100",
          )}
        >
          {!posterError && (
            // <picture> lets the browser pick the dark capture by media query, so the
            // grid never needs to read theme state in JS. onError on the <img> still
            // covers a missing light poster (the resting fallback panel).
            <picture>
              <source srcSet={posterDark} media="(prefers-color-scheme: dark)" />
              <img
                src={poster}
                alt=""
                loading="lazy"
                decoding="async"
                onError={() => setPosterError(true)}
                className="absolute inset-0 size-full object-cover"
              />
            </picture>
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
            never resizes during the morph; it fades in over the box scale. No exit animation:
            on close it unmounts instantly and the poster underneath scales down instead. */}
        {expanded && (
          <motion.div
            key="live"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center font-pretendard"
          >
            <Component />
          </motion.div>
        )}

        {!expanded && (
          <button
            type="button"
            onClick={onOpen}
            aria-label={`Open ${title}`}
            className="absolute inset-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-default"
          />
        )}

        {/* No exit animation: unmounts instantly on close so it doesn't distort while
            the box scales back into the grid. */}
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
      </motion.div>
    </li>
  );
}
