/**
 * Accordion.jsx
 * Accessible disclosure/accordion. Single or multi-open.
 * Uses <details>/<summary> for native keyboard support.
 */

/**
 * @param {Object} props
 * @param {string} props.title
 * @param {boolean} [props.defaultOpen=false]
 * @param {React.ReactNode} props.children
 */
export function AccordionItem({ title, defaultOpen = false, children }) {
  return (
    <details
      open={defaultOpen}
      className="group border-b border-[--vc-border] last:border-b-0"
    >
      <summary className="flex items-center justify-between w-full px-0 py-4 cursor-pointer select-none list-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--vc-brand] rounded-[--radius-sm]">
        <span className="text-[--text-base] font-medium text-[--vc-text-primary] font-[--font-heading]">
          {title}
        </span>
        {/* Chevron rotates open */}
        <svg
          aria-hidden="true"
          className="w-4 h-4 text-[--vc-text-tertiary] transition-transform duration-[--duration-normal] group-open:rotate-180"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div className="pb-4 text-[--text-base] text-[--vc-text-secondary] leading-[--lh-relaxed]">
        {children}
      </div>
    </details>
  );
}

/**
 * Accordion wrapper
 */
export function Accordion({ children, className = '' }) {
  return (
    <div className={['divide-y divide-[--vc-border]', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}
