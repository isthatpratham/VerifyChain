/**
 * Divider.jsx
 * Horizontal or vertical divider. Semantic <hr> or <div>.
 */

/**
 * @param {Object} props
 * @param {'horizontal'|'vertical'} [props.orientation='horizontal']
 * @param {string} [props.label] — optional center label
 * @param {string} [props.className]
 */
export function Divider({ orientation = 'horizontal', label, className = '' }) {
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={['h-full w-px bg-[--vc-border]', className].filter(Boolean).join(' ')}
      />
    );
  }

  if (label) {
    return (
      <div
        role="separator"
        className={['flex items-center gap-3 w-full', className].filter(Boolean).join(' ')}
      >
        <hr className="flex-1 border-t border-[--vc-border]" />
        <span className="text-[--text-xs] text-[--vc-text-tertiary] tracking-[--ls-wide] uppercase">
          {label}
        </span>
        <hr className="flex-1 border-t border-[--vc-border]" />
      </div>
    );
  }

  return (
    <hr
      className={['border-t border-[--vc-border] w-full', className].filter(Boolean).join(' ')}
    />
  );
}
