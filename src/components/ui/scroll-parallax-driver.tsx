"use client";

import { useEffect } from "react";

/**
 * Feeds the scroll position into the `--scroll-y` CSS variable so `.parallax-*`
 * decor layers can drift at their own speeds while the user scrolls.
 *
 * Implemented as a change-detecting rAF loop rather than a `scroll` listener:
 * it costs one number comparison per frame, keeps working no matter what
 * initiates the scroll (wheel, keyboard, anchor jumps, automation), and pauses
 * automatically in background tabs. Renders nothing; skipped entirely under
 * prefers-reduced-motion.
 */
export function ScrollParallaxDriver() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let frame = 0;
    let lastY = -1;

    const update = () => {
      const y = window.scrollY;
      if (y !== lastY) {
        lastY = y;
        document.documentElement.style.setProperty("--scroll-y", `${y}px`);
      }
    };

    const tick = () => {
      update();
      frame = requestAnimationFrame(tick);
    };

    update(); // initial position (also covers restored scroll on reload)
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return null;
}
