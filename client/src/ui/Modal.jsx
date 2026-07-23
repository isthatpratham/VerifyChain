/**
 * Modal.jsx
 * Accessible modal dialog. Focus trap + keyboard escape.
 * Rendered into document.body via React portal.
 */
import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from '@phosphor-icons/react';

/**
 * @param {Object} props
 * @param {boolean} props.open
 * @param {Function} props.onClose
 * @param {string} [props.title]
 * @param {'sm'|'md'|'lg'|'xl'} [props.size='md']
 * @param {React.ReactNode} props.children
 */
export function Modal({ open, onClose, title, size = 'md', children }) {
  const overlayRef = useRef(null);
  const dialogRef = useRef(null);

  const SIZE_CLASSES = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  // Escape key
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  // Focus trap
  useEffect(() => {
    if (!open) return;
    const el = dialogRef.current;
    if (!el) return;

    const focusable = el.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const trapFocus = (e) => {
      if (e.key !== 'Tab') return;
      if (focusable.length === 0) { e.preventDefault(); return; }
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    el.addEventListener('keydown', trapFocus);
    first?.focus();

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      el.removeEventListener('keydown', trapFocus);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return createPortal(
    <div
      ref={overlayRef}
      role="presentation"
      className="fixed inset-0 z-[--z-modal] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'vc-modal-title' : undefined}
        className={[
          'relative z-10 w-full rounded-[--radius-md] border border-[--vc-border]',
          'bg-[--vc-surface-overlay] shadow-[--shadow-md]',
          'transition-all duration-[--duration-fast] ease-out scale-100 opacity-100',
          SIZE_CLASSES[size],
        ]
          .filter(Boolean)
          .join(' ')}
      >

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[--vc-border]">
            <h2
              id="vc-modal-title"
              className="text-[--text-lg] font-semibold text-[--vc-text-primary] font-[--font-heading] tracking-[--ls-snug]"
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="flex items-center justify-center w-8 h-8 rounded-[--radius-sm] text-[--vc-text-tertiary] hover:text-[--vc-text-primary] hover:bg-[--vc-bg-muted] transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--vc-brand]"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
