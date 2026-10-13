/**
 * NavigationLogo.jsx
 * Official VerifyChain logo component featuring the glossy monochrome V emblem.
 * Centralized branding component supporting wordmark, compact mark, and custom sizing.
 */
import { Link } from 'react-router-dom';

/**
 * @param {Object} props
 * @param {'default'|'inverse'} [props.variant='default']
 * @param {'full'|'mark'} [props.mode='full']
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {string|null} [props.to='/']
 * @param {string} [props.subtitle]
 * @param {string} [props.className]
 * @param {string} [props.alt='VerifyChain']
 */
export function NavigationLogo({
  variant = 'default',
  mode = 'full',
  size = 'md',
  to = '/',
  subtitle,
  className = '',
  alt = 'VerifyChain',
}) {
  const isInverse = variant === 'inverse';
  const textColor = isInverse ? 'text-white' : 'text-[--vc-text-primary]';

  const markSizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  }[size] || 'w-8 h-8';

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-[--text-md]',
    lg: 'text-lg',
  }[size] || 'text-[--text-md]';

  const markElement = (
    <span
      className={`flex-shrink-0 flex items-center justify-center overflow-hidden rounded-lg bg-zinc-900 border border-zinc-800 shadow-xs transition-transform duration-150 group-hover:scale-105 ${markSizeClasses}`}
    >
      <img
        src="/verifychain-mark.png"
        alt={mode === 'mark' ? alt : ''}
        className="w-full h-full object-contain p-0.5 filter drop-shadow-sm select-none"
        loading="eager"
      />
    </span>
  );

  const content = (
    <>
      {markElement}
      {mode !== 'mark' && (
        <span className="flex flex-col min-w-0">
          <span
            className={`font-[--font-heading] font-bold tracking-[--ls-snug] leading-none ${textSizeClasses} ${textColor}`}
          >
            VerifyChain
          </span>
          {subtitle && (
            <span className="text-[10px] font-mono text-gray-500 font-medium leading-tight mt-0.5">
              {subtitle}
            </span>
          )}
        </span>
      )}
    </>
  );

  const wrapperClasses = [
    'group inline-flex items-center gap-2.5 focus-visible:outline-none',
    'focus-visible:ring-2 focus-visible:ring-[--vc-brand] rounded-[--radius-sm] transition-opacity hover:opacity-95',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (!to) {
    return (
      <div className={wrapperClasses} aria-label={alt}>
        {content}
      </div>
    );
  }

  return (
    <Link
      to={to}
      aria-label={`${alt} — return to home`}
      className={wrapperClasses}
    >
      {content}
    </Link>
  );
}
