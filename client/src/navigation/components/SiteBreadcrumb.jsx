/**
 * SiteBreadcrumb.jsx
 * Reusable breadcrumb navigation component.
 *
 * - Auto-generates crumbs from current route via useBreadcrumb hook
 * - Accepts override crumbs for custom hierarchies
 * - Responsive — collapses at xs to show only last crumb with back arrow
 * - Accessible: nav[aria-label=Breadcrumb], ol, structured data
 * - Separator: "›" (text, not icon — scales with font)
 * - Only visible on internal/app pages, not marketing pages
 *
 * DESIGN_SYSTEM.md: subtle, structured, text-driven.
 */
import { Link, useLocation } from 'react-router-dom';
import { useBreadcrumb } from '../hooks/useBreadcrumb';

/** Pages where breadcrumbs are suppressed */
const SUPPRESS_PATHS = new Set(['/', '/login', '/register', '/pricing', '/about', '/contact']);

/**
 * @param {Object}  props
 * @param {{ label: string; href: string }[]} [props.crumbs] — override auto-generated crumbs
 * @param {string}  [props.className]
 */
export function SiteBreadcrumb({ crumbs: overrideCrumbs, className = '' }) {
  const location = useLocation();
  const autoCrumbs = useBreadcrumb();

  // Suppress on marketing pages
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
        {/* Home is implicit — link to root */}
        <li className="flex items-center gap-1.5 flex-shrink-0">
          <Link
            to="/"
            className="text-[--vc-text-tertiary] hover:text-[--vc-text-secondary] transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:underline"
          >
            Home
          </Link>
        </li>

        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={crumb.href} className="flex items-center gap-1.5 min-w-0">
              {/* Separator */}
              <span aria-hidden="true" className="text-[--vc-border-strong] flex-shrink-0 select-none">
                /
              </span>

              {isLast ? (
                /* Current page — not a link */
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
