/**
 * NotFound.jsx
 * Premium, professional 404 Page Not Found error page.
 * Strictly adheres to DESIGN_SYSTEM.md typography, colors, and border tokens.
 */
import { Link } from 'react-router-dom';
import { ArrowLeft, House } from '@phosphor-icons/react';
import { Container } from '../layouts/Container';

export default function NotFound() {
  return (
    <div className="py-20 lg:py-28 text-center">
      <Container size="sm">
        <div className="p-8 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] flex flex-col items-center gap-4">
          <span className="px-3 py-1 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base] text-[--text-xs] font-mono font-bold text-[--vc-text-brand]">
            ERROR 404
          </span>

          <h1 className="font-[--font-heading] text-[--text-3xl] font-bold text-[--vc-text-primary]">
            Page Not Found
          </h1>

          <p className="text-[--text-sm] text-[--vc-text-secondary] max-w-md leading-[--lh-relaxed]">
            The requested page URL does not exist or has been moved. Verify the web address or return to the platform home page.
          </p>

          <div className="flex items-center gap-3 pt-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-[--radius-sm] bg-[--vc-brand] text-white text-[--text-sm] font-medium transition-colors duration-[--duration-fast] hover:bg-[--vc-brand-hover] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--vc-brand]"
            >
              <House size={16} />
              <span>Return Home</span>
            </Link>

            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base] text-[--vc-text-secondary] text-[--text-sm] font-medium hover:text-[--vc-text-primary] hover:bg-[--vc-bg-subtle] transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--vc-brand]"
            >
              <ArrowLeft size={16} />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
}
