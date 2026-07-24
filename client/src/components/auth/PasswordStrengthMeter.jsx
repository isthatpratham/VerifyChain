/**
 * PasswordStrengthMeter.jsx
 * Password strength indicator & requirements checklist.
 */
import { Check, X } from '@phosphor-icons/react';

/**
 * @param {Object} props
 * @param {string} props.password
 */
export function PasswordStrengthMeter({ password = '' }) {
  if (!password) return null;

  const checks = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'Contains a number or symbol', valid: /[0-9!@#$%^&*()]/.test(password) },
    { label: 'Contains uppercase & lowercase', valid: /[a-z]/.test(password) && /[A-Z]/.test(password) },
  ];

  const passed = checks.filter((c) => c.valid).length;

  const getStrengthLabel = () => {
    if (passed === 1) return { text: 'Weak', color: 'bg-[--vc-error]', textClass: 'text-[--vc-error]' };
    if (passed === 2) return { text: 'Fair', color: 'bg-[--vc-warning]', textClass: 'text-[--vc-warning]' };
    return { text: 'Strong', color: 'bg-[--vc-success]', textClass: 'text-[--vc-success]' };
  };

  const strength = getStrengthLabel();

  return (
    <div className="mt-2.5 p-3 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base] text-[11px]">
      <div className="flex items-center justify-between mb-1.5 font-medium">
        <span className="text-[--vc-text-tertiary]">Password Strength:</span>
        <span className={strength.textClass}>{strength.text}</span>
      </div>

      {/* Strength Bar */}
      <div className="w-full h-1 bg-[--vc-bg-subtle] rounded-full overflow-hidden mb-2.5 flex gap-1">
        <div className={`h-full flex-1 rounded-full ${passed >= 1 ? strength.color : 'bg-transparent'}`} />
        <div className={`h-full flex-1 rounded-full ${passed >= 2 ? strength.color : 'bg-transparent'}`} />
        <div className={`h-full flex-1 rounded-full ${passed >= 3 ? strength.color : 'bg-transparent'}`} />
      </div>

      {/* Checklist */}
      <div className="flex flex-col gap-1">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-1.5">
            {c.valid ? (
              <Check size={12} className="text-[--vc-success] flex-shrink-0" />
            ) : (
              <X size={12} className="text-[--vc-text-tertiary] flex-shrink-0" />
            )}
            <span className={c.valid ? 'text-[--vc-text-primary]' : 'text-[--vc-text-tertiary]'}>
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
