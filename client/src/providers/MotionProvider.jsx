/**
 * MotionProvider.jsx
 * Provides prefers-reduced-motion context to the entire app.
 * Components can consume this to conditionally skip animations.
 *
 * Note: CSS already handles reduced-motion via media query in tokens.css.
 * This context exists for JS-driven animations that need the same signal.
 */
import { useState, useEffect } from 'react';
import { MotionContext } from './MotionContext';

export function MotionProvider({ children }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <MotionContext.Provider value={{ prefersReducedMotion }}>
      {children}
    </MotionContext.Provider>
  );
}
