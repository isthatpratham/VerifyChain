/**
 * Chip.jsx
 * Dismissible chip/tag. Functionally used for filters, selections.
 */
import { X } from '@phosphor-icons/react';

/**
 * @param {Object} props
 * @param {string} [props.label]
 * @param {Function} [props.onDismiss]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export function Chip({ label, onDismiss, className = '', children }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-2.5 py-1',
        'rounded-[--radius-sm] border border-[--vc-border]',
        'bg-[--vc-bg-subtle] text-[--vc-text-secondary]',
        'text-[--text-sm] font-medium leading-none',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {label || children}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Remove"
          className="flex items-center justify-center text-[--vc-text-tertiary] hover:text-[--vc-text-primary] transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[--vc-brand] rounded-[--radius-sm]"
        >
          <X size={12} weight="bold" />
        </button>
      )}
    </span>
  );
}
