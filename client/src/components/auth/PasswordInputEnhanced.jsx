/**
 * PasswordInputEnhanced.jsx
 * Password input with Show/Hide toggle and Caps Lock detection warning.
 */
import { useState } from 'react';
import { Eye, EyeSlash, Warning } from '@phosphor-icons/react';

/**
 * @param {Object} props
 * @param {string} props.id
 * @param {string} props.value
 * @param {Function} props.onChange
 * @param {string} [props.placeholder='••••••••']
 * @param {boolean} [props.disabled=false]
 * @param {string} [props.error]
 */
export function PasswordInputEnhanced({
  id,
  value,
  onChange,
  placeholder = '••••••••',
  disabled = false,
  error,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  const handleKeyDown = (e) => {
    if (e.getModifierState) {
      setCapsLock(e.getModifierState('CapsLock'));
    }
  };

  const handleKeyUp = (e) => {
    if (e.getModifierState) {
      setCapsLock(e.getModifierState('CapsLock'));
    }
  };

  return (
    <div className="relative w-full">
      <input
        id={id}
        name={id}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        placeholder={placeholder}
        disabled={disabled}
        aria-describedby={error ? `${id}-error` : undefined}
        className={[
          'w-full px-3 py-2 pr-10 rounded-[--radius-sm] border text-[--text-sm]',
          'bg-[--vc-bg-base] text-[--vc-text-primary] placeholder-[--vc-text-tertiary]',
          'transition-colors duration-[--duration-fast]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--vc-brand]',
          error
            ? 'border-[--vc-error] text-[--vc-error]'
            : 'border-[--vc-border] hover:border-[--vc-border-strong]',
          disabled ? 'opacity-50 cursor-not-allowed bg-[--vc-bg-muted]' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />

      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShowPassword((prev) => !prev)}
        disabled={disabled}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[--vc-text-tertiary] hover:text-[--vc-text-primary] transition-colors focus-visible:outline-none"
      >
        {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
      </button>

      {capsLock && (
        <div className="mt-1 flex items-center gap-1 text-[11px] text-[--vc-warning]">
          <Warning size={12} />
          <span>Caps Lock is ON</span>
        </div>
      )}
    </div>
  );
}
