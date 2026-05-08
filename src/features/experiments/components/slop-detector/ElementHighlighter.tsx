import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useContainer } from "./lib/container";
import { useStore } from "./lib/store";

const TARGET_TAGS = new Set([
  "P",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "IMG",
  "PICTURE",
  "FIGURE",
  "SVG",
  "VIDEO",
  "UL",
  "OL",
  "LI",
  "A",
  "CODE",
  "PRE",
  "BLOCKQUOTE",
  "BUTTON",
  "SPAN",
]);

const SKIP_TAGS = new Set(["HTML", "BODY", "MAIN", "ARTICLE", "SECTION"]);
const POLL_S = 0.08;

function hasBackgroundImage(el: Element): boolean {
  const bg = window.getComputedStyle(el).backgroundImage;
  return bg !== "none" && bg !== "";
}

function findInnerImage(el: Element): Element | null {
  return el.querySelector("img, picture, svg, video");
}

export function ElementHighlighter({ probeTip }: { probeTip: THREE.Object3D | null }) {
  const { camera, gl } = useThree();
  const container = useContainer();
  const wp = useMemo(() => new THREE.Vector3(), []);
  const lastT = useRef(0);
  const current = useRef<Element | null>(null);

  useEffect(() => {
    return () => {
      current.current = null;
      useStore.getState().setHighlighted(null);
    };
  }, []);

  useFrame(({ clock }) => {
    if (!probeTip) return;
    const powered = useStore.getState().powered;

    const dragging = useStore.getState().dragging;
    if (!powered || !dragging) {
      if (current.current) {
        current.current = null;
        useStore.getState().setHighlighted(null);
      }
      return;
    }

    const t = clock.getElapsedTime();
    if (t - lastT.current < POLL_S) return;
    lastT.current = t;

    probeTip.getWorldPosition(wp);
    wp.project(camera);
    const rect = gl.domElement.getBoundingClientRect();
    const x = (wp.x + 1) * 0.5 * rect.width + rect.left;
    const y = (1 - wp.y) * 0.5 * rect.height + rect.top;

    const containerEl = container;
    if (!containerEl) {
      if (current.current) {
        current.current = null;
        useStore.getState().setHighlighted(null);
      }
      return;
    }
    const bounds = containerEl.getBoundingClientRect();
    if (
      x < bounds.left ||
      y < bounds.top ||
      x > bounds.right ||
      y > bounds.bottom
    ) {
      if (current.current) {
        current.current = null;
        useStore.getState().setHighlighted(null);
      }
      return;
    }

    let el: Element | null = document.elementFromPoint(x, y);
    let resolved: Element | null = null;
    while (el && el !== document.documentElement && containerEl.contains(el)) {
      if (SKIP_TAGS.has(el.tagName)) break;
      if (TARGET_TAGS.has(el.tagName)) {
        resolved = el;
        break;
      }
      const inner = findInnerImage(el);
      if (inner && containerEl.contains(inner)) {
        resolved = inner;
        break;
      }
      if (hasBackgroundImage(el)) {
        resolved = el;
        break;
      }
      el = el.parentElement;
    }

    if (resolved && !containerEl.contains(resolved)) resolved = null;

    if (resolved !== current.current) {
      current.current = resolved;
      useStore.getState().setHighlighted(resolved);
    }
  });

  return null;
}
