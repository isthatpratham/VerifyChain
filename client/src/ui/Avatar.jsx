/**
 * Avatar.jsx
 * User avatar with initials fallback. No image dependency.
 */

const SIZES = {
  xs: 'w-6 h-6 text-[--text-xs]',
  sm: 'w-8 h-8 text-[--text-xs]',
  md: 'w-10 h-10 text-[--text-sm]',
  lg: 'w-12 h-12 text-[--text-base]',
  xl: 'w-16 h-16 text-[--text-lg]',
};

/**
 * @param {Object} props
 * @param {string} [props.src] — image URL
 * @param {string} [props.name] — used for initials fallback and alt text
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} [props.size='md']
 * @param {string} [props.className]
 */
export function Avatar({ src, name = '', size = 'md', className = '' }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');

  const base = [
    'inline-flex items-center justify-center rounded-[--radius-sm]',
    'font-medium font-[--font-heading] select-none overflow-hidden',
    SIZES[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={`${base} object-cover bg-[--vc-bg-muted]`}
      />
    );
  }

  return (
    <span
      aria-label={name || 'Avatar'}
      className={`${base} bg-[--vc-bg-muted] text-[--vc-text-secondary] border border-[--vc-border]`}
    >
      {initials || '?'}
    </span>
  );
}
