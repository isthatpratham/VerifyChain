/**
 * MobileNavigation.jsx
 * Full-viewport mobile navigation.
 */
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NavigationItem } from './NavigationItem';
import { NavigationSection } from './NavigationSection';
import { NavigationGroup } from './NavigationGroup';
import { NavigationActions } from './NavigationActions';
import { NavigationLogo } from './NavigationLogo';
import { NavHamburger } from './NavHamburger';

const PUBLIC_NAV = [
  { to: '/',            label: 'Home',         end: true },
  { to: '/features',    label: 'Features'      },
  { to: '/solutions',   label: 'Solutions'     },
  { to: '/how-it-works',label: 'How It Works'  },
  { to: '/about',       label: 'About'         },
  { to: '/faq',         label: 'FAQ'           },
  { to: '/contact',     label: 'Contact'       },
];


const AUTH_NAV = [
  { to: '/dashboard',          label: 'Dashboard'          },
  { to: '/profile',            label: 'Business Profile'    },
  { to: '/supplier-trust',     label: 'Supplier Trust'      },
  { to: '/trust-distribution', label: 'Trust Distribution'   },
];

const mobileItemClass = [
  'flex items-center px-3 py-2.5 rounded-[--radius-sm]',
  'text-[--text-sm] font-medium text-[--vc-text-primary]',
  'transition-colors duration-[--duration-fast]',
  'hover:bg-[--vc-bg-muted]',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--vc-brand]',
].join(' ');

/**
 * @param {Object} props
 * @param {boolean}  props.open
 * @param {Function} props.onClose
 * @param {boolean}  props.isAuthenticated
 */
export function MobileNavigation({ open, onClose, isAuthenticated }) {
  const panelRef = useRef(null);

  // Scroll lock + escape key
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

  // Focus trap — keeps tab within panel when open
  useEffect(() => {
    if (!open || !panelRef.current) return;
    const focusable = panelRef.current.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;

    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    const trap = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    };

    document.addEventListener('keydown', trap);
    // Move focus into panel
    first.focus();
    return () => document.removeEventListener('keydown', trap);
  }, [open]);

  const items = isAuthenticated ? AUTH_NAV : PUBLIC_NAV;

  return createPortal(
    <div
      id="site-mobile-nav"
      aria-hidden={!open}
      aria-modal={open ? 'true' : undefined}
      role={open ? 'dialog' : undefined}
      aria-label="Mobile navigation"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-overlay)',
        pointerEvents: open ? 'all' : 'none',
      }}
    >
      {/* ── Backdrop ── */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.25)',
          backdropFilter: 'blur(2px)',
          opacity: open ? 1 : 0,
          transition: 'opacity var(--duration-deliberate) var(--ease-in-out)',
        }}
      />

      {/* ── Panel — slides from top beneath navbar height ── */}
      <div
        ref={panelRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--vc-bg-base)',
          borderBottom: '1px solid var(--vc-border)',
          transform: open ? 'translateY(0)' : 'translateY(-100%)',
          opacity: open ? 1 : 0,
          willChange: 'transform, opacity',
          transition: `transform var(--duration-deliberate) var(--ease-in-out),
                       opacity var(--duration-normal) var(--ease-in-out)`,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header row inside panel */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-[--vc-border]">
          <NavigationLogo />
          <NavHamburger open={open} onClick={onClose} />
        </div>

        {/* Nav links */}
        <nav
          aria-label="Mobile navigation links"
          className="px-3 py-4 flex flex-col gap-0.5"
        >
          <NavigationGroup label={isAuthenticated ? 'Navigation' : undefined}>
            {items.map((item) => (
              <NavigationItem
                key={item.to}
                to={item.to}
                end={item.end}
                className={mobileItemClass}
                onClick={onClose}
              >
                {item.label}
              </NavigationItem>
            ))}
          </NavigationGroup>

          <NavigationSection />

          {/* Auth actions */}
          <NavigationActions context="mobile" onClose={onClose} />
        </nav>
      </div>
    </div>,
    document.body
  );
}
