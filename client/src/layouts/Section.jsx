/**
 * layouts/Section.jsx
 * Section with consistent vertical rhythm.
 * DESIGN_SYSTEM.md: every section should breathe, use generous whitespace.
 */

const SPACING = {
  sm: 'py-[--section-py-sm]',
  md: 'py-[--section-py]',
  lg: 'py-[--section-py-lg]',
};

/**
 * @param {Object} props
 * @param {'sm'|'md'|'lg'} [props.spacing='md']
 * @param {string} [props.as='section'] — semantic element
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export function Section({ spacing = 'md', as: Tag = 'section', className = '', children, ...props }) {
  return (
    <Tag
      className={[SPACING[spacing], className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </Tag>
  );
}
