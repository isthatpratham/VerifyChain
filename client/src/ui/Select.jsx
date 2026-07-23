/**
 * Select.jsx
 * Dropdown select primitive. Native select with design system styling.
 */

const BASE =
  'block w-full rounded-[--radius-md] border bg-[--vc-surface] ' +
  'px-3 py-2 pr-8 text-[--text-base] text-[--vc-text-primary] ' +
  'appearance-none bg-no-repeat bg-right ' +
  'transition-colors duration-[--duration-normal] ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[--vc-brand] focus-visible:ring-offset-0 ' +
  'disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer';

const STATES = {
  default: 'border-[--vc-border] hover:border-[--vc-border-strong]',
  error:   'border-[--vc-error] focus-visible:ring-[--vc-error]',
  success: 'border-[--vc-success] focus-visible:ring-[--vc-success]',
};

export function Select({ state = 'default', className = '', children, ...props }) {
  return (
    <div className="relative">
      <select
        className={[BASE, STATES[state], className].filter(Boolean).join(' ')}
        {...props}
      >
        {children}
      </select>
      {/* Chevron icon */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[--vc-text-tertiary]"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
}
