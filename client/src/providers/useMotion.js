/**
 * useMotion.js
 * Hook to read prefers-reduced-motion preference from MotionContext.
 * @returns {{ prefersReducedMotion: boolean }}
 */
import { useContext } from 'react';
import { MotionContext } from './MotionContext';

export function useMotion() {
  return useContext(MotionContext);
}
