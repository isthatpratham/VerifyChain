/**
 * layouts/PageWrapper.jsx
 * Full-page wrapper. Sets min-height, background, entry animation.
 */

export function PageWrapper({ className = '', children, ...props }) {
  return (
    <main
      className={[
        'min-h-screen bg-[--vc-bg-base]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </main>
  );
}
