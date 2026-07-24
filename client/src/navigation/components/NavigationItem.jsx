/**
 * NavigationItem.jsx
 * Single navigation link with active underline indicator.
 * DESIGN_SYSTEM.md: subtle hover, no flashy transitions.
 */
import { NavLink } from 'react-router-dom';

/**
 * @param {Object} props
 * @param {string} props.to
 * @param {boolean} [props.end=false]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export function NavigationItem({ to, end = false, className = '', children }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          'relative inline-flex items-center py-1 text-[--text-sm] font-medium',
          'transition-colors duration-[--duration-normal]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--vc-brand]',
          'focus-visible:rounded-[--radius-sm]',
          // Active underline
          'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px',
          'after:transition-all after:duration-[--duration-normal]',
          isActive
            ? 'text-[--vc-text-brand] after:bg-[--vc-brand] after:opacity-100'
            : 'text-[--vc-text-secondary] hover:text-[--vc-text-primary] after:bg-transparent after:opacity-0',
          className,
        ]
          .filter(Boolean)
          .join(' ')
      }
    >
      {children}
    </NavLink>
  );
}
