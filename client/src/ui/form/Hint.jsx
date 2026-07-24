/**
 * Hint.jsx
 * Supporting hint text below a form field.
 */

export function Hint({ children, className = '' }) {
  return (
    <p className={['text-[--text-xs] text-[--vc-text-tertiary] leading-[--lh-normal]', className].filter(Boolean).join(' ')}>
      {children}
    </p>
  );
}
