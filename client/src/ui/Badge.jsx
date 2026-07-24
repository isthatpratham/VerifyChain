/**
 * Badge.jsx
 * Status indicator. Small, semantic-color-coded labels.
 * DESIGN_SYSTEM.md: accent colors only for semantic states.
 */

const VARIANTS = {
  neutral: 'bg-[--vc-bg-muted] text-[--vc-text-secondary] border-[--vc-border]',
  success: 'bg-[--vc-success-bg] text-[--vc-success-text] border-[--color-success-100]',
  warning: 'bg-[--vc-warning-bg] text-[--vc-warning-text] border-[--color-warning-100]',
  error:   'bg-[--vc-error-bg] text-[--vc-error-text] border-[--color-error-100]',
  info:    'bg-[--vc-info-bg] text-[--vc-info-text] border-[--color-info-100]',
  brand:   'bg-[--vc-brand-subtle] text-[--vc-brand-subtle-text] border-[--color-prussian-100]',
};

/**
 * @param {Object} props
 * @param {'neutral'|'success'|'warning'|'error'|'info'|'brand'} [props.variant='neutral']
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export function Badge({ variant = 'neutral', className = '', children }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-[--radius-sm] border',
        'text-[--text-xs] font-medium leading-none tracking-[--ls-wide]',
        VARIANTS[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  );
}
