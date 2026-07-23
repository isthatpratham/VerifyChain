/**
 * ResetPasswordPage.jsx
 * Password reset page with password strength meter and confirmation.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout';
import { PasswordInputEnhanced } from '../components/auth/PasswordInputEnhanced';
import { PasswordStrengthMeter } from '../components/auth/PasswordStrengthMeter';
import { Field } from '../ui/form/Field';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <AuthLayout
      title="Set New Password"
      subtitle="Enter a strong new password for your VerifyChain account."
    >
      {submitted ? (
        <div className="flex flex-col gap-4">
          <Alert variant="success" title="Password Reset Complete">
            Your account password has been updated successfully. You may now sign in using your new credentials.
          </Alert>

          <Link
            to="/login"
            className="inline-flex items-center justify-center w-full py-2.5 rounded-[--radius-sm] bg-[--vc-brand] text-white text-[--text-sm] font-medium hover:bg-[--vc-brand-hover] transition-colors"
          >
            Sign In with New Password
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {error && <Alert variant="error" title="Reset Error">{error}</Alert>}

          <Field label="New Password" htmlFor="password" required error={error}>
            <PasswordInputEnhanced
              id="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="••••••••"
              disabled={loading}
            />
            <PasswordStrengthMeter password={password} />
          </Field>

          <Field label="Confirm New Password" htmlFor="confirmPassword" required>
            <PasswordInputEnhanced
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
              placeholder="••••••••"
              disabled={loading}
            />
          </Field>

          <Button type="submit" variant="primary" loading={loading} className="w-full mt-2 py-2.5">
            Update Password
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
