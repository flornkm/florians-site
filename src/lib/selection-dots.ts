// WebKit only honors color/background-color inside ::selection, so the dotted
// underline from globals.css never paints in Safari. It does paint decorations in
// ::highlight() though, so on WebKit we mirror the live selection into the
// "selection-dots" highlight. Gated to WebKit: Chrome/Firefox already draw the
// dots natively, and layering the highlight on top would double-paint them.
let initialized = false;

export function initSelectionDots() {
  if (initialized) return;
  initialized = true;

  const isWebKit = /apple/i.test(navigator.vendor);
  if (!isWebKit || typeof Highlight === "undefined" || !("highlights" in CSS)) return;

  let frame = 0;
  const mirror = () => {
    frame = 0;
    const selection = document.getSelection();
    const highlight = new Highlight();
    for (let i = 0; i < (selection?.rangeCount ?? 0); i++) {
      const range = selection!.getRangeAt(i);
      if (!range.collapsed) highlight.add(range.cloneRange());
    }
    if (highlight.size > 0) CSS.highlights.set("selection-dots", highlight);
    else CSS.highlights.delete("selection-dots");
  };

  // selectionchange fires for every caret step of a drag; coalesce per frame.
  document.addEventListener("selectionchange", () => {
    if (!frame) frame = requestAnimationFrame(mirror);
  });
}
