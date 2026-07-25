import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { ToastProvider } from './providers/ToastProvider';
import { MotionProvider } from './providers/MotionProvider';
import AppLayout from './components/AppLayout';

import Landing from './pages/Landing';
import { FeaturesPage } from './pages/FeaturesPage';
import { SolutionsPage } from './pages/SolutionsPage';
import { AboutPage } from './pages/AboutPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { FAQPage } from './pages/FAQPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { CookiesPage } from './pages/CookiesPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { PublicTrustPortal } from './pages/PublicTrustPortal';
import { EmbeddableTrustWidget } from './components/public/EmbeddableTrustWidget';
import { EmbeddableTrustBadge } from './components/public/EmbeddableTrustBadge';
import { SupplierTrustPage } from './pages/SupplierTrustPage';
import { TrustDistributionPage } from './pages/TrustDistributionPage';
import { DeveloperPlatformPage } from './pages/DeveloperPlatformPage';
import { AIComplianceIntelligencePage } from './pages/AIComplianceIntelligencePage';
import { DocumentIntelligencePage } from './pages/DocumentIntelligencePage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { PredictiveIntelligencePage } from './pages/PredictiveIntelligencePage';
import { AIGovernancePage } from './pages/AIGovernancePage';
import NotFound from './pages/NotFound';

import Login from './pages/Login';
import Register from './pages/Register';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { SessionExpiredPage } from './pages/SessionExpiredPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';

import Dashboard from './pages/Dashboard';
import BusinessProfilePage from './pages/BusinessProfilePage';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { PublicRoute } from './routes/PublicRoute';


export default function App() {
  return (
    <MotionProvider>
      <AuthProvider>
        <BrowserRouter>
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
          <ToastProvider />
        </BrowserRouter>
      </AuthProvider>
    </MotionProvider>
  );
}
