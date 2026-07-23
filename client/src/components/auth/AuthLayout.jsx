/**
 * AuthLayout.jsx
 * Split-screen layout wrapper for authentication screens.
 *
 * Left panel: Auth form
 * Right panel: Product preview panel (AuthRightPanel)
 */
import { Link } from 'react-router-dom';
import { AuthRightPanel } from './AuthRightPanel';
import { NavigationLogo } from '../../navigation/components/NavigationLogo';

/**
 * @param {Object} props
 * @param {string} [props.title]
 * @param {string} [props.subtitle]
 * @param {React.ReactNode} props.children
 */
export function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-[--vc-bg-base] grid grid-cols-1 lg:grid-cols-[6fr_5fr]">
      {/* Left Form Panel */}
      <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-14 max-w-xl mx-auto w-full">
        {/* Header Branding */}
        <div className="flex items-center justify-between mb-8">
          <NavigationLogo />
          <Link
            to="/"
            className="text-[--text-xs] font-medium text-[--vc-text-tertiary] hover:text-[--vc-text-primary] transition-colors duration-[--duration-fast]"
          >
            ← Back to website
          </Link>
        </div>

        {/* Main Content Area */}
        <div className="my-auto py-6">
          {(title || subtitle) && (
            <div className="mb-6">
              {title && (
                <h1 className="font-[--font-heading] text-[--text-2xl] font-bold text-[--vc-text-primary] tracking-[--ls-snug]">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-[--text-xs] text-[--vc-text-secondary] mt-1 leading-[--lh-relaxed]">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          {children}
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-[--vc-border] text-[11px] text-[--vc-text-tertiary] flex items-center justify-between">
          <span>© {new Date().getFullYear()} VerifyChain</span>
          <div className="flex items-center gap-3">
            <Link to="/privacy" className="hover:text-[--vc-text-secondary]">Privacy</Link>
            <Link to="/terms" className="hover:text-[--vc-text-secondary]">Terms</Link>
          </div>
        </div>
      </div>

      {/* Right Visual Panel */}
      <AuthRightPanel />
    </div>
  );
}
