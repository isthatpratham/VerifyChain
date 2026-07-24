/**
 * useNavScroll.js
 *
 * Computes scroll-linked navbar appearance state:
 *   - visible  — whether nav should be shown (hidden while scrolling fast down, shown at top or scrolling up)
 *   - scrolled — whether scroll position is past threshold (triggers bg/shadow)
 *
 * Hides navbar only when user has scrolled significantly down AND is actively scrolling down.
 * Always shows navbar when near top or scrolling up.
 *
 * Uses passive rAF-throttled scroll listener for performance.
 */
import { useState, useEffect, useRef } from 'react';

const SCROLL_THRESHOLD   = 8;    // px — when background appears
const HIDE_THRESHOLD     = 120;  // px — minimum scroll before hide is considered
const HIDE_DELTA         = 60;   // px scrolled down before hiding navbar

/**
 * @returns {{ scrolled: boolean, visible: boolean }}
 */
export function useNavScroll() {
  const [scrolled,  setScrolled]  = useState(false);
  const [visible,   setVisible]   = useState(true);
  const lastY   = useRef(0);
  const delta   = useRef(0);
  const rafId   = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const update = () => {
      const y = window.scrollY;
      const diff = y - lastY.current;

      setScrolled(y > SCROLL_THRESHOLD);

      if (y < HIDE_THRESHOLD) {
        // Near top — always show
        setVisible(true);
        delta.current = 0;
      } else if (diff > 0) {
        // Scrolling down — accumulate delta
        delta.current += diff;
        if (delta.current > HIDE_DELTA) setVisible(false);
      } else {
        // Scrolling up — immediately show
        delta.current = 0;
        setVisible(true);
      }

      lastY.current = y;
      rafId.current = null;
    };

    const onScroll = () => {
      if (rafId.current) return;
      rafId.current = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update(); // initial
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return { scrolled, visible };
}
