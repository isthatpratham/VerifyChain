/**
 * NavigationSection.jsx
 * Visual separator between navigation sections.
 */

export function NavigationSection({ className = '' }) {
  return (
    <div
      role="separator"
      className={['my-3 h-px bg-[--vc-border]', className].filter(Boolean).join(' ')}
    />
  );
}
