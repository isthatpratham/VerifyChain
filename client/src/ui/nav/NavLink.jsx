/**
 * NavLink.jsx
 * Single navigation link with active state.
 * Integrates with React Router's NavLink.
 */
import { NavLink as RouterNavLink } from 'react-router-dom';

/**
 * @param {Object} props
 * @param {string} props.to — route path
 * @param {boolean} [props.end=false] — exact match
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export function NavLink({ to, end = false, className = '', children, ...props }) {
  return (
    <RouterNavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          'inline-flex items-center gap-1.5 text-[--text-sm] font-medium',
          'transition-colors duration-[--duration-fast]',
          'focus-visible:outline-none focus-visible:underline',
          isActive
            ? 'text-[--vc-text-brand]'
            : 'text-[--vc-text-secondary] hover:text-[--vc-text-primary]',
          className,
        ]
          .filter(Boolean)
          .join(' ')
      }
      {...props}
    >
      {children}
    </RouterNavLink>
  );
}
