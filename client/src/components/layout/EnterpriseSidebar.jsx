/**
 * EnterpriseSidebar.jsx
 * Premium Enterprise Navigation Sidebar (Stripe / Linear / Vercel style).
 * Clean surface, spacious navigation grouping, brand active state.
 * Grounded in DESIGN_SYSTEM.md tokens.
 */
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  SquaresFour,
  Buildings,
  ShieldCheck,
  Broadcast,
  SignOut,
  CaretLeft,
  CaretRight,
  X,
  CheckCircle,
  Article,
  User,
  Code,
  Sparkle,
  FileText,
  Brain,
  TrendUp,
  Gear,
  Folder,
} from '@phosphor-icons/react';

const NAV_SECTIONS = [
  {
    group: 'MAIN',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: SquaresFour },
    ],
  },
  {
    group: 'BUSINESS',
    items: [
      { to: '/profile', label: 'Business Profile', icon: Buildings },
    ],
  },
  {
    group: 'COMPLIANCE',
    items: [
      { to: '/dashboard#compliance', label: 'Compliance Overview', icon: Article },
      { to: '/document-vault', label: 'Document Vault', icon: Folder },
      { to: '/ai-compliance-intelligence', label: 'AI Intelligence', icon: Sparkle },
      { to: '/document-intelligence', label: 'Document Intelligence', icon: FileText },
      { to: '/ai-assistant', label: 'AI Compliance Copilot', icon: Brain },
      { to: '/predictive-intelligence', label: 'Predictive Intelligence', icon: TrendUp },
      { to: '/ai-governance', label: 'AI Governance & Security', icon: Gear },
    ],
  },
  {
    group: 'TRUST & DISTRIBUTION',
    items: [
      { to: '/supplier-trust', label: 'Supplier Trust', icon: ShieldCheck },
      { to: '/trust-distribution', label: 'Trust Distribution', icon: Broadcast },
    ],
  },
  {
    group: 'DEVELOPER',
    items: [
      { to: '/developer', label: 'Developer Platform', icon: Code },
    ],
  },
];

export function EnterpriseSidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3.5 px-3.5 py-2.5 rounded-[--radius-md] font-medium text-[--text-xs] transition-all ${
      isActive
        ? 'bg-[--vc-brand-subtle] text-[--vc-brand] font-semibold border-l-4 border-[--vc-brand] pl-3'
        : 'text-[--vc-text-secondary] hover:text-[--vc-text-primary] hover:bg-[--vc-bg-subtle]'
    }`;

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[--vc-surface] border-r border-[--vc-border] flex flex-col justify-between transition-all duration-300 ${
          collapsed ? 'w-[72px]' : 'w-[270px]'
        } ${mobileOpen ? 'translate-x-0 w-[270px]' : '-translate-x-full md:translate-x-0'}`}
      >
        <div>
          {/* Logo Header */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-[--vc-border]">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-[--radius-md] bg-[--vc-brand] flex items-center justify-center text-white font-extrabold text-[--text-base] shrink-0">
                V
              </div>
              {!collapsed && (
                <div className="flex flex-col">
                  <span className="font-extrabold text-[--text-sm] text-[--vc-text-primary] tracking-tight font-[--font-heading]">VerifyChain</span>
                  <span className="text-[10px] font-mono text-[--vc-text-tertiary] font-medium">Enterprise Shell</span>
                </div>
              )}
            </div>

            {/* Mobile close / Desktop collapse button */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close mobile navigation"
                className="md:hidden p-1.5 rounded-[--radius-sm] text-[--vc-text-secondary] hover:text-[--vc-text-primary] hover:bg-[--vc-bg-subtle] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--vc-brand]"
              >
                <X size={18} />
              </button>
              <button
                onClick={() => setCollapsed(!collapsed)}
                aria-label={collapsed ? 'Expand sidebar navigation' : 'Collapse sidebar navigation'}
                className="hidden md:flex p-1.5 rounded-[--radius-sm] bg-[--vc-bg-subtle] hover:bg-[--vc-bg-muted] border border-[--vc-border] text-[--vc-text-secondary] hover:text-[--vc-text-primary] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--vc-brand]"
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {collapsed ? <CaretRight size={14} /> : <CaretLeft size={14} />}
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Main Enterprise Navigation" className="p-4 flex flex-col gap-5 mt-2 overflow-y-auto max-h-[calc(100vh-140px)]">
            {NAV_SECTIONS.map((sec) => (
              <div key={sec.group} className="flex flex-col gap-1">
                {!collapsed && (
                  <span className="px-3.5 text-[10px] font-mono uppercase tracking-wider text-[--vc-text-tertiary] font-bold mb-1">
                    {sec.group}
                  </span>
                )}
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={navItemClass}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon size={18} className="shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer User Profile & Sign Out */}
        <div className="p-4 border-t border-[--vc-border] flex flex-col gap-2 bg-[--vc-bg-subtle]">
          {!collapsed ? (
            <div className="p-3 rounded-[--radius-md] bg-[--vc-surface] border border-[--vc-border] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-[--vc-brand-subtle] text-[--vc-brand] font-bold flex items-center justify-center text-[--text-xs] shrink-0 border border-[--vc-brand]/20">
                  {user?.name?.[0]?.toUpperCase() || <User size={14} />}
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-[--text-xs] font-bold text-[--vc-text-primary] truncate">{user?.name || 'Enterprise User'}</span>
                  <span className="text-[10px] text-[--vc-text-secondary] truncate flex items-center gap-1">
                    <CheckCircle size={10} className="text-[--vc-success]" /> Active Session
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-1.5 rounded-[--radius-sm] text-[--vc-text-tertiary] hover:text-[--vc-error] hover:bg-[--vc-error-bg] transition-colors"
                title="Sign Out"
              >
                <SignOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-3 rounded-[--radius-md] text-[--vc-text-tertiary] hover:text-[--vc-error] hover:bg-[--vc-error-bg] transition-colors"
              title="Sign Out"
            >
              <SignOut size={18} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
