---
name: shadow-ring
description: "ALWAYS ACTIVE. In this project an elevation shadow must never be paired with a `border` (or a separate `ring`). Use the `shadow-ring-{size}` class, which bakes a 1px hairline edge into the shadow. Triggers whenever adding, editing, or reviewing a box-shadow / elevated surface — cards, popovers, dialogs, dropdowns, menus, tooltips, sheets, hover cards, toasts."
---

# Shadows never carry a border — use the shadow-ring class

This site ships shadows through [shadow-ring.css](src/styles/shadow-ring.css) (with the raw `--smooth-shadow-*` values coming from shadow-plugin via globals.css). Two families:

- `shadow-{size}` — a stacked, ringless shadow (mapped to `--smooth-shadow-*` in globals.css).
- `shadow-ring-{size}` — the same shadow with a **1px hairline ring baked in as the final layer**, so the edge morphs into the shadow instead of sitting beside it.

Sizes for both: `xs`, `sm`, `md`, `lg`, `xl`, `2xl`.

## The rule

**Any element that has an elevation shadow must get its edge from `shadow-ring-{size}` — never from a separate `border` or `ring` utility on the same element.**

A `border` next to a shadow reads washed-out and greyed, and it doubles the edge. The baked hairline stays crisp and continuous with the shadow.

```tsx
// ❌ Don't — border + shadow stack into a washed, doubled edge
<div className="rounded-xl border bg-surface shadow-md">…</div>
<div className="rounded-xl border bg-surface shadow-lg ring-1 ring-black/10">…</div>

// ✅ Do — one class carries both the shadow and the hairline
<div className="rounded-xl bg-surface shadow-ring-md">…</div>
<div className="rounded-xl bg-surface shadow-ring-lg">…</div>
```

When you touch an elevated surface (card, popover, dialog, dropdown/menu, tooltip, sheet, hover card, toast, command palette), reach for `shadow-ring-{size}` and **remove any `border`, `border-*`, `ring-1`, or `ring-*` that was providing its edge.**

## Tuning color

- **Ring (hairline) color:** the `hairline-{color}/{opacity}` utility — e.g. `shadow-ring-md hairline-black/10` for a touch more definition. The default (`--shadow-hairline`) already flips to a light hairline in dark mode, so most surfaces need nothing.
- **Shadow color:** Tailwind's `shadow-{color}` — e.g. `shadow-blue-500` for a tinted glow.

## Trap: `--shadow` / `--shadow-lg` are COLOR tokens here

colors.css overloads `--shadow` and `--shadow-lg` as flat *color* tokens (backing the `shadow-muted` / `shadow-emphasis` color utilities). `var(--shadow-*)` in a box-shadow therefore resolves to a bare color — an invalid shadow layer that silently drops the elevation. Always compose custom shadows from `--smooth-shadow-*`, never `--shadow-*`.

## When a border is still fine

The rule is specifically about **shadow + edge**. A `border` remains correct on **flat, unelevated** elements that have no shadow:

- Dividers, separators, table cell/row lines.
- Inputs, textareas, and selects at rest (no elevation).
- Section outlines and inline chips that sit flush on the page.

If such an element later gains a shadow (e.g. a focused/hovered card that lifts), switch it from `border … shadow-*` to `shadow-ring-*` at the same time.

For **dark elevated surfaces** specifically, the embossed-edge recipe is one bright inner border (`dark:border-white/10`) plus a dark outer seam (`dark:hairline-black/60`) — never two bright lines.

## Reviewing existing code

Treat `border` and `shadow-` (or `ring-`) appearing together in one `className` as a smell to fix. Replace the pair with the matching `shadow-ring-{size}` and drop the border/ring.
