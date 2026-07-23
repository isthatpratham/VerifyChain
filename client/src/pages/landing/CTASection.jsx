/**
 * CTASection.jsx
 * Final measured call-to-action section.
 */
import { Link } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';
import { useReveal } from '../../animations/useReveal';
import { Container } from '../../layouts/Container';

export function CTASection() {
  const revealRef = useReveal();

  return (
    <section
      ref={revealRef}
      className="py-20 lg:py-28 bg-[--vc-bg-base]"
    >
      <Container size="xl">
        <div className="p-10 lg:p-14 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-xl">
            <span className="text-[--text-xs] font-semibold uppercase tracking-[--ls-caps] text-[--vc-text-brand] block mb-2">
              Ready for Verification
            </span>
            <h2 className="font-[--font-heading] text-[--text-2xl] lg:text-[--text-3xl] font-bold text-[--vc-text-primary] mb-3">
              Establish Enterprise Credibility with VerifyChain
            </h2>
            <p className="text-[--text-sm] text-[--vc-text-secondary] leading-[--lh-relaxed]">
              Register your business profile today to aggregate your compliance records, calculate your Compliance Health Score, and publish your Verified Supplier Card.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 flex-shrink-0">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[--radius-sm] bg-[--vc-brand] text-white text-[--text-sm] font-medium transition-colors duration-[--duration-fast] hover:bg-[--vc-brand-hover] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--vc-brand]"
            >
              <span>Get Started Now</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center justify-center px-5 py-3 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base] text-[--vc-text-secondary] hover:text-[--vc-text-primary] hover:bg-[--vc-bg-subtle] text-[--text-sm] font-medium transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--vc-brand]"
            >
              Sign In to Account
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
