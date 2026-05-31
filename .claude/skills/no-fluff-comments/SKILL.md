---
name: no-fluff-comments
description: Never write fluff comments. Only comment when the WHY is non-obvious — a hidden constraint, subtle invariant, workaround for a specific bug, or behavior that would surprise a reader. Use whenever writing or editing source files.
---

# No fluff comments

Default: **write no comments**. Well-named identifiers and small functions are the documentation. A comment earns its place only when removing it would genuinely confuse a future reader.

## Allowed

A comment is allowed only if it explains a **WHY that is not visible from the code**:

- A hidden constraint or invariant (`// must stay sorted — binary search below relies on it`)
- A workaround for a specific bug, with a link or ticket
- Non-obvious external behavior (`// API returns 200 with an error body; do not trust status alone`)
- A deliberate tradeoff a reader would otherwise want to "fix"

Keep it to one short line. No multi-paragraph prose, no ASCII art, no banners.

## Forbidden — delete on sight

- **Restating the code.** `// increment counter` above `counter++`.
- **Section banners.** `// ---- helpers ----`, `// === STATE ===`.
- **Tutorial narration.** `// First, we fetch the user. Then we render.`
- **Task / PR references.** `// added for the X flow`, `// fixes #123`, `// per request from Y`. That belongs in the commit message or PR description and rots in the code.
- **TODO without an owner and a concrete trigger.** `// TODO: improve this` is noise. `// TODO(2026-Q3): replace once API v2 ships` is acceptable.
- **Commented-out code.** Delete it. Git remembers.
- **Author tags, change logs, "last modified" headers.** Version control handles this.
- **Docstrings on self-explanatory functions.** A function called `formatCurrency(amount, locale)` does not need a paragraph telling you it formats currency.
- **JSDoc that only restates the TypeScript types.** The types already say it.

## When editing existing code

If you touch a file with fluff comments around the lines you change, delete them in the same edit. Do not add new fluff next to old fluff to "match the style."

## Review checklist

Before saving a file, scan every comment and ask:

1. Does this explain a non-obvious WHY? If no → delete.
2. Would a competent reader of this language already know this? If yes → delete.
3. Is it referencing the current task, ticket, or author? If yes → delete (move to PR description).
4. Is it longer than one line? If yes → shorten or delete.

If none of the comments survive, that is the correct outcome.
