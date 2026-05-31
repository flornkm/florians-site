---
name: react-useeffect
description: Avoid useEffect. Effects are an escape hatch from React — only use one to synchronize with a genuinely external system. Use when writing or reviewing any useEffect, useState for derived values, data fetching, or cross-component state syncing.
---

# Don't reach for useEffect

`useEffect` is an **escape hatch from React**. If there is no external system involved (browser API, third-party widget, network, non-React store), you almost certainly do not need one. Default to "no Effect" and only add one if you can name the external system you are synchronizing with.

Adapted from <https://github.com/softaworks/agent-toolkit/tree/main/skills/react-useeffect> and React's [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect).

## Decision flow

```
Need to react to something?
├── User interaction (click, submit, change)  → event handler
├── Derived from props/state                  → compute in render (+ useMemo if expensive)
├── Reset state when a prop changes           → `key` prop on the component
├── Subscribe to an external store            → useSyncExternalStore
├── Notify parent of a change                 → call the callback in the event handler
└── Synchronize with a non-React system       → useEffect (with cleanup)
```

## Quick reference

| Situation | DON'T | DO |
|---|---|---|
| Derived state | `useState` + `useEffect` | Compute in render |
| Expensive calculation | `useEffect` to cache | `useMemo` |
| Reset state on prop change | `useEffect` with `setState` | `key` prop |
| Respond to a user event | `useEffect` watching state | Event handler |
| Notify parent | `useEffect` calling `onChange` | Call in event handler |
| Fetch data | `useEffect` without cleanup | Framework loader, React Query / SWR, or `useEffect` **with** cleanup |
| Chain of state updates | Multiple `useEffect`s | Compute all next state in one handler |

## Anti-patterns to refuse

1. `useEffect(() => setFullName(first + ' ' + last), [first, last])` — just compute `const fullName = first + ' ' + last`.
2. `useEffect(() => setComment(''), [userId])` — pass `key={userId}` instead.
3. `useEffect(() => { if (added) showToast() }, [added])` — call `showToast()` directly in the click handler.
4. `useEffect(() => { fetch(query).then(setResults) }, [query])` with no cleanup — race condition. Use an `ignore` flag or `AbortController`, or use the framework's data fetching.
5. Effect chains where one Effect's `setState` triggers another Effect — collapse into one event handler.

## When an Effect is actually right

- Subscribing to a WebSocket, browser event, or non-React store (prefer `useSyncExternalStore`).
- Imperatively driving a third-party widget (maps, charts, video players).
- Analytics fired because a view was shown.
- Data fetching when no framework loader exists — and always with cleanup.

## Review checklist

When reviewing or writing an Effect, answer out loud:

1. What external system am I synchronizing with? (If none → delete the Effect.)
2. Could this run in an event handler instead? (If yes → move it.)
3. Is this a derived value? (If yes → compute it.)
4. Is there cleanup for every subscription / fetch / timer?
5. Does it still work under React 18 Strict Mode (mounted twice)?

If you cannot answer #1 with a concrete external system, do not write the Effect.
