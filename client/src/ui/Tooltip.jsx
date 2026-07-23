/**
 * Tooltip.jsx
 * CSS-driven tooltip. No JS positioning — uses data-tip attribute.
 * Accessible: role="tooltip", aria-describedby.
 */
import { useRef, useId } from 'react';

/**
 * @param {Object} props
 * @param {string} props.content — tooltip text
 * @param {'top'|'bottom'|'left'|'right'} [props.placement='top']
 * @param {React.ReactNode} props.children
 */
export function Tooltip({ content, placement = 'top', children }) {
  const id = useId();
  const triggerRef = useRef(null);

  const placementClasses = {
    top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left:   'right-full top-1/2 -translate-y-1/2 mr-2',
    right:  'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <span className="relative inline-flex items-center" ref={triggerRef}>
      <span
        className="peer"
        aria-describedby={id}
      >
        {children}
      </span>
      <span
        id={id}
        role="tooltip"
        className={[
          'pointer-events-none absolute z-[--z-tooltip] whitespace-nowrap',
          'rounded-[--radius-sm] border border-[--vc-border]',
          'bg-[--vc-text-primary] text-[--color-white] px-2 py-1',
          'text-[--text-xs] leading-none',
          'opacity-0 peer-hover:opacity-100 peer-focus-visible:opacity-100',
          'transition-opacity duration-[--duration-normal]',
          placementClasses[placement],
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {content}
      </span>
    </span>
  );
}
