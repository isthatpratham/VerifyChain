/**
 * Input.jsx
 *
 * Text input primitive. DESIGN_SYSTEM.md: clarity, clear labels, minimal.
 * Supports: default, error, success states.
 */

const BASE =
  'block w-full rounded-[--radius-md] border bg-[--vc-surface] ' +
  'px-3 py-2 text-[--text-base] text-[--vc-text-primary] ' +
  'placeholder:text-[--vc-text-tertiary] ' +
  'transition-colors duration-[--duration-normal] ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[--vc-brand] focus-visible:ring-offset-0 ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

const STATES = {
  default: 'border-[--vc-border] hover:border-[--vc-border-strong] focus:border-[--vc-border-brand]',
  error:   'border-[--vc-error] focus-visible:ring-[--vc-error]',
  success: 'border-[--vc-success] focus-visible:ring-[--vc-success]',
};

/**
 * @param {Object} props
 * @param {'default'|'error'|'success'} [props.state='default']
 * @param {string} [props.className]
 * @param {string} [props.id]
 * @param {string} [props.name]
 */
export function Input({ state = 'default', className = '', id, name, ...props }) {
  const resolvedName = name || id;
  return (
    <input
      id={id}
      name={resolvedName}
      className={[BASE, STATES[state], className].filter(Boolean).join(' ')}
      {...props}
    />
  );
}
