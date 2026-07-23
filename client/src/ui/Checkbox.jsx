/**
 * Checkbox.jsx
 * Accessible checkbox primitive with custom styling.
 */

/**
 * @param {Object} props
 * @param {string} props.id
 * @param {string} [props.label]
 * @param {boolean} [props.error]
 * @param {string} [props.className]
 */
export function Checkbox({ id, label, error = false, className = '', ...props }) {
  return (
    <div className={['flex items-start gap-2.5', className].filter(Boolean).join(' ')}>
      <input
        type="checkbox"
        id={id}
        className={[
          'mt-0.5 h-4 w-4 rounded-[--radius-sm] border cursor-pointer',
          'accent-[--vc-brand]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--vc-brand] focus-visible:ring-offset-1',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error ? 'border-[--vc-error]' : 'border-[--vc-border]',
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
      {label && (
        <label
          htmlFor={id}
          className="text-[--text-sm] text-[--vc-text-primary] leading-[--lh-normal] cursor-pointer"
        >
          {label}
        </label>
      )}
    </div>
  );
}
