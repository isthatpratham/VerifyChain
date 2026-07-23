/**
 * DesktopNavigation.jsx
 * Horizontal primary navigation — visible at md+ breakpoints.
 * Renders nav items from a structured config.
 *
 * Hidden below md — MobileNavigation handles smaller screens.
 */
import { NavigationItem } from './NavigationItem';

/** @type {{ to: string; label: string; end?: boolean }[]} */
const PUBLIC_NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/features', label: 'Features' },
  { to: '/solutions', label: 'Solutions' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/about', label: 'About' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
];


/** @type {{ to: string; label: string }[]} */
const AUTH_NAV = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/profile',   label: 'Business Profile' },
];

/**
 * @param {Object} props
 * @param {boolean} props.isAuthenticated
 */
export function DesktopNavigation({ isAuthenticated }) {
  const items = isAuthenticated ? AUTH_NAV : PUBLIC_NAV;

  return (
    <nav
      aria-label="Primary navigation"
      className="hidden md:flex items-center gap-6"
    >
      {items.map((item) => (
        <NavigationItem key={item.to} to={item.to} end={item.end}>
          {item.label}
        </NavigationItem>
      ))}
    </nav>
  );
}
