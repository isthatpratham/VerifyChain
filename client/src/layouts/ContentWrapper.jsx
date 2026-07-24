/**
 * layouts/ContentWrapper.jsx
 * Constrained content area within a page. Narrows reading width.
 */

export function ContentWrapper({ className = '', children }) {
  return (
    <div
      className={[
        'w-full max-w-[--container-md] mx-auto',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
