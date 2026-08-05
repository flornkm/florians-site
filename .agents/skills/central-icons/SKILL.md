---
name: central-icons
description: "ALWAYS ACTIVE. Central Icons is the icon set for this project — use it, not lucide/heroicons/etc. Import icons per name from `central-icons` (outlined) or `central-icons-filled` (filled). Triggers whenever adding, choosing, or rendering an icon."
---

# Central Icons

This project uses [Central Icons](https://iconists.co/central) as its icon set — the round style with 1px corner radius and a 2px stroke. Reach for these before any other icon library.

## Two variants

- **Outlined** (default) — package `central-icons` → `@central-icons-react/round-outlined-radius-1-stroke-2`
- **Filled** — package `central-icons-filled` → `@central-icons-react/round-filled-radius-1-stroke-2`

Both expose the same icon names, so switching a variant is just changing the import path.

## Usage

Import per icon from its subpath (this tree-shakes; avoid namespace/barrel imports):

```tsx
import { IconCrossSmall } from "central-icons/IconCrossSmall";
import { IconStar as IconStarFilled } from "central-icons-filled/IconStar";

<IconCrossSmall className="size-4" />
<IconStarFilled className="size-5 text-tertiary" />
```

Size and color with the surrounding Tailwind classes (`size-4`, `text-tertiary` / `fill-*`), like the rest of the codebase — don't pass `size`/`width`/`height`/`color` props even though the components accept them.

## Finding an icon name

Names are `Icon<PascalCase>` (e.g. `IconArrowRight`, `IconTrashCan`, `IconMagnifier`). There are ~1470 icons. To list what's available:

```bash
ls node_modules/central-icons | grep -i <keyword>
```

## Installing / license

The packages are licensed (a `CENTRAL_LICENSE_KEY` from iconists.co is needed for a fresh licensed install). They're already declared as dependencies, so `bun install` pulls them. To reinstall the licensed way, put the key in `.env` and run `bun run install-icons` at the repo root.
