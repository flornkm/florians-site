The trap is that a positioned element with a `z-index` starts its own stacking context, so a menu's desperate 9999 is only ever measured against its siblings inside the toolbar — and the toolbar as a whole still loses to the panel below it. No number typed into the menu can fix that.

```jsx
<div style={{ position: "absolute", zIndex: 1 }}>
  {/* toolbar — this z-index is what traps everything below it */}
  <div style={{ position: "absolute", zIndex: 9999 }}>…menu…</div>
</div>
<div style={{ position: "absolute", zIndex: 2 }}>…content…</div>
```

The fix ships no `z-index` at all. Both panels are absolutely positioned off their own fixed offsets rather than their index, so reordering the DOM changes which one paints on top and moves nothing on screen.

```jsx
<div className="relative">{menuOpen ? [content, toolbar] : [toolbar, content]}</div>
```

Keep the toolbar last for as long as the menu is on screen, not just while it is open — swapping back the instant the state flips drops the menu behind the panel mid-fade.
