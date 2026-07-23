/**
 * MobileNav.jsx
 * Full-screen mobile navigation overlay.
 * DESIGN_SYSTEM.md: animated hamburger menu, thoughtfully designed, not a default drawer.
 * Slides in from top. Closes on escape or overlay click.
 * Locks body scroll when open.
 */
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * @param {Object} props
 * @param {boolean} props.open
 * @param {Function} props.onClose
 * @param {React.ReactNode} props.children
 */
export function MobileNav({ open, onClose, children }) {
  // Body scroll lock + escape key
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onEsc);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onEsc);
    };
  }, [open, onClose]);

  return createPortal(
    <div
      id="mobile-nav"
      aria-hidden={!open}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-overlay)',
        pointerEvents: open ? 'all' : 'none',
      }}
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.3)',
          opacity: open ? 1 : 0,
          transition: 'opacity var(--duration-deliberate) var(--ease-in-out)',
        }}
      />

      {/* Panel — slides down from top */}
      <nav
        role="navigation"
        aria-label="Mobile navigation"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--vc-bg-base)',
          borderBottom: '1px solid var(--vc-border)',
          padding: 'var(--space-6)',
          transform: open ? 'translateY(0)' : 'translateY(-100%)',
          opacity: open ? 1 : 0,
          transition: `transform var(--duration-deliberate) var(--ease-in-out),
                       opacity var(--duration-normal) var(--ease-in-out)`,
        }}
      >
        {children}
      </nav>
    </div>,
    document.body
  );
}
