The knob is pinned to both ends of the track rather than translated, so its width is simply whatever the two offsets leave over. Pulling the far one in both elongates it and points it in the direction it is about to travel, in one property — a translated knob would need a second, competing scale to do the same, and would smear its rounded caps doing it. The track never changes size, so nothing beside it gets pushed around.

```css
/* 72×32 track, 3px of padding, so the knob rests at 40 across and goes to 49 held. */
.knob {
  position: absolute;
  inset-block: 3px;
  left: 3px;
  right: 29px;
  border-radius: 9999px;
  transition:
    left 280ms cubic-bezier(0.32, 0.72, 0, 1),
    right 280ms cubic-bezier(0.32, 0.72, 0, 1);
}
[aria-checked="true"] .knob {
  left: 29px;
  right: 3px;
}

/* Held: pull in the offset on the side it is about to cross, and get there faster. */
.switch:active .knob {
  right: 20px;
  transition-duration: 160ms;
  transition-timing-function: ease-out;
}
.switch[aria-checked="true"]:active .knob {
  left: 20px;
  right: 3px;
}
```

Quick on the way out, unhurried on the way back, which is what makes the release read as elastic rather than as a second animation. Make it a pill at rest, not a circle: a circle that only becomes a pill on press reads as a glitch.
