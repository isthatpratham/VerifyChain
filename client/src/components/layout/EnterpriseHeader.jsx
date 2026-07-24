/**
 * EnterpriseHeader.jsx
 * Top header for Authenticated Enterprise App Shell (Stripe / Linear style).
 * Minimal white surface, clear page title, user profile, and sign out.
 * ABSOLUTELY ZERO TOP NAVIGATION LINKS.
 */
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { List, SignOut, User, CheckCircle } from '@phosphor-icons/react';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard Overview',
  '/profile': 'Business Profile',
  '/compliance': 'Compliance Workspace',
  '/supplier-trust': 'Supplier Trust Workspace',
  '/trust-distribution': 'Trust Distribution Hub',
};

export function EnterpriseHeader({ onMobileMenuToggle }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const title = PAGE_TITLES[location.pathname] || 'Enterprise Workspace';

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Title & Mobile Hamburger */}
      <div className="flex items-center gap-3">
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900"
            aria-label="Open navigation menu"
          >
            <List size={20} />
          </button>
        )}
        <div>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h1>
          <span className="text-[11px] text-gray-500 font-medium hidden sm:inline-block">
            Verified Enterprise Portal
          </span>
        </div>
      </div>

      {/* Right: User Avatar & Sign Out ONLY — NO TOP NAV LINKS */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200">
          <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-[10px] border border-blue-200">
            {user?.name?.[0]?.toUpperCase() || <User size={12} />}
          </div>
          <span className="text-xs font-semibold text-gray-900">{user?.name || 'Enterprise Account'}</span>
          <CheckCircle size={12} className="text-emerald-500" />
        </div>

        <button
          onClick={logout}
          title="Sign Out"
          className="px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <SignOut size={15} />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
