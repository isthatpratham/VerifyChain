/**
 * NavigationLogo.jsx
 * VerifyChain wordmark. Links to home.
 * DESIGN_SYSTEM.md: Plus Jakarta Sans, Prussian Blue, confident not loud.
 */
import { Link } from 'react-router-dom';

/**
 * @param {Object} props
 * @param {'default'|'inverse'} [props.variant='default']
 * @param {string} [props.className]
 */
export function NavigationLogo({ variant = 'default', className = '' }) {
  const textColor =
    variant === 'inverse' ? 'text-white' : 'text-[--vc-text-primary]';

  return (
    <Link
      to="/"
      aria-label="VerifyChain — return to home"
      className={[
        'inline-flex items-center gap-2 focus-visible:outline-none',
        'focus-visible:ring-2 focus-visible:ring-[--vc-brand] rounded-[--radius-sm]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Mark — a minimal square-bracket SVG suggesting verification */}
      <span aria-hidden="true" className="flex-shrink-0">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer square bracket left */}
          <path
            d="M7 3H4v14h3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={variant === 'inverse' ? 'text-white' : 'text-[--vc-brand]'}
          />
          {/* Outer square bracket right */}
          <path
            d="M13 3h3v14h-3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={variant === 'inverse' ? 'text-white' : 'text-[--vc-brand]'}
          />
          {/* Check mark inside */}
          <path
            d="M7.5 10.5l2 2 3-3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={variant === 'inverse' ? 'text-white' : 'text-[--vc-brand]'}
          />
        </svg>
      </span>

      {/* Wordmark */}
      <span
        className={[
          'font-[--font-heading] font-semibold tracking-[--ls-snug]',
          'text-[--text-md] leading-none',
          textColor,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        VerifyChain
      </span>
    </Link>
  );
}
