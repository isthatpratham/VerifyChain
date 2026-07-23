/**
 * NavGroup.jsx
 * Navigation group with section label.
 */

export function NavGroup({ label, children, className = '' }) {
  return (
    <div className={['flex flex-col gap-0.5', className].filter(Boolean).join(' ')}>
      {label && (
        <span className="px-3 py-1 text-[--text-xs] font-semibold uppercase tracking-[--ls-caps] text-[--vc-text-tertiary]">
          {label}
        </span>
      )}
      {children}
    </div>
  );
}
