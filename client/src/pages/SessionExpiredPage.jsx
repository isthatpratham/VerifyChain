/**
 * SessionExpiredPage.jsx
 * Polished UX for session expiration notices.
 */
import { Link } from 'react-router-dom';
import { Clock } from '@phosphor-icons/react';
import { AuthLayout } from '../components/auth/AuthLayout';

export function SessionExpiredPage() {
  return (
    <AuthLayout
      title="Session Expired"
      subtitle="Your security session has timed out due to inactivity."
    >
      <div className="flex flex-col gap-5">
        <div className="p-4 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-bg-base] flex items-center gap-3">
          <Clock size={24} className="text-[--vc-warning] flex-shrink-0" />
          <div className="text-[--text-xs] text-[--vc-text-secondary]">
            <strong className="text-[--vc-text-primary]">Security Timeout</strong>
            <p className="mt-0.5">Please sign in again to resume managing your compliance records.</p>
          </div>
        </div>

        <Link
          to="/login"
          className="inline-flex items-center justify-center w-full py-2.5 rounded-[--radius-sm] bg-[--vc-brand] text-white text-[--text-sm] font-medium hover:bg-[--vc-brand-hover] transition-colors"
        >
          Re-authenticate & Sign In
        </Link>
      </div>
    </AuthLayout>
  );
}
