/**
 * DesktopNav.jsx
 * Clean horizontal desktop navigation wrapper.
 * DESIGN_SYSTEM.md: clean horizontal navigation.
 */

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 */
export function DesktopNav({ children, className = '' }) {
  return (
    <nav
      aria-label="Primary navigation"
      className={[
        'hidden md:flex items-center gap-6',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </nav>
  );
}
