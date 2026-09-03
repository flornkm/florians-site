Playful is a real spring sampled into `linear()` rather than approximated by a bezier — a bezier cannot cross its own target, which is the entire character of a spring. This one is underdamped at ζ=0.5: it overshoots 16% of the distance a third of the way through and is settled by the end.

```css
:root {
  --press-spring: linear(
    0,
    0.09,
    0.298,
    0.547,
    0.779,
    0.963,
    1.085,
    1.148,
    1.163,
    1.145,
    1.11,
    1.069,
    1.032,
    1.003,
    0.985,
    0.975,
    0.974,
    0.977,
    0.983,
    0.989,
    1
  );
}

/* Down fast, back slowly. The press is a reaction and has to land inside the same
   moment as the finger; the release is the button recovering. */
.button {
  transition:
    background-color 180ms ease-out,
    scale 420ms var(--press-spring);
}
.button:active {
  transition:
    background-color 180ms ease-out,
    scale 240ms var(--press-spring);
  scale: 0.94;
}
```

Subtle stays exactly where it is and drops tone instead. On a fill already near-black a few points is nothing, so the press takes eleven and stops just short of black — far enough that it cannot be mistaken for hover, short enough that the button is still a surface rather than a hole.

```css
.button {
  background-color: oklch(0.27 0 0);
  transition: background-color 240ms ease-out;
}
.button:hover {
  background-color: oklch(0.31 0 0);
}
.button:active {
  background-color: oklch(0.16 0 0);
  transition: background-color 90ms ease-out;
}
```

Two things that will bite you. Use `scale`, not `transform` — a transition naming only `transform` lets the standalone `scale` property snap. And Safari only honours `:active` on touch when the element or an ancestor carries a touchstart listener, so a button without one is a desktop-only flourish on exactly the devices that have no hover to fall back on:

```js
button.addEventListener("touchstart", () => {});
```
