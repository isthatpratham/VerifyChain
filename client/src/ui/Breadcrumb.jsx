/**
 * Breadcrumb.jsx
 * Page hierarchy indicator. DESIGN_SYSTEM.md: use only where hierarchy exists.
 */
import { CaretRight } from '@phosphor-icons/react';

/**
 * @param {Object} props
 * @param {{ label: string, href?: string }[]} props.items
 */
export function Breadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1 flex-wrap">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && (
                <CaretRight
                  size={12}
                  aria-hidden="true"
                  className="text-[--vc-text-tertiary] flex-shrink-0"
                />
              )}
              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={[
                    'text-[--text-sm]',
                    isLast
                      ? 'text-[--vc-text-primary] font-medium'
                      : 'text-[--vc-text-secondary]',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href}
                  className="text-[--text-sm] text-[--vc-text-secondary] hover:text-[--vc-text-brand] transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:underline"
                >
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
