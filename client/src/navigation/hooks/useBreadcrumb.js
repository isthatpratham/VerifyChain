/**
 * useBreadcrumb.js
 *
 * Generates breadcrumb items from the current React Router location.
 * Maps path segments to human-readable labels.
 *
 * Usage:
 *   const crumbs = useBreadcrumb();
 *   // [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Business Profile', href: '/profile' }]
 */
import { useLocation } from 'react-router-dom';

/** Map route segments to human-readable labels */
const SEGMENT_LABELS = {
  '':           'Home',
  dashboard:    'Dashboard',
  profile:      'Business Profile',
  verification: 'Verification',
  compliance:   'Compliance',
  settings:     'Settings',
  login:        'Sign in',
  register:     'Create account',
  pricing:      'Pricing',
  about:        'About',
  contact:      'Contact',
};

/**
 * @returns {{ label: string, href: string }[]}
 */
export function useBreadcrumb() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  if (segments.length === 0) return [];

  return segments.map((seg, i) => ({
    label: SEGMENT_LABELS[seg] || seg.charAt(0).toUpperCase() + seg.slice(1),
    href:  '/' + segments.slice(0, i + 1).join('/'),
  }));
}
