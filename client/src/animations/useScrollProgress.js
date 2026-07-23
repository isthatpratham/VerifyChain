/**
 * useScrollProgress.js
 * Tracks normalized scroll progress (0.0 to 1.0) of a target container.
 * Perfect for sticky scroll narrative sections and scroll-driven step progression.
 */
import { useState, useEffect, useRef } from 'react';

/**
 * @param {Object} [options]
 * @param {number} [options.offset=0] — top offset threshold
 * @returns {[React.RefObject, number]} [ref, progress]
 */
export function useScrollProgress() {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);
  const rafId = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setProgress(1);
      return;
    }

    const updateProgress = () => {
      const rect = el.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const totalDistance = rect.height - viewportHeight;
      if (totalDistance <= 0) {
        setProgress(1);
        return;
      }

      const currentScroll = -rect.top;
      const rawProgress = Math.max(0, Math.min(1, currentScroll / totalDistance));
      setProgress(parseFloat(rawProgress.toFixed(3)));
    };

    const onScroll = () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(updateProgress);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateProgress();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return [ref, progress];
}
