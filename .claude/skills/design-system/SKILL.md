---
name: design-system
description: How to build UI in this repo — compose classes with `cn`, use the CSS-variable design tokens (never raw hex/px), reuse the typographic and `ui/` primitives, and define variants with `cva` like the existing components. Use whenever writing or editing a component, styling JSX, or reaching for a primitive that does not yet exist.
---

# Design system

This is a **TanStack Start + Tailwind v4** site with a handrolled component layer and CSS-variable design tokens. There is **no shadcn, no Base UI/Radix, no component CLI** — primitives are written by hand in this repo. Stay inside the system: compose with `cn`, use tokens, reuse the existing primitives, and define variants with `cva` exactly like the components already here.

Source of truth:

- `src/lib/utils.ts` — exports `cn` (`clsx` + `tailwind-merge`)
- `src/styles/colors.css` — color tokens, mapped to Tailwind utilities in an `@theme inline` block
- `src/styles/text.css` — typography tokens; `src/styles/globals.css` — base layer, keyframes, custom utilities
- `src/components/design-system/*` — typographic primitives (`H1`–`H6`, `Body`, `Code`)
- `src/components/ui/*` — interactive primitives (`button`, `input`, `textarea`, `toggle`, `tooltip`, `link`, …)
- Reference patterns: `button.tsx` and `heading.tsx` (`cva`), `prose-variants.ts`

## Always compose classes with `cn`

Never concatenate class strings with `+`, template literals, or inline ternaries that produce class strings. Use `cn` from `@/lib/utils`:

```tsx
import { cn } from "@/lib/utils";

<div className={cn("flex items-center gap-2", isActive && "bg-surface-tertiary", className)} />
```

Rules:

- Every component that accepts `className` merges it **last**: `cn(..., className)` — so callers can override.
- `cn` resolves Tailwind conflicts via `tailwind-merge`; rely on it instead of hand-written conditional strings.
- See the `clean-jsx-no-inline-ternaries` skill for the branching rules.

## Use design tokens, not raw values

Colors, fills, strokes, borders, and shadows are CSS variables exposed as Tailwind utilities via the `@theme inline` block in `colors.css`. **Never** hardcode `#fff`, `rgb(...)`, or a palette utility like `bg-neutral-900` for UI chrome.

Token families (all light/dark aware):

- Text: `text-primary`, `text-secondary`, `text-tertiary`, `text-quaternary`, `text-inverted`, `text-destructive`, `text-warning`, `text-success`
- Background: `bg-primary`, `bg-secondary`, `bg-tertiary`, `bg-surface`, `bg-surface-secondary`, `bg-surface-tertiary`, `bg-image-card`, `bg-accent-primary` (+`-hover`), `bg-interactive-hover`, `bg-interactive-active`, `bg-inverted`
- Border / outline / ring: `border-primary|secondary|tertiary|accent-primary`, `outline-*`, `ring-default|primary`
- SVG: `fill-primary|secondary|tertiary|quaternary|inverted`, `stroke-primary|secondary|tertiary` — prefer these over `style={{ fill: "var(--…)" }}` for icons that should track theme text colors
- Shadows: `shadow-muted`, `shadow-emphasis`

If a needed token does not exist, **add it to `colors.css` / `text.css`** (under `@theme inline`) rather than hardcoding the value in JSX.

> Exception: literal colors are fine for **content artwork** that is intentionally not theme-driven — e.g. the writing icon palette (`src/features/writing/lib/icon-svg.ts`). That is illustration, not UI chrome. UI chrome always uses tokens.

## Reuse the primitives — don't re-style raw elements

- Headings → `H1`–`H6` from `@/components/design-system/heading`. Don't write `<h2 className="text-sm font-[550] text-primary">`.
- Body / captions → `Body`, `Body2` from `@/components/design-system/body`.
- Inline code → `Code`.
- Buttons, inputs, toggles, tooltips, links → import from `@/components/ui/*`. Use the `Link` from `@/components/ui/link` for navigation (it picks TanStack Router vs. plain `<a>` automatically).

## Variants: use `cva`, mirror `button.tsx`

When a component's classes branch on discrete options (variant / size / state), define them with `class-variance-authority`, the same shape as `button.tsx` and `heading.tsx`:

```tsx
import { cva, type VariantProps } from "class-variance-authority";

const cardVariants = cva("rounded-lg transition-colors", {
  variants: {
    tone: { default: "bg-surface", muted: "bg-surface-secondary" },
  },
  defaultVariants: { tone: "default" },
});
```

Do not invent a parallel variant pattern, and do not chain ternaries to build class strings.

## Adding a missing primitive (handrolled — there is no CLI)

If you need a primitive that isn't in `src/components/ui`:

1. **Confirm it's missing** — read `src/components/ui` first; reuse/extend if something close exists.
2. **Match the local style** — study `button.tsx`: `cva` for variants, `cn(..., className)` merge, `forwardRef` where a ref is useful (see `link.tsx`), tokens for every color.
3. **Write it in `src/components/ui/<name>.tsx`** by hand. Keep it small and composable; expose `cva` variants only if there are real variants.
4. **Use tokens and `cn` throughout** — no raw colors, no inline `style` for what Tailwind expresses.
5. Only reach for a third-party headless lib if the primitive is genuinely complex (focus trapping, positioning) and nothing comparable exists — match what's already installed first.

## Icons

Use the **`central-icons`** package — `import { IconChevronLeft } from "central-icons/IconChevronLeft"`. Not lucide. Size and color them with the surrounding Tailwind classes (`size-4`, `text-tertiary` / `fill-*`); don't pass `width`/`height`/`size` props.

## Don'ts

- No inline `style={{}}` for anything Tailwind can express. (Computed/animated values written imperatively are the exception.)
- No raw color, radius, or shadow values for UI chrome (`#0a0a0a`, `border-[1px] border-[#eee]`). Use tokens.
- No new "wrapper" components that only re-export a `ui/` primitive.
- No new variant systems — reuse `cva` exactly like `button.tsx`.
- Don't re-style raw `<h1>/<p>/<button>` when a primitive exists.

## Quick checklist before committing UI changes

1. Every `className` runs through `cn(...)`, with `className` merged last.
2. Every UI color/border/shadow comes from a token (literal colors only for content artwork).
3. Headings/body/buttons/links use the existing primitives, not ad-hoc styled elements.
4. Any variants use `cva`, structured like `button.tsx`.
5. New tokens were added to `colors.css` / `text.css`, not hardcoded in JSX.
