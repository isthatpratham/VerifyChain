import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { ToastProvider } from './providers/ToastProvider';
import { MotionProvider } from './providers/MotionProvider';
import AppLayout from './components/AppLayout';
import { Skeleton } from './ui/Skeleton';

// Synchronous Core & Auth Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { PublicRoute } from './routes/PublicRoute';

// Lazy Loaded Workspace Routes
const FeaturesPage = lazy(() => import('./pages/FeaturesPage').then(m => ({ default: m.FeaturesPage })));
const SolutionsPage = lazy(() => import('./pages/SolutionsPage').then(m => ({ default: m.SolutionsPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage').then(m => ({ default: m.HowItWorksPage })));
const FAQPage = lazy(() => import('./pages/FAQPage').then(m => ({ default: m.FAQPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const CookiesPage = lazy(() => import('./pages/CookiesPage').then(m => ({ default: m.CookiesPage })));
const MaintenancePage = lazy(() => import('./pages/MaintenancePage').then(m => ({ default: m.MaintenancePage })));
const PublicTrustPortal = lazy(() => import('./pages/PublicTrustPortal').then(m => ({ default: m.PublicTrustPortal })));
const EmbeddableTrustWidget = lazy(() => import('./components/public/EmbeddableTrustWidget').then(m => ({ default: m.EmbeddableTrustWidget })));
const EmbeddableTrustBadge = lazy(() => import('./components/public/EmbeddableTrustBadge').then(m => ({ default: m.EmbeddableTrustBadge })));

const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage').then(m => ({ default: m.VerifyEmailPage })));
const SessionExpiredPage = lazy(() => import('./pages/SessionExpiredPage').then(m => ({ default: m.SessionExpiredPage })));
const UnauthorizedPage = lazy(() => import('./pages/UnauthorizedPage').then(m => ({ default: m.UnauthorizedPage })));

const BusinessProfilePage = lazy(() => import('./pages/BusinessProfilePage'));
const SupplierTrustPage = lazy(() => import('./pages/SupplierTrustPage').then(m => ({ default: m.SupplierTrustPage })));
const TrustDistributionPage = lazy(() => import('./pages/TrustDistributionPage').then(m => ({ default: m.TrustDistributionPage })));
const DeveloperPlatformPage = lazy(() => import('./pages/DeveloperPlatformPage').then(m => ({ default: m.DeveloperPlatformPage })));
const AIComplianceIntelligencePage = lazy(() => import('./pages/AIComplianceIntelligencePage').then(m => ({ default: m.AIComplianceIntelligencePage })));
const DocumentIntelligencePage = lazy(() => import('./pages/DocumentIntelligencePage').then(m => ({ default: m.DocumentIntelligencePage })));
const AIAssistantPage = lazy(() => import('./pages/AIAssistantPage').then(m => ({ default: m.AIAssistantPage })));
const PredictiveIntelligencePage = lazy(() => import('./pages/PredictiveIntelligencePage').then(m => ({ default: m.PredictiveIntelligencePage })));
const AIGovernancePage = lazy(() => import('./pages/AIGovernancePage').then(m => ({ default: m.AIGovernancePage })));
const DocumentVaultPage = lazy(() => import('./pages/DocumentVaultPage').then(m => ({ default: m.DocumentVaultPage })));

function PageFallback() {
  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <Skeleton className="h-24 w-full rounded-[--radius-md]" />
      <Skeleton className="h-40 w-full rounded-[--radius-md]" />
      <Skeleton className="h-64 w-full rounded-[--radius-md]" />
    </div>
  );
}

export default function App() {
  return (
    <MotionProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              {/* Dedicated Standalone Public Trust Routes */}
              <Route path="/verify/:slug" element={<PublicTrustPortal />} />
              <Route path="/embed/widget/:slug" element={<EmbeddableTrustWidget />} />
              <Route path="/embed/badge/:slug" element={<EmbeddableTrustBadge />} />

              <Route path="/" element={<AppLayout />}>
                <Route index element={<Landing />} />
                <Route path="features" element={<FeaturesPage />} />
                <Route path="solutions" element={<SolutionsPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="how-it-works" element={<HowItWorksPage />} />
                <Route path="faq" element={<FAQPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="privacy" element={<PrivacyPage />} />
                <Route path="terms" element={<TermsPage />} />
                <Route path="cookies" element={<CookiesPage />} />
                <Route path="maintenance" element={<MaintenancePage />} />

                <Route
                  path="login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />
                <Route
                  path="register"
                  element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  }
                />
                <Route
                  path="forgot-password"
                  element={
                    <PublicRoute>
                      <ForgotPasswordPage />
                    </PublicRoute>
                  }
                />
                <Route
                  path="reset-password"
                  element={
                    <PublicRoute>
                      <ResetPasswordPage />
                    </PublicRoute>
                  }
                />
                <Route path="verify-email" element={<VerifyEmailPage />} />
                <Route path="session-expired" element={<SessionExpiredPage />} />
                <Route path="unauthorized" element={<UnauthorizedPage />} />

                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="profile"
                  element={
                    <ProtectedRoute>
                      <BusinessProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="ai-compliance-intelligence"
                  element={
                    <ProtectedRoute>
                      <AIComplianceIntelligencePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="document-intelligence"
                  element={
                    <ProtectedRoute>
                      <DocumentIntelligencePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="ai-assistant"
                  element={
                    <ProtectedRoute>
                      <AIAssistantPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="predictive-intelligence"
                  element={
                    <ProtectedRoute>
                      <PredictiveIntelligencePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="ai-governance"
                  element={
                    <ProtectedRoute>
                      <AIGovernancePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="document-vault"
                  element={
                    <ProtectedRoute>
                      <DocumentVaultPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="supplier-trust"
                  element={
                    <ProtectedRoute>
                      <SupplierTrustPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="trust-distribution"
                  element={
                    <ProtectedRoute>
                      <TrustDistributionPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="developer"
                  element={
                    <ProtectedRoute>
                      <DeveloperPlatformPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
          <ToastProvider />
        </BrowserRouter>
      </AuthProvider>
    </MotionProvider>
  );
}
