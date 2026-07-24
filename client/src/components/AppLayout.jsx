import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { NavigationProvider, SiteNav, SiteBreadcrumb, SiteFooter } from '../navigation';
import { PageTransition } from '../animations/PageTransition';
import { Container } from './Container';
import { useAuth } from '../hooks/useAuth';
import { EnterpriseSidebar } from './layout/EnterpriseSidebar';
import { EnterpriseHeader } from './layout/EnterpriseHeader';

export default function AppLayout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Standalone public routes (public portal & embeds)
  const isStandalone = location.pathname.startsWith('/verify/') || location.pathname.startsWith('/embed/');

  if (isStandalone) {
    return <Outlet />;
  }

  // Authenticated Enterprise App Shell
  if (isAuthenticated) {
    return (
      <NavigationProvider>
        <div className="min-h-screen bg-slate-50/50 text-gray-900 flex">
          {/* Single Authoritative Sidebar Navigation */}
          <EnterpriseSidebar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
          />

          {/* Main App Content Area with Dynamic Sidebar Offset */}
          <div className={`flex-1 transition-all duration-300 flex flex-col min-w-0 ${collapsed ? 'md:ml-[72px]' : 'md:ml-[270px]'}`}>
            {/* Top Enterprise Header (Title, User Profile, Sign Out ONLY — NO TOP NAV LINKS) */}
            <EnterpriseHeader onMobileMenuToggle={() => setMobileOpen(true)} />

            <main className="flex-1 py-8 px-4 sm:px-8 lg:px-10">
              <div className="max-w-[1500px] mx-auto space-y-8">
                <div>
                  <SiteBreadcrumb />
                </div>
                <PageTransition>
                  <Outlet />
                </PageTransition>
              </div>
            </main>
          </div>
        </div>
      </NavigationProvider>
    );
  }

  // Public Unauthenticated Marketing Layout ONLY
  return (
    <NavigationProvider>
      <div className="min-h-screen flex flex-col bg-[--vc-bg-base] text-[--vc-text-primary]">
        <SiteNav />
        <main className="flex-1 py-8">
          <Container>
            <div className="mb-6">
              <SiteBreadcrumb />
            </div>
            <PageTransition>
              <Outlet />
            </PageTransition>
          </Container>
        </main>
        <SiteFooter />
      </div>
    </NavigationProvider>
  );
}
