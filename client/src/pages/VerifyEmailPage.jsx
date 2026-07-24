/**
 * VerifyEmailPage.jsx
 * Email verification status page (Success, Failure, Resend action).
 */
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, EnvelopeSimple } from '@phosphor-icons/react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status') || 'success';
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResend = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setResent(true);
    }, 600);
  };

  if (status === 'error' || status === 'expired') {
    return (
      <AuthLayout
        title="Email Verification Failed"
        subtitle="The verification link is invalid, expired, or has already been used."
      >
        <div className="flex flex-col gap-5">
          <div className="p-4 rounded-[--radius-md] border border-[--color-error-100] bg-[--vc-error-bg] flex items-center gap-3">
            <XCircle size={24} className="text-[--vc-error] flex-shrink-0" />
            <div className="text-[--text-xs] text-[--vc-error-text]">
              <strong>Verification Link Expired</strong>
              <p className="mt-0.5">Please request a new verification email to confirm your enterprise account.</p>
            </div>
          </div>

          {resent ? (
            <Alert variant="info" title="Verification Sent">
              A new verification link has been sent to your registered email address.
            </Alert>
          ) : (
            <Button
              type="button"
              variant="primary"
              loading={loading}
              onClick={handleResend}
              icon={<EnvelopeSimple size={16} />}
              className="w-full"
            >
              Resend Verification Email
            </Button>
          )}

          <div className="text-center pt-2">
            <Link to="/login" className="text-[--text-xs] font-medium text-[--vc-brand] hover:underline">
              Return to Sign In
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Email Verified Successfully"
      subtitle="Your email address has been confirmed."
    >
      <div className="flex flex-col gap-5">
        <div className="p-4 rounded-[--radius-md] border border-[--color-success-100] bg-[--vc-success-bg] flex items-center gap-3">
          <CheckCircle size={24} className="text-[--vc-success] flex-shrink-0" />
          <div className="text-[--text-xs] text-[--vc-success-text]">
            <strong>Account Confirmed</strong>
            <p className="mt-0.5">Your enterprise account is active and ready for business profile onboarding.</p>
          </div>
        </div>

        <Link
          to="/login"
          className="inline-flex items-center justify-center w-full py-2.5 rounded-[--radius-sm] bg-[--vc-brand] text-white text-[--text-sm] font-medium hover:bg-[--vc-brand-hover] transition-colors"
        >
          Sign In to Account
        </Link>
      </div>
    </AuthLayout>
  );
}
