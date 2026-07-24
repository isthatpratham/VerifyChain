/**
 * Alert.jsx
 * Semantic alert/callout. info | success | warning | error.
 * DESIGN_SYSTEM.md: accent colors only for semantic states.
 */
import { Info, CheckCircle, Warning, XCircle } from '@phosphor-icons/react';

const CONFIG = {
  info:    { icon: Info,        bg: 'bg-[--vc-info-bg]',    border: 'border-[--color-info-100]',    text: 'text-[--vc-info-text]',    iconClass: 'text-[--vc-info]' },
  success: { icon: CheckCircle, bg: 'bg-[--vc-success-bg]', border: 'border-[--color-success-100]', text: 'text-[--vc-success-text]', iconClass: 'text-[--vc-success]' },
  warning: { icon: Warning,     bg: 'bg-[--vc-warning-bg]', border: 'border-[--color-warning-100]', text: 'text-[--vc-warning-text]', iconClass: 'text-[--vc-warning]' },
  error:   { icon: XCircle,     bg: 'bg-[--vc-error-bg]',   border: 'border-[--color-error-100]',   text: 'text-[--vc-error-text]',   iconClass: 'text-[--vc-error]' },
};

/**
 * @param {Object} props
 * @param {'info'|'success'|'warning'|'error'} [props.variant='info']
 * @param {string} [props.title]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export function Alert({ variant = 'info', title, className = '', children }) {
  const { icon: Icon, bg, border, text, iconClass } = CONFIG[variant];

  return (
    <div
      role="alert"
      className={[
        'flex gap-3 rounded-[--radius-md] border px-4 py-3',
        bg,
        border,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Icon size={18} weight="fill" className={['flex-shrink-0 mt-0.5', iconClass].join(' ')} aria-hidden="true" />
      <div>
        {title && (
          <p className={['text-[--text-sm] font-semibold mb-0.5', text].join(' ')}>{title}</p>
        )}
        <div className={['text-[--text-sm] leading-[--lh-normal]', text].join(' ')}>
          {children}
        </div>
      </div>
    </div>
  );
}
