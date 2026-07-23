import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  FormContainer,
  Input,
  PasswordInput,
  SubmitButton,
  ErrorBanner,
} from './AuthFormComponents';

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
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
        setServerError(data.error || 'Invalid credentials. Please try again.');
      } else {
        setServerError('Network or server error. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer title="Welcome Back" subtitle="Sign in to your VerifyChain account">
      <ErrorBanner message={serverError} />
      <form onSubmit={handleSubmit} noValidate>
        <Input
          id="email"
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
          disabled={loading}
        />
        <PasswordInput
          id="password"
          label="Password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required
          disabled={loading}
        />
        <SubmitButton loading={loading}>Sign In</SubmitButton>
      </form>
      <div className="mt-6 text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-medium text-brand hover:underline">
          Register here
        </Link>
      </div>
    </FormContainer>
  );
}
