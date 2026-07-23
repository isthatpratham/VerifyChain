/**
 * RegisterForm.jsx
 * Redesigned Register Form using AuthLayout, PasswordStrengthMeter, and Global UI primitives.
 * Business logic and useAuth integration strictly preserved.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AuthLayout } from './AuthLayout';
import { PasswordInputEnhanced } from './PasswordInputEnhanced';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { Field } from '../../ui/form/Field';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Alert } from '../../ui/Alert';

export function RegisterForm() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
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

    if (!formData.name.trim()) {
      newErrors.name = 'Full Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Enter a valid 10-digit Indian mobile number';
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
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim() || undefined,
      });

      navigate('/dashboard');
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
        setServerError(data.error || 'Registration failed. Please try again.');
      } else {
        setServerError('Network or server error. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Register Enterprise Account"
      subtitle="Create your MSME profile to aggregate compliance records and generate your Verified Supplier Card."
    >
      {serverError && (
        <div className="mb-5">
          <Alert variant="error" title="Registration Error">
            {serverError}
          </Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Field label="Full Name" htmlFor="name" required error={errors.name}>
          <Input
            id="name"
            name="name"
            placeholder="Ramesh Gupta"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            disabled={loading}
            required
          />
        </Field>

        <Field label="Email Address" htmlFor="email" required error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="ramesh@textiles.in"
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
          <PasswordStrengthMeter password={formData.password} />
        </Field>

        <Field label="Confirm Password" htmlFor="confirmPassword" required error={errors.confirmPassword}>
          <PasswordInputEnhanced
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            error={errors.confirmPassword}
            disabled={loading}
          />
        </Field>

        <Field label="Mobile Phone Number (Optional)" htmlFor="phone" error={errors.phone} hint="10-digit Indian mobile number for SMS expiry alerts">
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="9876543210"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            disabled={loading}
          />
        </Field>

        <Button type="submit" variant="primary" loading={loading} className="w-full mt-2 py-2.5">
          Create Business Account
        </Button>
      </form>


      <div className="mt-6 pt-5 border-t border-[--vc-border] text-center text-[--text-xs] text-[--vc-text-secondary]">
        Already registered on VerifyChain?{' '}
        <Link to="/login" className="font-semibold text-[--vc-brand] hover:underline">
          Sign in to account
        </Link>
      </div>
    </AuthLayout>
  );
}
