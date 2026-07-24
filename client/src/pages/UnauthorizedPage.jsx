/**
 * UnauthorizedPage.jsx
 * Access denied page for unauthorized route access.
 */
import { Link } from 'react-router-dom';
import { LockKey } from '@phosphor-icons/react';
import { AuthLayout } from '../components/auth/AuthLayout';

export function UnauthorizedPage() {
  return (
    <AuthLayout
      title="Access Restricted"
      subtitle="You do not have permission to view this system resource."
    >
      <div className="flex flex-col gap-5">
        <div className="p-4 rounded-[--radius-md] border border-[--color-error-100] bg-[--vc-error-bg] flex items-center gap-3">
          <LockKey size={24} className="text-[--vc-error] flex-shrink-0" />
          <div className="text-[--text-xs] text-[--vc-error-text]">
            <strong>Insufficient Permissions</strong>
            <p className="mt-0.5">Contact your organization administrator if you believe this is an error.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="flex-1 inline-flex items-center justify-center py-2.5 rounded-[--radius-sm] bg-[--vc-brand] text-white text-[--text-sm] font-medium hover:bg-[--vc-brand-hover] transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base] text-[--text-sm] font-medium text-[--vc-text-secondary] hover:text-[--vc-text-primary]"
          >
            Switch Account
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
