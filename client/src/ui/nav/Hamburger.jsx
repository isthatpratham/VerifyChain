/**
 * Hamburger.jsx
 * Animated hamburger button. 3 lines → X on open.
 * DESIGN_SYSTEM.md: animated hamburger menu, thoughtfully designed.
 * Uses CSS transforms only — no JS animation libraries.
 */

/**
 * @param {Object} props
 * @param {boolean} props.open
 * @param {Function} props.onClick
 * @param {string} [props.className]
 */
export function Hamburger({ open, onClick, className = '' }) {
  return (
    <button
      type="button"
      aria-label={open ? 'Close menu' : 'Open menu'}
      aria-expanded={open}
      aria-controls="mobile-nav"
      onClick={onClick}
      className={[
        'flex flex-col justify-center items-center w-10 h-10 gap-[5px]',
        'rounded-[--radius-sm] border border-transparent',
        'hover:bg-[--vc-bg-muted] transition-colors duration-[--duration-fast]',
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
          display: 'block',
          width: '18px',
          height: '1.5px',
          backgroundColor: 'var(--vc-text-primary)',
          transformOrigin: 'center',
          transition: `transform var(--duration-normal) var(--ease-in-out),
                       opacity var(--duration-fast) var(--ease-in-out)`,
          transform: open ? 'translateY(6.5px) rotate(45deg)' : 'none',
        }}
      />
      {/* Middle bar */}
      <span
        aria-hidden="true"
        style={{
          display: 'block',
          width: '18px',
          height: '1.5px',
          backgroundColor: 'var(--vc-text-primary)',
          transition: `opacity var(--duration-fast) var(--ease-in-out),
                       transform var(--duration-normal) var(--ease-in-out)`,
          opacity: open ? 0 : 1,
          transform: open ? 'scaleX(0)' : 'none',
        }}
      />
      {/* Bottom bar */}
      <span
        aria-hidden="true"
        style={{
          display: 'block',
          width: '18px',
          height: '1.5px',
          backgroundColor: 'var(--vc-text-primary)',
          transformOrigin: 'center',
          transition: `transform var(--duration-normal) var(--ease-in-out),
                       opacity var(--duration-fast) var(--ease-in-out)`,
          transform: open ? 'translateY(-6.5px) rotate(-45deg)' : 'none',
        }}
      />
    </button>
  );
}
