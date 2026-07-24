/**
 * NavigationContainer.jsx
 * Sticky outer wrapper. Applies scroll-linked background, border, and visibility.
 *
 * Scroll states:
 *   at top     — transparent background, no border
 *   scrolled   — solid white background, bottom border
 *   visible    — visible (translateY(0))
 *   !visible   — hidden (translateY(-100%))
 *
 * GPU-accelerated: uses transform + opacity, never height/top.
 */

/**
 * @param {Object} props
 * @param {boolean} props.scrolled   — scroll is past SCROLL_THRESHOLD
 * @param {boolean} props.visible    — should navbar be visible
 * @param {string}  [props.className]
 * @param {React.ReactNode} props.children
 */
export function NavigationContainer({ scrolled, visible, className = '', children }) {
  return (
    <header
      role="banner"
      className={[
        'fixed top-0 left-0 right-0 z-[--z-sticky]',
        'will-change-transform',
        'transition-all duration-[--duration-deliberate]',
        // Background
        scrolled
          ? 'bg-[--vc-bg-base]/95 backdrop-blur-[2px] border-b border-[--vc-border]'
          : 'bg-transparent border-b border-transparent',
        // Visibility — transform only (GPU)
        visible ? 'translate-y-0' : '-translate-y-full',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        // Transition shadow separately to avoid janky all-in-one
        boxShadow: scrolled ? 'var(--shadow-xs)' : 'none',
      }}
    >
      {children}
    </header>
  );
}
