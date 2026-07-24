/**
 * EnterpriseSidebar.jsx
 * Premium Enterprise Navigation Sidebar (Stripe / Linear / Vercel style).
 * Clean white surface, spacious navigation grouping, blue active state.
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
    ],
  },
  {
    group: 'TRUST & DISTRIBUTION',
    items: [
      { to: '/supplier-trust', label: 'Supplier Trust', icon: ShieldCheck },
      { to: '/trust-distribution', label: 'Trust Distribution', icon: Broadcast },
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
    `flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-medium text-xs transition-all ${
      isActive
        ? 'bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-600 pl-3 shadow-xs'
        : 'text-gray-700 hover:text-gray-900 hover:bg-slate-50'
    }`;

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-gray-200 flex flex-col justify-between transition-all duration-300 ${
          collapsed ? 'w-[72px]' : 'w-[270px]'
        } ${mobileOpen ? 'translate-x-0 w-[270px]' : '-translate-x-full md:translate-x-0'}`}
      >
        <div>
          {/* Logo Header */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-base shrink-0 shadow-sm">
                V
              </div>
              {!collapsed && (
                <div className="flex flex-col">
                  <span className="font-extrabold text-sm text-gray-900 tracking-tight">VerifyChain</span>
                  <span className="text-[10px] font-mono text-gray-500 font-medium">Enterprise Shell</span>
                </div>
              )}
            </div>

            {/* Mobile close / Desktop collapse button */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMobileOpen(false)}
                className="md:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden md:flex p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 hover:text-gray-900 transition-colors"
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {collapsed ? <CaretRight size={14} /> : <CaretLeft size={14} />}
              </button>
            </div>
          </div>

          {/* Navigation Sections */}
          <nav className="p-4 flex flex-col gap-6 mt-2 overflow-y-auto max-h-[calc(100vh-140px)]">
            {NAV_SECTIONS.map((sec) => (
              <div key={sec.group} className="flex flex-col gap-1.5">
                {!collapsed && (
                  <span className="px-3.5 text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">
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
        <div className="p-4 border-t border-gray-100 flex flex-col gap-2 bg-gray-50/50">
          {!collapsed ? (
            <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-xs shrink-0 border border-blue-200">
                  {user?.name?.[0]?.toUpperCase() || <User size={14} />}
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-xs font-bold text-gray-900 truncate">{user?.name || 'Enterprise User'}</span>
                  <span className="text-[10px] text-gray-500 truncate flex items-center gap-1">
                    <CheckCircle size={10} className="text-emerald-500" /> Active Session
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Sign Out"
              >
                <SignOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-3 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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
