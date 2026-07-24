/**
 * layouts/Stack.jsx
 * Vertical flex stack with consistent gap.
 */

const GAPS = {
  1: 'gap-1',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
  8: 'gap-8',
  10: 'gap-10',
  12: 'gap-12',
};

/**
 * @param {Object} props
 * @param {1|2|3|4|5|6|8|10|12} [props.gap=4]
 * @param {string} [props.as='div']
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export function Stack({ gap = 4, as: Tag = 'div', className = '', children, ...props }) {
  return (
    <Tag
      className={[
        'flex flex-col',
        GAPS[gap] || `gap-${gap}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </Tag>
  );
}
