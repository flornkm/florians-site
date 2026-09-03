The gap is a hole, not a ring painted in the surface colour: each avatar subtracts its neighbour's circle, grown by the gap, out of its own body. 64px avatars, overlapping by 25%, with a 3px gap — so the neighbour's centre sits at `32 - 64 × 0.75 = -16` and its cut radius at `32 + 3`.

```html
<svg width="64" height="64" viewBox="0 0 64 64">
  <mask id="body">
    <rect width="100%" height="100%" fill="black" />
    <circle cx="32" cy="32" r="32" fill="white" />
    <circle cx="-16" cy="32" r="35" fill="black" />
  </mask>
  <g mask="url(#body)">
    <circle cx="32" cy="32" r="32" fill="#4a5ec8" />
    <text x="32" y="32" text-anchor="middle" dominant-baseline="central">FK</text>
  </g>
</svg>
```

```css
.avatar + .avatar {
  margin-left: -16px;
} /* 25% of 64 */
```

If you do want a ring, build it from the same two circles so it hugs the cut instead of crossing it: the avatar circle inset by half the stroke, masked by the grown neighbour, plus the neighbour's arc clipped back to the body.

```html
<g fill="none" stroke-width="1" stroke="rgb(0 0 0 / 0.2)">
  <circle cx="32" cy="32" r="31.5" mask="url(#ring)" />
  <circle cx="-16" cy="32" r="35.5" clip-path="url(#clip)" />
</g>
```

The initials need a nudge too. The crescent eats the left of a clipped avatar, so its optical centre sits right of `cx` — halfway toward the visible band's midpoint, `(-16 + 35) / 4`, reads centred. The full midpoint overshoots.
