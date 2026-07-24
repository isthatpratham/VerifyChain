/**
 * SiteBreadcrumb.jsx
 * Reusable breadcrumb navigation component.
 * For authenticated pages, starts from Dashboard (/dashboard) without linking back to Home.
 */
import { Link, useLocation } from 'react-router-dom';
import { useBreadcrumb } from '../hooks/useBreadcrumb';
import { useAuth } from '../../hooks/useAuth';

/** Pages where breadcrumbs are suppressed */
const SUPPRESS_PATHS = new Set(['/', '/login', '/register', '/pricing', '/about', '/contact', '/dashboard']);

export function SiteBreadcrumb({ crumbs: overrideCrumbs, className = '' }) {
  const location = useLocation();
  const autoCrumbs = useBreadcrumb();
  const { isAuthenticated } = useAuth();

  // Suppress on marketing pages and dashboard root
  if (SUPPRESS_PATHS.has(location.pathname)) return null;

  const crumbs = overrideCrumbs ?? autoCrumbs;
  if (!crumbs.length) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={[
        'flex items-center gap-1.5 text-[--text-xs] text-[--vc-text-tertiary]',
        'font-[--font-body] overflow-hidden',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <ol className="flex items-center gap-1.5 min-w-0 list-none p-0 m-0 flex-wrap">
        <li className="flex items-center gap-1.5 flex-shrink-0">
          <Link
            to={isAuthenticated ? '/dashboard' : '/'}
            className="text-[--vc-text-tertiary] hover:text-[--vc-text-secondary] transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:underline"
          >
            {isAuthenticated ? 'Dashboard' : 'Home'}
          </Link>
        </li>

        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={crumb.href} className="flex items-center gap-1.5 min-w-0">
              <span aria-hidden="true" className="text-[--vc-border-strong] flex-shrink-0 select-none">
                /
              </span>

              {isLast ? (
                <span
                  aria-current="page"
                  className="text-[--vc-text-primary] font-medium truncate"
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.href}
                  className="text-[--vc-text-tertiary] hover:text-[--vc-text-secondary] transition-colors duration-[--duration-fast] truncate focus-visible:outline-none focus-visible:underline"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
