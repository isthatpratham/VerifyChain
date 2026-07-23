import React from 'react';

export function FormContainer({ title, subtitle, children }) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="mt-2 text-sm text-gray-600">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}

export function Input({ id, label, type = 'text', value, onChange, placeholder, error, required = false, disabled = false }) {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full px-3 py-2 border rounded-lg shadow-sm font-sans focus:outline-none focus:ring-2 focus:ring-brand-light ${
          error ? 'border-red-500 text-red-900' : 'border-gray-300 text-gray-900'
        } disabled:bg-gray-100 disabled:cursor-not-allowed`}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export function PasswordInput({ id, label, value, onChange, placeholder, error, required = false, disabled = false }) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          name={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full pl-3 pr-10 py-2 border rounded-lg shadow-sm font-sans focus:outline-none focus:ring-2 focus:ring-brand-light ${
            error ? 'border-red-500 text-red-900' : 'border-gray-300 text-gray-900'
          } disabled:bg-gray-100 disabled:cursor-not-allowed`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-500 hover:text-brand focus:outline-none"
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export function SubmitButton({ children, loading = false, disabled = false }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="w-full mt-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand hover:bg-brand-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? 'Processing...' : children}
    </button>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
      {message}
    </div>
  );
}
