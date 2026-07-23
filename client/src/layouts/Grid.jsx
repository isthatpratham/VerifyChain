/**
 * layouts/Grid.jsx
 * Responsive grid system.
 * DESIGN_SYSTEM.md: prefer structured grids.
 */

const COLS = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
  12: 'grid-cols-12',
};

const GAPS = {
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
  xl: 'gap-12',
};

/**
 * @param {Object} props
 * @param {1|2|3|4|5|6|12} [props.cols=3]
 * @param {'sm'|'md'|'lg'|'xl'} [props.gap='md']
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export function Grid({ cols = 3, gap = 'md', className = '', children }) {
  return (
    <div
      className={[
        'grid',
        COLS[cols] || 'grid-cols-1',
        GAPS[gap],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
