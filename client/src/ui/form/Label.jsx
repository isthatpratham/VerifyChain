/**
 * Label.jsx
 * Form label. Includes required indicator.
 */

/**
 * @param {Object} props
 * @param {string} props.htmlFor
 * @param {boolean} [props.required=false]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export function Label({ htmlFor, required = false, className = '', children }) {
  return (
    <label
      htmlFor={htmlFor}
      className={[
        'block text-[--text-sm] font-medium text-[--vc-text-primary] leading-none',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
      {required && (
        <span aria-hidden="true" className="ml-1 text-[--vc-error]">
          *
        </span>
      )}
    </label>
  );
}
