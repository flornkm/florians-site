---
name: reliable-maintainable-code
description: Write code other humans can read, change, and trust. Keep files small, plans concise, abstractions earned. Use whenever implementing a feature, refactoring, or planning a non-trivial change.
---

# Reliable, maintainable code

The next person to open this file should be able to understand it without you in the room. Optimize for **clarity, small surface area, and reversibility** — not cleverness, not future-proofing, not personal style.

## Plan before you code — but keep it short

For any change beyond a one-line fix:

- State the goal in **one sentence**.
- List the files you will touch and what changes in each (one line each).
- Note the one thing that could go wrong and how you would catch it.

If the plan does not fit on a screen, the change is too big — split it.

## File and function size

- **Files: aim for under ~300 lines.** If a file grows past that, it is usually doing more than one thing — extract the second thing.
- **Functions: aim for under ~50 lines and one responsibility.** If you need a comment to explain a section, that section probably wants to be its own function with a name.
- **Components: one concept per file.** A 600-line React component with five `useState`s and three `useEffect`s is a refactor, not a component.
- Module boundaries should match how a reader would search for things, not how the code grew historically.

## Earn your abstractions

- Three similar lines is **not** a pattern. Wait for the third real caller before extracting.
- Do not add config options, feature flags, strategy interfaces, or hooks for "future" callers that do not exist.
- A copy-paste that makes the diff obvious is better than a clever helper that hides what changes.
- Delete dead code, unused exports, and "kept for backwards compatibility" shims unless something on disk actually still uses them.

## Reliability defaults

- **Validate at boundaries, trust inside.** User input, network responses, env vars get checked once at the edge. Internal calls do not need defensive `if` walls.
- **Fail loudly in development, gracefully at the boundary in production.** Do not swallow errors with empty `catch` blocks.
- **No partial implementations.** Either the feature works end-to-end on the happy path, or it does not ship. No `// TODO: handle errors later`, no stubbed functions that return fake data.
- **No half-removed code.** If you remove a feature, remove its callers, types, tests, and config in the same change.
- **Match existing conventions** in the file/module before introducing new ones.

## Naming

- Names describe **what the thing is or returns**, not how it is implemented.
- Booleans read as questions: `isReady`, `hasAccess`, `shouldRetry`.
- Avoid `data`, `info`, `manager`, `helper`, `utils` as the whole name — say what kind.
- If you cannot name it, you do not understand it yet.

## What to skip

- Speculative generality ("we might need this elsewhere later").
- Wrappers that only re-export.
- Compatibility shims for callers that do not exist.
- Comments that restate the code (see the `no-fluff-comments` skill).
- Tests that only assert the mock you just wrote.

## Definition of done

Before declaring a change complete:

1. The diff is the **smallest** one that solves the problem.
2. A reader unfamiliar with the change can guess what each touched function does from its name.
3. No file you created is over ~300 lines without a reason you can state in one sentence.
4. There is nothing left half-done, commented out, or marked TODO without a concrete trigger.
5. You have actually run the thing (typecheck, test, or the feature in the UI) — not just looked at the code.

If any of those fail, the change is not done yet — keep working or split the scope.
