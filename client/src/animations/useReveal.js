/**
 * useReveal.js
 *
 * IntersectionObserver hook for scroll-triggered reveal animations.
 * Adds 'vc-motion-revealed' class when element enters the viewport.
 *
 * Usage:
 *   const ref = useReveal();
 *   <div ref={ref} className="vc-motion-slide-up vc-delay-150">...</div>
 */
import { useEffect, useRef } from 'react';

/**
 * @param {Object} options
 * @param {number}  [options.threshold=0.15]   — fraction of element visible before triggering
 * @param {string}  [options.rootMargin='0px']  — IntersectionObserver rootMargin
 * @param {boolean} [options.once=true]         — remove observer after first reveal
 * @returns {React.RefObject}
 */
export function useReveal({
  threshold = 0.15,
  rootMargin = '0px 0px -40px 0px',
  once = true,
} = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect prefers-reduced-motion — immediately reveal
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('vc-motion-revealed');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('vc-motion-revealed');
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            entry.target.classList.remove('vc-motion-revealed');
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return ref;
}

/**
 * useRevealGroup
 *
 * Observe all children of a container and stagger their reveal.
 * Children must have vc-motion-* classes.
 *
 * @param {Object} options
 * @param {number}  [options.threshold=0.1]
 * @param {number}  [options.staggerMs=75]   — delay increment per child
 * @returns {React.RefObject}
 */
export function useRevealGroup({
  threshold = 0.1,
  rootMargin = '0px 0px -40px 0px',
  staggerMs = 75,
  once = true,
} = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const children = Array.from(container.children);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      children.forEach((child) => child.classList.add('vc-motion-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            children.forEach((child, i) => {
              const existing = child.style.transitionDelay;
              if (!existing || existing === '0ms') {
                child.style.transitionDelay = `${i * staggerMs}ms`;
              }
              child.classList.add('vc-motion-revealed');
            });
            if (once) observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [threshold, rootMargin, staggerMs, once]);

  return ref;
}
