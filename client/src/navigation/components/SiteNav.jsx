/**
 * SiteNav.jsx
 * The complete site-level navigation bar.
 *
 * Combines:
 *   - NavigationContainer (sticky wrapper, scroll states)
 *   - NavigationLogo
 *   - DesktopNavigation
 *   - NavigationActions (desktop)
 *   - NavHamburger (mobile trigger)
 *   - MobileNavigation (portal overlay)
 *
 * Scroll behaviour:
 *   - At page top: transparent bg, no border
 *   - Scrolled:    solid bg, bottom border, xs shadow
 *   - Scrolling down (past 120px): hides
 *   - Scrolling up:  shows immediately
 *
 * Layout:
 *   H-14 (56px) — proportional, not oversized
 *   Horizontal padding matches container token
 */
import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavScroll } from '../hooks/useNavScroll';
import { NavigationContainer } from './NavigationContainer';
import { NavigationLogo } from './NavigationLogo';
import { DesktopNavigation } from './DesktopNavigation';
import { NavigationActions } from './NavigationActions';
import { NavHamburger } from './NavHamburger';
import { MobileNavigation } from './MobileNavigation';

export function SiteNav() {
  const auth = useContext(AuthContext);
  const isAuthenticated = auth?.user != null;
  const { scrolled, visible } = useNavScroll();
  const [mobileOpen, setMobileOpen] = useState(false);

  const openMobile  = () => setMobileOpen(true);
  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <NavigationContainer scrolled={scrolled} visible={visible}>
        {/* Inner row */}
        <div className="flex items-center justify-between h-14 px-5 lg:px-8 max-w-[--container-xl] mx-auto">
          {/* Left — Logo */}
          <NavigationLogo />

          {/* Centre — Desktop links */}
          <DesktopNavigation isAuthenticated={isAuthenticated} />

          {/* Right — Actions */}
          <div className="flex items-center gap-2">
            {/* Desktop actions (hidden on mobile) */}
            <div className="hidden md:flex">
              <NavigationActions context="desktop" />
            </div>

            {/* Mobile hamburger (hidden on desktop) */}
            <div className="flex md:hidden">
              <NavHamburger open={mobileOpen} onClick={mobileOpen ? closeMobile : openMobile} />
            </div>
          </div>
        </div>
      </NavigationContainer>

      {/* Mobile panel — rendered via portal */}
      <MobileNavigation
        open={mobileOpen}
        onClose={closeMobile}
        isAuthenticated={isAuthenticated}
      />

      {/* Spacer — prevents content from rendering behind fixed nav */}
      <div className="h-14" aria-hidden="true" />
    </>
  );
}
