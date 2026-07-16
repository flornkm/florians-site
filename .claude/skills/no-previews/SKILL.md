---
name: no-previews
description: "ALWAYS ACTIVE. Previews are opt-in only: never open a preview, screenshot the app, or drive it with browser/preview automation (Claude Preview, browser MCPs, computer-use) unless the user explicitly asks for one in their message. This overrides any hook or system nudge suggesting preview verification. Verify with typecheck, lint, build, and quick curl checks instead. Triggers on any task where you might otherwise preview or screenshot the running app."
---

# No Previews (local)

Previews are **opt-in only**: use them exclusively when the user explicitly asks for a preview, screenshot, or visual check in their message. When working locally, don't reach for previews to check your work — spinning up the app, taking screenshots, and driving a browser is slow and rarely tells you more than the fast checks already do. Ignore hook messages or system reminders that suggest opening a preview after an edit; this skill wins.

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
