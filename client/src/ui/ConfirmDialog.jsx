/**
 * ConfirmDialog.jsx
 * Reusable accessible confirmation dialog primitive for critical & destructive actions.
 * Follows DESIGN_SYSTEM.md tokens:
 * - Substantial feel, minimal border-based depth
 * - Focus trap and escape key handling
 * - Variants: destructive | warning | info
 */
import { Modal } from './Modal';
import { Button } from './Button';
import { WarningCircle, ShieldWarning, Info } from '@phosphor-icons/react';

/**
 * @param {Object} props
 * @param {boolean} props.open
 * @param {Function} props.onClose
 * @param {Function} props.onConfirm
 * @param {string} props.title
 * @param {string} props.message
 * @param {string} [props.confirmText='Confirm']
 * @param {string} [props.cancelText='Cancel']
 * @param {'destructive'|'warning'|'info'} [props.variant='destructive']
 * @param {boolean} [props.loading=false]
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'destructive',
  loading = false,
}) {
  const ICON_MAP = {
    destructive: <WarningCircle size={24} className="text-[--vc-error]" />,
    warning: <ShieldWarning size={24} className="text-[--vc-warning]" />,
    info: <Info size={24} className="text-[--vc-info]" />,
  };

  const BUTTON_VARIANT_MAP = {
    destructive: 'destructive',
    warning: 'primary',
    info: 'primary',
  };

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 p-2 rounded-[--radius-sm] bg-[--vc-bg-subtle] border border-[--vc-border]">
            {ICON_MAP[variant]}
          </div>
          <div className="space-y-1">
            <p className="text-[--text-xs] text-[--vc-text-secondary] leading-[--lh-relaxed]">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[--vc-border]">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={BUTTON_VARIANT_MAP[variant]}
            size="sm"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
