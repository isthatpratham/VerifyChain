/**
 * NavHamburger.jsx
 * Premium animated hamburger/close button.
 *
 * Animation:
 *   closed → open:
 *     top bar:    slides down + rotates 45deg
 *     middle bar: fades out + scales to 0
 *     bottom bar: slides up + rotates -45deg
 *
 * Timing: deliberate, not snappy — communicates intentionality.
 * GPU: transform + opacity only.
 * DESIGN_SYSTEM.md: animated hamburger menu, thoughtfully designed.
 */

/**
 * @param {Object} props
 * @param {boolean} props.open
 * @param {Function} props.onClick
 * @param {string} [props.className]
 */
export function NavHamburger({ open, onClick, className = '' }) {
  const BAR_STYLE = {
    display: 'block',
    width: '18px',
    height: '1.5px',
    backgroundColor: 'var(--vc-text-primary)',
    borderRadius: '1px',
    transformOrigin: 'center',
    willChange: 'transform, opacity',
  };

  return (
    <button
      type="button"
      aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
      aria-expanded={open}
      aria-controls="site-mobile-nav"
      onClick={onClick}
      className={[
        'flex flex-col items-center justify-center gap-[5px]',
        'w-9 h-9 rounded-[--radius-sm]',
        'hover:bg-[--vc-bg-muted]',
        'transition-colors duration-[--duration-fast]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--vc-brand]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Top bar */}
      <span
        aria-hidden="true"
        style={{
          ...BAR_STYLE,
          transition: `transform var(--duration-deliberate) var(--ease-in-out)`,
          transform: open ? 'translateY(6.5px) rotate(45deg)' : 'translateY(0) rotate(0)',
        }}
      />
      {/* Middle bar */}
      <span
        aria-hidden="true"
        style={{
          ...BAR_STYLE,
          transition: `opacity var(--duration-fast) var(--ease-in-out), transform var(--duration-deliberate) var(--ease-in-out)`,
          opacity: open ? 0 : 1,
          transform: open ? 'scaleX(0)' : 'scaleX(1)',
        }}
      />
      {/* Bottom bar */}
      <span
        aria-hidden="true"
        style={{
          ...BAR_STYLE,
          transition: `transform var(--duration-deliberate) var(--ease-in-out)`,
          transform: open ? 'translateY(-6.5px) rotate(-45deg)' : 'translateY(0) rotate(0)',
        }}
      />
    </button>
  );
}
