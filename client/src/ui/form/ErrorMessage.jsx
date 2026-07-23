/**
 * ErrorMessage.jsx
 * Validation error message below a form field.
 * DESIGN_SYSTEM.md: error messages should remain concise.
 */

/**
 * @param {Object} props
 * @param {string} [props.id] — for aria-describedby linkage
 * @param {React.ReactNode} props.children
 */
export function ErrorMessage({ id, children, className = '' }) {
  if (!children) return null;
  return (
    <p
      id={id}
      role="alert"
      aria-live="polite"
      className={['text-[--text-xs] text-[--vc-error] leading-[--lh-normal]', className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </p>
  );
}
