# Experiment posters

One transparent WebP per experiment, named `<slug>.webp`, used as the grid preview.
A single transparent image works on both the light and dark grid.

These are generated automatically — don't hand-edit. With the dev server running:

```bash
bun run dev
bun run capture:experiments
```

The script opens each experiment's dialog in headless Chrome, isolates it on a
transparent background (clearing the dialog + page backgrounds, and the root
`bg-primary` for the few components that paint one), then downscales and encodes
to WebP with `cwebp`. Components that paint their own opaque background (e.g. the
CRT) simply stay opaque.

Note: foreground colors are captured from the light theme, so the text-only
previews (font-smoothing, scroll-mask-fade, text-shimmer) read faintly in dark
mode — accepted tradeoff for one file per component.

Slugs: video-player, slop-detector, frosted-camera, scroll-mask-fade,
font-smoothing, lazy-image, depth-input, crt-terminal, ios-context-menu,
text-shimmer
