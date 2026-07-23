/**
 * NavDropdown.jsx
 * Navigation-level dropdown (hover + click). Desktop only.
 * Mobile nav uses MobileNav.jsx instead.
 */
import { useState, useRef, useEffect } from 'react';
import { CaretDown } from '@phosphor-icons/react';

/**
 * @param {Object} props
 * @param {string} props.label
 * @param {React.ReactNode} props.children
 */
export function NavDropdown({ label, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', handle);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 text-[--text-sm] font-medium text-[--vc-text-secondary] hover:text-[--vc-text-primary] transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:underline"
      >
        {label}
        <CaretDown
          size={12}
          className={['transition-transform duration-[--duration-normal]', open ? 'rotate-180' : ''].filter(Boolean).join(' ')}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 z-[--z-dropdown] min-w-[12rem] rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-overlay] shadow-[--shadow-sm] py-1">
          {children}
        </div>
      )}
    </div>
  );
}
