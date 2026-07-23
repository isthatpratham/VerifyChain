/**
 * Pagination.jsx
 * Page-based pagination. Accessible with aria-label, aria-current.
 */
import { CaretLeft, CaretRight } from '@phosphor-icons/react';

/**
 * @param {Object} props
 * @param {number} props.page — current page (1-indexed)
 * @param {number} props.totalPages
 * @param {Function} props.onChange — (page: number) => void
 */
export function Pagination({ page, totalPages, onChange }) {
  const canPrev = page > 1;
  const canNext = page < totalPages;

  // Build page number array with ellipsis
  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (page > 3) pages.push('...');
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  const btnBase =
    'flex items-center justify-center w-8 h-8 rounded-[--radius-sm] text-[--text-sm] ' +
    'border transition-colors duration-[--duration-fast] ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--vc-brand] ' +
    'disabled:pointer-events-none disabled:opacity-40';

  return (
    <nav aria-label="Pagination" className="flex items-center gap-1">
      <button
        aria-label="Previous page"
        disabled={!canPrev}
        onClick={() => onChange(page - 1)}
        className={`${btnBase} border-[--vc-border] text-[--vc-text-secondary] hover:bg-[--vc-bg-subtle] hover:text-[--vc-text-primary]`}
      >
        <CaretLeft size={14} />
      </button>

      {getPages().map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="w-8 text-center text-[--text-sm] text-[--vc-text-tertiary]">
            …
          </span>
        ) : (
          <button
            key={p}
            aria-label={`Page ${p}`}
            aria-current={p === page ? 'page' : undefined}
            onClick={() => onChange(p)}
            className={[
              btnBase,
              p === page
                ? 'border-[--vc-brand] bg-[--vc-brand] text-white'
                : 'border-[--vc-border] text-[--vc-text-secondary] hover:bg-[--vc-bg-subtle] hover:text-[--vc-text-primary]',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {p}
          </button>
        )
      )}

      <button
        aria-label="Next page"
        disabled={!canNext}
        onClick={() => onChange(page + 1)}
        className={`${btnBase} border-[--vc-border] text-[--vc-text-secondary] hover:bg-[--vc-bg-subtle] hover:text-[--vc-text-primary]`}
      >
        <CaretRight size={14} />
      </button>
    </nav>
  );
}
