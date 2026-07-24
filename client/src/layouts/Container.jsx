/**
 * layouts/Container.jsx
 * Consistent max-width + horizontal padding container.
 * Replaces the old components/Container.jsx. Old one remains for backward compat.
 *
 * DESIGN_SYSTEM.md: consistent maximum widths, consistent horizontal padding.
 */

const MAX_WIDTHS = {
  xs:   'max-w-[--container-xs]',
  sm:   'max-w-[--container-sm]',
  md:   'max-w-[--container-md]',
  lg:   'max-w-[--container-lg]',
  xl:   'max-w-[--container-xl]',
  '2xl': 'max-w-[--container-2xl]',
  full: 'max-w-full',
};

/**
 * @param {Object} props
 * @param {'xs'|'sm'|'md'|'lg'|'xl'|'2xl'|'full'} [props.size='xl']
 * @param {boolean} [props.narrow=false] — convenience for md size
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export function Container({ size = 'xl', narrow = false, className = '', children }) {
  const resolvedSize = narrow ? 'md' : size;
  return (
    <div
      className={[
        'w-full mx-auto px-[--container-px] lg:px-[--container-px-lg]',
        MAX_WIDTHS[resolvedSize],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
