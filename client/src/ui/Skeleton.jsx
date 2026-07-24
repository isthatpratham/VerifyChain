/**
 * Skeleton.jsx
 * Skeleton loader. DESIGN_SYSTEM.md: prefer skeleton loaders over spinners.
 * GPU-accelerated shimmer via CSS animation.
 */

/**
 * @param {Object} props
 * @param {'line'|'block'|'avatar'|'text'} [props.variant='line']
 * @param {string} [props.width]      — CSS width, e.g. '100%', '12rem'
 * @param {string} [props.height]     — CSS height
 * @param {number} [props.lines=1]    — for variant='text', number of lines
 * @param {string} [props.className]
 */
export function Skeleton({
  variant = 'line',
  width,
  height,
  lines = 1,
  className = '',
}) {
  const base =
    'animate-pulse bg-[--vc-bg-muted] rounded-[--radius-sm]';

  if (variant === 'avatar') {
    return (
      <span
        aria-hidden="true"
        className={['inline-block w-10 h-10 rounded-[--radius-sm]', base, className]
          .filter(Boolean)
          .join(' ')}
        style={{ width, height }}
      />
    );
  }

  if (variant === 'text') {
    return (
      <div aria-hidden="true" className={['flex flex-col gap-2', className].filter(Boolean).join(' ')}>
        {Array.from({ length: lines }).map((_, i) => (
          <span
            key={i}
            className={[base, 'block h-4']}
            style={{ width: i === lines - 1 && lines > 1 ? '65%' : '100%' }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'block') {
    return (
      <span
        aria-hidden="true"
        className={['block', base, className].filter(Boolean).join(' ')}
        style={{ width: width || '100%', height: height || '8rem' }}
      />
    );
  }

  // variant === 'line'
  return (
    <span
      aria-hidden="true"
      className={['block h-4', base, className].filter(Boolean).join(' ')}
      style={{ width: width || '100%', height }}
    />
  );
}
