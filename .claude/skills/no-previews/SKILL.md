---
name: no-previews
description: "ALWAYS ACTIVE. In a local environment, never verify work by opening previews. Do not start the app just to screenshot it, and do not drive it with browser/preview automation (Claude Preview, browser MCPs, computer-use). They are slow. Verify with typecheck, lint, build, and quick curl checks instead. Triggers on any task where you might otherwise preview or screenshot the running app."
---

# No Previews (local)

When working locally, don't reach for previews to check your work. Spinning up the app, taking screenshots, and driving a browser is slow and rarely tells you more than the fast checks already do.

## Don't

- Open a visual preview or screenshot the running app to "see if it worked".
- Use browser or preview automation (Claude Preview MCP, browser MCP, computer-use) to click through the UI.
- Start a long-running dev server just to eyeball a change.

## Do instead

Verify with the fast, headless tools:

- `bun run typecheck` — catches type and API errors.
- `bun run lint` — catches correctness issues.
- `bun run build` — proves the app compiles and pages render.
- A quick `curl` against a briefly-started server if you truly need to confirm a route responds.

## The exception

If the user explicitly asks for a screenshot, a visual check, or to drive the UI, do it. This rule is about not *reaching for* previews on your own — not about refusing a direct request.
