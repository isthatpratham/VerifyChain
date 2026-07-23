/**
 * Dropdown.jsx
 * Click-toggled dropdown menu. Keyboard navigable. Closes on outside click.
 */
import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * @param {Object} props
 * @param {React.ReactNode} props.trigger — the toggle element
 * @param {React.ReactNode} props.children — menu items
 * @param {'left'|'right'} [props.align='left']
 */
export function Dropdown({ trigger, children, align = 'left' }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e) => {
      if (!containerRef.current?.contains(e.target)) close();
    };
    const handleEsc = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open, close]);

  return (
    <div ref={containerRef} className="relative inline-block">
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && (
        <div
          role="menu"
          className={[
            'absolute top-full mt-1 z-[--z-dropdown]',
            'min-w-[10rem] rounded-[--radius-md] border border-[--vc-border]',
            'bg-[--vc-surface-overlay] shadow-[--shadow-sm] py-1',
            'transition-all duration-[--duration-fast] ease-out',
            align === 'right' ? 'right-0' : 'left-0',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * DropdownItem
 * @param {Object} props
 * @param {Function} [props.onClick]
 * @param {boolean} [props.destructive]
 */
export function DropdownItem({ onClick, destructive = false, children, ...props }) {
  return (
    <button
      role="menuitem"
      type="button"
      onClick={onClick}
      className={[
        'flex items-center gap-2 w-full px-3 py-2 text-left',
        'text-[--text-sm] transition-colors duration-[--duration-fast]',
        'focus-visible:outline-none focus-visible:bg-[--vc-bg-muted]',
        destructive
          ? 'text-[--vc-error] hover:bg-[--vc-error-bg]'
          : 'text-[--vc-text-primary] hover:bg-[--vc-bg-subtle]',
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * DropdownSeparator
 */
export function DropdownSeparator() {
  return <div role="separator" className="my-1 h-px bg-[--vc-border]" />;
}
