/**
 * NavigationContext.js
 * Shared context object for navigation state.
 * Separated for react-refresh compliance.
 */
import { createContext } from 'react';

export const NavigationContext = createContext({
  mobileOpen: false,
  scrolled: false,
  scrolledPast: false,
  openMobile: () => {},
  closeMobile: () => {},
  toggleMobile: () => {},
});
