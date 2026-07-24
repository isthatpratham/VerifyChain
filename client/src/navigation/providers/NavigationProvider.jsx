/**
 * NavigationProvider.jsx
 * Provides navigation state: mobile menu open/close + scroll position.
 *
 * scroll thresholds:
 *   scrolled      — navbar bg/border becomes visible (> 8px from top)
 *   scrolledPast  — navbar hide/show on scroll direction (> 120px)
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { NavigationContext } from '../NavigationContext';

export function NavigationProvider({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrolledPast, setScrolledPast] = useState(false);
  const lastScrollY = useRef(0);
  const rafId = useRef(null);
  const location = useLocation();

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Scroll listener — passive, rAF-throttled
  useEffect(() => {
    const onScroll = () => {
      if (rafId.current) return;
      rafId.current = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 8);
        setScrolledPast(y > 120);
        lastScrollY.current = y;
        rafId.current = null;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // initial
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  const openMobile   = useCallback(() => setMobileOpen(true),  []);
  const closeMobile  = useCallback(() => setMobileOpen(false), []);
  const toggleMobile = useCallback(() => setMobileOpen((o) => !o), []);

  return (
    <NavigationContext.Provider
      value={{ mobileOpen, scrolled, scrolledPast, openMobile, closeMobile, toggleMobile }}
    >
      {children}
    </NavigationContext.Provider>
  );
}
