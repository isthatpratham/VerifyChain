/**
 * LoginForm.jsx
 * Redesigned Login Form using AuthLayout and Global UI primitives.
 * Business logic and useAuth integration strictly preserved.
 */
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AuthLayout } from './AuthLayout';
import { PasswordInputEnhanced } from './PasswordInputEnhanced';
import { Field } from '../../ui/form/Field';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Alert } from '../../ui/Alert';

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, id, value, type, checked } = e.target;
    const key = name || id;
    const val = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };


  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      await login({
        email: formData.email,
        password: formData.password,
      });

      navigate(from, { replace: true });
    } catch (err) {
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (data.details && Array.isArray(data.details)) {
          const fieldErrors = {};
          data.details.forEach((item) => {
            if (item.field) fieldErrors[item.field] = item.message;
          });
          setErrors(fieldErrors);
        }
        setServerError(data.error || 'Invalid credentials. Please check your email and password.');
      } else {
        setServerError('Network or server error. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to manage your business compliance health and Verified Supplier Card."
    >
      {serverError && (
        <div className="mb-5">
          <Alert variant="error" title="Authentication Failed">
            {serverError}
          </Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Field label="Email Address" htmlFor="email" required error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@enterprise.in"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            disabled={loading}
            required
          />
        </Field>

        <Field label="Password" htmlFor="password" required error={errors.password}>
          <PasswordInputEnhanced
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            error={errors.password}
            disabled={loading}
          />
        </Field>


        {/* Remember Me & Forgot Password Row */}
        <div className="flex items-center justify-between text-[--text-xs] pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none text-[--vc-text-secondary]">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              disabled={loading}
              className="rounded-[2px] border-[--vc-border] text-[--vc-brand] focus:ring-[--vc-brand]"
            />
            <span>Remember this device</span>
          </label>

          <Link
            to="/forgot-password"
            className="font-medium text-[--vc-brand] hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="primary" loading={loading} className="w-full mt-2 py-2.5">
          Sign In to Account
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-[--vc-border] text-center text-[--text-xs] text-[--vc-text-secondary]">
        Don&apos;t have a VerifyChain account?{' '}
        <Link to="/register" className="font-semibold text-[--vc-brand] hover:underline">
          Register your business
        </Link>
      </div>
    </AuthLayout>
  );
}
