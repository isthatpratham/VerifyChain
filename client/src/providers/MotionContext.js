/**
 * MotionContext.js
 * Shared context object for motion preference.
 * Separated from MotionProvider.jsx to satisfy react-refresh rules.
 */
import { createContext } from 'react';

export const MotionContext = createContext({ prefersReducedMotion: false });
