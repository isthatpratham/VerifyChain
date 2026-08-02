/**
 * EnterpriseHeader.jsx
 * Top header for Authenticated Enterprise App Shell.
 * Clean surface, clear page title, user profile, and sign out.
 * Strictly uses design tokens from DESIGN_SYSTEM.md.
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
  '/document-vault': 'Document Vault',
  '/ai-compliance-intelligence': 'AI Compliance Intelligence',
  '/document-intelligence': 'Document Intelligence Workspace',
  '/ai-assistant': 'AI Compliance Copilot',
  '/predictive-intelligence': 'Predictive Intelligence',
  '/ai-governance': 'AI Governance & Security',
  '/developer': 'Developer Platform',
  '/admin': 'Enterprise Administration',
  '/admin/iam': 'Enterprise IAM & Access Control',
  '/admin/operations': 'Enterprise Operations Center',
  '/admin/ai': 'Enterprise AI Administration',
};

export function EnterpriseHeader({ onMobileMenuToggle }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const title = PAGE_TITLES[location.pathname] || 'Enterprise Workspace';

  return (
    <header className="h-16 bg-[--vc-surface] border-b border-[--vc-border] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Title & Mobile Hamburger */}
      <div className="flex items-center gap-3">
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 rounded-[--radius-sm] bg-[--vc-bg-subtle] border border-[--vc-border] text-[--vc-text-secondary] hover:text-[--vc-text-primary]"
            aria-label="Open navigation menu"
          >
            <List size={20} />
          </button>
        )}
        <div>
          <h1 className="text-[--text-lg] font-bold text-[--vc-text-primary] tracking-tight font-[--font-heading]">{title}</h1>
          <span className="text-[11px] text-[--vc-text-secondary] font-medium hidden sm:inline-block">
            Verified Enterprise Portal
          </span>
        </div>
      </div>

      {/* Right: User Avatar & Sign Out */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-[--radius-md] bg-[--vc-bg-subtle] border border-[--vc-border]">
          <div className="w-6 h-6 rounded-full bg-[--vc-brand-subtle] text-[--vc-brand] font-bold flex items-center justify-center text-[10px] border border-[--vc-brand]/20">
            {user?.name?.[0]?.toUpperCase() || <User size={12} />}
          </div>
          <span className="text-[--text-xs] font-semibold text-[--vc-text-primary]">{user?.name || 'Enterprise Account'}</span>
          <CheckCircle size={12} className="text-[--vc-success]" />
        </div>

        <button
          onClick={logout}
          title="Sign Out"
          className="px-3.5 py-1.5 rounded-[--radius-md] bg-[--vc-error-bg] hover:bg-[--vc-error-bg]/80 border border-[--vc-error]/20 text-[--vc-error-text] text-[--text-xs] font-semibold flex items-center gap-1.5 transition-colors"
        >
          <SignOut size={15} />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
