/**
 * NavDivider.jsx
 * Thin separator between navigation sections.
 */

export function NavDivider({ className = '' }) {
  return (
    <div
      role="separator"
      className={['my-2 h-px bg-[--vc-border]', className].filter(Boolean).join(' ')}
    />
  );
}
