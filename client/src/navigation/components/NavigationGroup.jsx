/**
 * NavigationGroup.jsx
 * Groups navigation items with an optional label.
 * Used in mobile navigation for sectioned menus.
 */

/**
 * @param {Object} props
 * @param {string} [props.label]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export function NavigationGroup({ label, className = '', children }) {
  return (
    <div className={['flex flex-col gap-0', className].filter(Boolean).join(' ')}>
      {label && (
        <span className="px-3 pb-1 pt-2 text-[--text-xs] font-semibold uppercase tracking-[--ls-caps] text-[--vc-text-tertiary]">
          {label}
        </span>
      )}
      {children}
    </div>
  );
}
