/**
 * NavigationActions.jsx
 * Auth-aware action buttons in the navbar (right side).
 *
 * Unauthenticated: "Sign in" (ghost) + "Get started" (primary)
 * Authenticated:   "Dashboard", "Business Profile", Sign out
 *
 * DESIGN_SYSTEM.md: avoid oversized CTAs, avoid flashy buttons.
 * Buttons should be measured, not demanding.
 */
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { SignOut } from '@phosphor-icons/react';

/**
 * @param {Object} props
 * @param {'desktop'|'mobile'} [props.context='desktop']
 * @param {Function} [props.onClose] — called after mobile link click
 */
export function NavigationActions({ context = 'desktop', onClose }) {
  const auth = useContext(AuthContext);
  const isAuthenticated = auth?.user != null;

  // Shared link style for mobile
  const mobileItemClass =
    'flex items-center px-3 py-2.5 rounded-[--radius-sm] text-[--text-sm] font-medium ' +
    'text-[--vc-text-primary] transition-colors duration-[--duration-fast] ' +
    'hover:bg-[--vc-bg-muted] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--vc-brand]';

  if (context === 'mobile') {
    return (
      <div className="flex flex-col gap-1 mt-2">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className={mobileItemClass} onClick={onClose}>
              Dashboard
            </Link>
            <Link to="/profile" className={mobileItemClass} onClick={onClose}>
              Business Profile
            </Link>
            <button
              type="button"
              onClick={() => { auth.logout?.(); onClose?.(); }}
              className={mobileItemClass + ' text-left text-red-400'}
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={mobileItemClass} onClick={onClose}>
              Sign in
            </Link>
            <Link
              to="/register"
              onClick={onClose}
              className="flex items-center justify-center px-3 py-2.5 mt-1 rounded-[--radius-sm] text-[--text-sm] font-medium border border-[--vc-brand] text-[--vc-brand] hover:bg-[--vc-brand] hover:text-white transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--vc-brand]"
            >
              Get started
            </Link>
          </>
        )}
      </div>
    );
  }

  // Desktop
  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard"
          className="text-[--text-sm] font-medium text-[--vc-text-secondary] hover:text-[--vc-text-primary] transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:underline"
        >
          Dashboard
        </Link>
        <Link
          to="/profile"
          className="text-[--text-sm] font-medium text-[--vc-text-secondary] hover:text-[--vc-text-primary] transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:underline"
        >
          Profile
        </Link>

        <button
          type="button"
          onClick={() => auth?.logout?.()}
          title="Sign out of account"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[--radius-sm] text-[--text-xs] font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          <SignOut size={14} />
          <span>Sign out</span>
        </button>

        <div
          className="w-7 h-7 rounded-[--radius-sm] bg-[--vc-bg-muted] border border-[--vc-border] flex items-center justify-center text-[--text-xs] font-semibold text-[--vc-text-secondary] select-none ml-1"
          aria-label="User avatar"
          title={auth?.user?.email || 'Account'}
        >
          {(auth?.user?.name || auth?.user?.email || 'U')[0].toUpperCase()}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        to="/login"
        className="text-[--text-sm] font-medium text-[--vc-text-secondary] hover:text-[--vc-text-primary] transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:underline"
      >
        Sign in
      </Link>
      <Link
        to="/register"
        className={[
          'inline-flex items-center px-3 py-1.5 rounded-[--radius-sm]',
          'border border-[--vc-brand] text-[--vc-brand] bg-transparent',
          'text-[--text-sm] font-medium leading-none',
          'transition-colors duration-[--duration-fast]',
          'hover:bg-[--vc-brand] hover:text-white',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--vc-brand]',
        ].join(' ')}
      >
        Get started
      </Link>
    </div>
  );
}
