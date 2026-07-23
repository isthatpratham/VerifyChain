/**
 * HeroSection.jsx
 * Landing page Hero section.
 *
 * Requirements:
 *   - Small introduction overline
 *   - Medium-sized headline (no oversized SaaS hero font)
 *   - Factual supporting paragraph from PRD
 *   - Measured CTAs (primary + secondary)
 *   - Interactive 3D Trust Vault object
 *   - Parallax scrolling background depth
 *   - Scroll cue indicator
 */
import { Link } from 'react-router-dom';
import { CaretDown, ArrowRight, ShieldCheck } from '@phosphor-icons/react';
import { ThreeDTrustVault } from './ThreeDTrustVault';
import { useParallax } from '../../animations/useParallax';
import { useReveal } from '../../animations/useReveal';
import { Container } from '../../layouts/Container';

export function HeroSection() {
  const parallaxRef = useParallax(0.12);
  const revealRef = useReveal({ threshold: 0.1 });

  return (
    <section
      ref={revealRef}
      className="relative pt-12 pb-20 lg:pt-16 lg:pb-28 overflow-hidden border-b border-[--vc-border]"
    >
      {/* Parallax background grid depth layer */}
      <div
        ref={parallaxRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#003153_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"
      />

      <Container size="xl" className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-[11fr_10fr] gap-12 lg:gap-16 items-center">

          {/* Left Column — Text & CTAs */}
          <div className="flex flex-col items-start gap-5 max-w-xl">

            {/* Overline Badge */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-surface-raised] text-[--text-xs] font-semibold uppercase tracking-[--ls-caps] text-[--vc-text-brand]">
              <ShieldCheck size={14} weight="fill" className="text-[--vc-brand]" />
              <span>Free MSME Compliance Intelligence</span>
            </div>

            {/* Headline — Medium-sized, Plus Jakarta Sans */}
            <h1 className="font-[--font-heading] text-[--text-3xl] sm:text-[--text-4xl] font-bold text-[--vc-text-primary] tracking-[--ls-snug] leading-[--lh-tight]">
              India&apos;s Single Source of Truth for MSME Compliance &amp; Credibility
            </h1>


            {/* Paragraph — Concise factual copy from PRD */}
            <p className="text-[--text-base] text-[--vc-text-secondary] leading-[--lh-relaxed]">
              VerifyChain unifies compliance status across GST, EPFO, ESIC, MCA,
              Udyam, and FSSAI into a real-time Compliance Health Score and a
              shareable Verified Supplier Card for enterprise buyers.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[--radius-sm] bg-[--vc-brand] text-white text-[--text-sm] font-medium transition-colors duration-[--duration-fast] hover:bg-[--vc-brand-hover] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--vc-brand]"
              >
                <span>Verify Your Business</span>
                <ArrowRight size={15} />
              </Link>

              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base] text-[--vc-text-secondary] hover:text-[--vc-text-primary] hover:bg-[--vc-bg-subtle] text-[--text-sm] font-medium transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--vc-brand]"
              >
                How It Works
              </a>
            </div>

            {/* Micro proof bar */}
            <div className="pt-4 border-t border-[--vc-border] w-full flex items-center gap-6 text-[--text-xs] text-[--vc-text-tertiary]">
              <span>✓ 6 Authorities Covered</span>
              <span>✓ 0–100 CHS Engine</span>
              <span>✓ Public QR Verification</span>
            </div>
          </div>

          {/* Right Column — Interactive 3D Object */}
          <div className="flex justify-center items-center">
            <ThreeDTrustVault />
          </div>
        </div>

        {/* Scroll Cue */}
        <div className="mt-16 flex justify-center">
          <a
            href="#problem"
            aria-label="Scroll to problem statement"
            className="flex flex-col items-center gap-1 text-[--text-xs] text-[--vc-text-tertiary] hover:text-[--vc-text-primary] transition-colors duration-[--duration-fast]"
          >
            <span>Scroll to explore</span>
            <CaretDown size={14} className="animate-bounce" />
          </a>
        </div>
      </Container>
    </section>
  );
}
