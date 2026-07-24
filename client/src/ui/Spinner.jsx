/**
 * Spinner.jsx
 *
 * Minimal CSS-only spinner. GPU-accelerated via transform.
 * Used as loading indicator inside Button and standalone.
 */

const SIZES = {
  sm: 'w-3.5 h-3.5 border-[1.5px]',
  md: 'w-5 h-5 border-2',
  lg: 'w-7 h-7 border-[2.5px]',
};

/**
 * @param {Object} props
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {string} [props.className]
 */
export function Spinner({ size = 'md', className = '' }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={[
        'inline-block rounded-full border-current border-r-transparent animate-spin',
        SIZES[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  );
}
