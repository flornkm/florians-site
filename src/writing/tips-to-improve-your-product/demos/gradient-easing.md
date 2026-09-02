A two-stop `linear-gradient` fades at a constant rate, which puts a visible edge where it meets the image. The ease is one line of maths — `alpha(p) = A × (1 - p)ⁿ` — sampled into enough stops that each straight segment is shorter than the curvature it stands in for.

```js
const A = 0.62; // scrim alpha at the bottom
const N = 1.6; // the exponent is the whole ease; above 1 keeps the top flat
const HOLD = 0.2; // fraction of the bottom held near full strength
const STOPS = 16;

const ramp = Array.from({ length: STOPS + 1 }, (_, i) => {
  const p = i / STOPS;
  const alpha = A * (1 - p);
  const eased = i === 0 ? 0 : HOLD + (1 - HOLD) * (1 - (1 - p) ** (1 / N));
  return `rgb(0 0 0 / ${alpha.toFixed(4)}) ${(eased * 100).toFixed(3)}%`;
});

element.style.backgroundImage = `linear-gradient(to top, ${ramp.join(", ")})`;
```

A cosine arrives flat at _both_ ends, and the flat end at the bottom is what builds a slab: the ramp sits on its darkest value instead of leaving it. Flatness is only worth anything at the top, where the scrim has to vanish into the photograph without drawing a line. The hold is there because easing otherwise drains the exact band a caption stands on — a fifth keeps that ground steady; a third reads as a slab again.

Sixteen stops is not arbitrary either. Dropping to eight nearly halves the improvement, taking the kink where the eased ramp lands from 35% of the linear one's back up past 50%.
