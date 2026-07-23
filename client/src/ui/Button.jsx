/**
 * Button.jsx
 *
 * Primary UI primitive with refined micro-interactions. Follows DESIGN_SYSTEM.md:
 * - Substantial feel, no oversized rounding, no gradients, no glow
 * - Tactile active press feedback (active:scale-[0.98])
 * - Subtle hover, accessible focus ring
 * - Variants: primary | secondary | ghost | destructive
 * - Size: sm | md | lg
 * - States: loading, disabled
 */
import { Spinner } from './Spinner';

const BASE =
  'inline-flex items-center justify-center gap-2 font-medium tracking-[-0.01em] ' +
  'rounded-[--radius-md] border transition-all duration-[--duration-fast] ' +
  'active:scale-[0.98] ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--vc-brand] focus-visible:ring-offset-2 ' +
  'disabled:pointer-events-none disabled:opacity-50 select-none';

const VARIANTS = {
  primary:
    'bg-[--vc-brand] text-white border-transparent ' +
    'hover:bg-[--vc-brand-hover] active:bg-[--vc-brand-active]',
  secondary:
    'bg-transparent text-[--vc-text-primary] border-[--vc-border] ' +
    'hover:bg-[--vc-bg-subtle] hover:border-[--vc-border-strong] active:bg-[--vc-bg-muted]',
  ghost:
    'bg-transparent text-[--vc-text-secondary] border-transparent ' +
    'hover:bg-[--vc-bg-muted] hover:text-[--vc-text-primary] active:bg-[--vc-bg-subtle]',
  destructive:
    'bg-[--vc-error] text-white border-transparent ' +
    'hover:bg-[--color-error-600] active:bg-[--color-error-700]',
};

const SIZES = {
  sm: 'h-8 px-3 text-[--text-sm]',
  md: 'h-10 px-4 text-[--text-base]',
  lg: 'h-12 px-6 text-[--text-md]',
};

/**
 * @param {Object} props
 * @param {'primary'|'secondary'|'ghost'|'destructive'} [props.variant='primary']
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {boolean} [props.loading=false]
 * @param {boolean} [props.disabled=false]
 * @param {boolean} [props.fullWidth=false]
 * @param {string}  [props.className]
 * @param {React.ReactNode} props.children
 */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  children,
  ...props
}) {
  return (
    <button
      className={[
        BASE,
        VARIANTS[variant],
        SIZES[size],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Spinner size="sm" className="text-current" />}
      {children}
    </button>
  );
}
