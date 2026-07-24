/**
 * usePageTransition.js
 *
 * Provides 'entered' boolean state for page-level fade/slide-in.
 * Flip classes using vc-page-enter / vc-page-enter-active from motion.css.
 *
 * Usage:
 *   const entered = usePageTransition();
 *   <main className={`vc-page-enter ${entered ? 'vc-page-enter-active' : ''}`}>
 */
import { useState, useEffect } from 'react';

/**
 * @param {number} [delayMs=16] — one frame delay before triggering transition
 * @returns {boolean} entered
 */
export function usePageTransition(delayMs = 16) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setEntered(true), delayMs);
    return () => clearTimeout(id);
  }, [delayMs]);

  return entered;
}
