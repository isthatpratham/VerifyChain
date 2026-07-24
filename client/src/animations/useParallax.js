/**
 * useParallax.js
 *
 * Scroll-linked parallax hook.
 * Sets a CSS custom property on the element that motion.css reads via
 * translateY(var(--vc-parallax-y)).
 *
 * Uses passive scroll listener for performance.
 * Uses requestAnimationFrame to avoid layout thrashing.
 *
 * Usage:
 *   const ref = useParallax({ speed: 0.15 });
 *   <div ref={ref} className="vc-parallax">...</div>
 */
import { useEffect, useRef } from 'react';

/**
 * @param {Object} options
 * @param {number}  [options.speed=0.1]  — parallax intensity (0 = no movement, 0.3 = strong)
 * @param {string}  [options.direction='up']  — 'up' | 'down'
 * @returns {React.RefObject}
 */
export function useParallax({ speed = 0.1, direction = 'up' } = {}) {
  const ref = useRef(null);
  const rafId = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced-motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const multiplier = direction === 'up' ? -1 : 1;

    const update = () => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      // Normalise: 0 when element center is at viewport center
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = viewportHeight / 2;
      const offset = (elementCenter - viewportCenter) * speed * multiplier;
      el.style.setProperty('--vc-parallax-y', `${offset.toFixed(2)}px`);
    };

    const onScroll = () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update(); // Initial position

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [speed, direction]);

  return ref;
}
