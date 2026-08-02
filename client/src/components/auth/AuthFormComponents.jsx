import React from 'react';

export function FormContainer({ title, subtitle, children }) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-[--vc-surface] p-8 rounded-[--radius-md] border border-[--vc-border] shadow-sm">
        <div className="text-center mb-6">
          <h2 className="text-[--text-2xl] font-bold text-[--vc-text-primary] font-[--font-heading] tracking-tight">{title}</h2>
          {subtitle && <p className="mt-2 text-[--text-xs] text-[--vc-text-secondary]">{subtitle}</p>}
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
        <label htmlFor={id} className="block text-[--text-xs] font-medium text-[--vc-text-primary] mb-1">
          {label} {required && <span className="text-[--vc-error]">*</span>}
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
        className={`w-full px-3 py-2 border rounded-[--radius-md] text-[--text-xs] text-[--vc-text-primary] bg-[--vc-surface] focus:outline-none focus:ring-2 focus:ring-[--vc-brand] ${
          error ? 'border-[--vc-error]' : 'border-[--vc-border]'
        } disabled:bg-[--vc-bg-muted] disabled:cursor-not-allowed`}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-[11px] text-[--vc-error-text]">
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
        <label htmlFor={id} className="block text-[--text-xs] font-medium text-[--vc-text-primary] mb-1">
          {label} {required && <span className="text-[--vc-error]">*</span>}
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
          className={`w-full pl-3 pr-10 py-2 border rounded-[--radius-md] text-[--text-xs] text-[--vc-text-primary] bg-[--vc-surface] focus:outline-none focus:ring-2 focus:ring-[--vc-brand] ${
            error ? 'border-[--vc-error]' : 'border-[--vc-border]'
          } disabled:bg-[--vc-bg-muted] disabled:cursor-not-allowed`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-[11px] text-[--vc-text-tertiary] hover:text-[--vc-text-primary] focus:outline-none"
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-[11px] text-[--vc-error-text]">
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
      className="w-full mt-2 py-2.5 px-4 rounded-[--radius-md] text-[--text-xs] font-semibold text-white bg-[--vc-brand] hover:bg-[--vc-brand-hover] focus:outline-none focus:ring-2 focus:ring-[--vc-brand] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? 'Processing...' : children}
    </button>
  );
}
