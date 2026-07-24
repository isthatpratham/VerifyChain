/**
 * ForgotPasswordPage.jsx
 * Password recovery request page using AuthLayout and design system primitives.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Field } from '../ui/form/Field';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Enter a valid registered email address');
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
      title="Reset Your Password"
      subtitle="Enter your registered account email to receive a password reset link."
    >
      {submitted ? (
        <div className="flex flex-col gap-4">
          <Alert variant="success" title="Password Reset Email Sent">
            If an account exists for <strong className="font-semibold">{email}</strong>, you will receive password reset instructions shortly.
          </Alert>

          <Link
            to="/login"
            className="inline-flex items-center justify-center w-full py-2.5 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base] text-[--text-sm] font-medium text-[--vc-text-primary] hover:bg-[--vc-bg-subtle] transition-colors"
          >
            Return to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {error && <Alert variant="error" title="Input Error">{error}</Alert>}

          <Field label="Registered Email Address" htmlFor="email" required error={error}>
            <Input
              id="email"
              type="email"
              placeholder="name@enterprise.in"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              required
              disabled={loading}
            />
          </Field>

          <Button type="submit" variant="primary" loading={loading} className="w-full mt-2 py-2.5">
            Send Reset Instructions
          </Button>

          <div className="mt-4 text-center text-[--text-xs] text-[--vc-text-secondary]">
            Remember your password?{' '}
            <Link to="/login" className="font-semibold text-[--vc-brand] hover:underline">
              Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
