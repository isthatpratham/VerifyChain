/**
 * useTilt.js
 * Cursor-responsive 3D tilt micro-interaction hook.
 * Calculates cursor displacement relative to element center to apply subtle perspective tilt.
 * Grounded in BRAND GUIDELINES: subtle, restrained, no cartoonish bounce.
 *
 * Usage:
 *   const ref = useTilt({ max: 6, scale: 1.01 });
 *   <div ref={ref}>...</div>
 */
import { useEffect, useRef } from 'react';

/**
 * @param {Object} [options]
 * @param {number} [options.max=6] — maximum tilt angle in degrees
 * @param {number} [options.scale=1.015] — subtle hover scale multiplier
 * @param {number} [options.perspective=1000] — 3D perspective depth in px
 * @returns {React.RefObject}
 */
export function useTilt({ max = 6, scale = 1.015, perspective = 1000 } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    el.style.transformStyle = 'preserve-3d';
    el.style.transition = 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)';

    const handleMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (((y - centerY) / centerY) * -max).toFixed(2);
      const rotateY = (((x - centerX) / centerX) * max).toFixed(2);

      el.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, 1)`;
    };

    const handleMouseLeave = () => {
      el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [max, scale, perspective]);

  return ref;
}
