/**
 * WhyBusinessesNeedItSection.jsx
 * Storytelling step 5: Why Businesses Need It.
 * Dual-perspective split section for MSMEs and Enterprise Buyers.
 */
import { Storefront, Buildings, Check } from '@phosphor-icons/react';
import { useReveal } from '../../animations/useReveal';
import { Container } from '../../layouts/Container';

export function WhyBusinessesNeedItSection() {
  const revealRef = useReveal();

  return (
    <section
      id="why-businesses-need-it"
      ref={revealRef}
      className="py-20 lg:py-28 border-b border-[--vc-border] bg-[--vc-surface-raised]"
    >
      <Container size="xl">
        <div className="max-w-2xl mb-16">
          <span className="text-[--text-xs] font-semibold uppercase tracking-[--ls-caps] text-[--vc-text-tertiary] block mb-2">
            Dual Stakeholder Value
          </span>
          <h2 className="font-[--font-heading] text-[--text-2xl] lg:text-[--text-3xl] font-bold text-[--vc-text-primary]">
            Designed for Both Micro-Enterprises and Enterprise Buyers
          </h2>
        </div>

        {/* Dual Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* MSME Owner Card */}
          <div className="p-8 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-bg-base] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-subtle] flex items-center justify-center text-[--vc-brand] mb-6">
                <Storefront size={22} />
              </div>
              <h3 className="font-[--font-heading] text-[--text-xl] font-semibold text-[--vc-text-primary] mb-2">
                For MSME Owners
              </h3>
              <p className="text-[--text-sm] text-[--vc-text-secondary] leading-[--lh-relaxed] mb-6">
                Eliminate compliance blindspots, avoid penalty notices, and present a verified profile to buyers that wins high-value enterprise contracts.
              </p>

              <ul className="flex flex-col gap-3 list-none p-0 m-0">
                <li className="flex items-start gap-2.5 text-[--text-sm] text-[--vc-text-primary]">
                  <Check size={16} className="text-[--vc-brand] flex-shrink-0 mt-0.5" />
                  <span>Single aggregated view across 6 government portals</span>
                </li>
                <li className="flex items-start gap-2.5 text-[--text-sm] text-[--vc-text-primary]">
                  <Check size={16} className="text-[--vc-brand] flex-shrink-0 mt-0.5" />
                  <span>Automated alerts 30, 15, and 7 days before expirations</span>
                </li>
                <li className="flex items-start gap-2.5 text-[--text-sm] text-[--vc-text-primary]">
                  <Check size={16} className="text-[--vc-brand] flex-shrink-0 mt-0.5" />
                  <span>Government scheme matcher aligned to your profile</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Buyer Card */}
          <div className="p-8 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-bg-base] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-subtle] flex items-center justify-center text-[--vc-brand] mb-6">
                <Buildings size={22} />
              </div>
              <h3 className="font-[--font-heading] text-[--text-xl] font-semibold text-[--vc-text-primary] mb-2">
                For Enterprise Procurement
              </h3>
              <p className="text-[--text-sm] text-[--vc-text-secondary] leading-[--lh-relaxed] mb-6">
                Accelerate vendor onboarding from days to seconds while eliminating legal risk from unverified or expired supplier credentials.
              </p>

              <ul className="flex flex-col gap-3 list-none p-0 m-0">
                <li className="flex items-start gap-2.5 text-[--text-sm] text-[--vc-text-primary]">
                  <Check size={16} className="text-[--vc-brand] flex-shrink-0 mt-0.5" />
                  <span>Instant 30-second verification via QR code or public URL</span>
                </li>
                <li className="flex items-start gap-2.5 text-[--text-sm] text-[--vc-text-primary]">
                  <Check size={16} className="text-[--vc-brand] flex-shrink-0 mt-0.5" />
                  <span>No login or buyer account required to validate suppliers</span>
                </li>
                <li className="flex items-start gap-2.5 text-[--text-sm] text-[--vc-text-primary]">
                  <Check size={16} className="text-[--vc-brand] flex-shrink-0 mt-0.5" />
                  <span>Standardized Compliance Health Score (0–100) benchmark</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </Container>
    </section>
  );
}
