/**
 * Textarea.jsx
 * Multi-line text input primitive. Same design tokens as Input.
 */

const BASE =
  'block w-full rounded-[--radius-md] border bg-[--vc-surface] ' +
  'px-3 py-2 text-[--text-base] text-[--vc-text-primary] leading-[--lh-normal] ' +
  'placeholder:text-[--vc-text-tertiary] resize-y ' +
  'transition-colors duration-[--duration-normal] ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[--vc-brand] focus-visible:ring-offset-0 ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

const STATES = {
  default: 'border-[--vc-border] hover:border-[--vc-border-strong] focus:border-[--vc-border-brand]',
  error:   'border-[--vc-error] focus-visible:ring-[--vc-error]',
  success: 'border-[--vc-success] focus-visible:ring-[--vc-success]',
};

export function Textarea({ state = 'default', className = '', rows = 4, ...props }) {
  return (
    <textarea
      rows={rows}
      className={[BASE, STATES[state], className].filter(Boolean).join(' ')}
      {...props}
    />
  );
}
