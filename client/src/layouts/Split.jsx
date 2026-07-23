/**
 * layouts/Split.jsx
 * Two-column split layout. Asymmetric or equal.
 * DESIGN_SYSTEM.md: prefer asymmetrical layouts, split layouts.
 */

const RATIOS = {
  equal:     'lg:grid-cols-2',
  '1-2':     'lg:grid-cols-[1fr_2fr]',
  '2-1':     'lg:grid-cols-[2fr_1fr]',
  '1-3':     'lg:grid-cols-[1fr_3fr]',
  '3-1':     'lg:grid-cols-[3fr_1fr]',
  'auth':    'lg:grid-cols-[5fr_7fr]',  /* auth: form | visual */
};

/**
 * @param {Object} props
 * @param {'equal'|'1-2'|'2-1'|'1-3'|'3-1'|'auth'} [props.ratio='equal']
 * @param {'sm'|'md'|'lg'} [props.gap='md']
 * @param {boolean} [props.reverseOnMobile=false]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children — exactly two children
 */
export function Split({ ratio = 'equal', gap = 'md', reverseOnMobile = false, className = '', children }) {
  const gapClass = { sm: 'gap-6', md: 'gap-8 lg:gap-12', lg: 'gap-12 lg:gap-20' }[gap];
  return (
    <div
      className={[
        'grid grid-cols-1',
        RATIOS[ratio] || RATIOS.equal,
        gapClass,
        reverseOnMobile ? 'flex-col-reverse' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
