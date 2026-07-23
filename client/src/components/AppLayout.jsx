import { Outlet } from 'react-router-dom';
import { NavigationProvider, SiteNav, SiteBreadcrumb, SiteFooter } from '../navigation';
import { PageTransition } from '../animations/PageTransition';
import { Container } from './Container';

export default function AppLayout() {
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


