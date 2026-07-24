/**
 * ProblemSection.jsx
 * Storytelling step 1: The 3-Part MSME Compliance Problem.
 *
 * Grounded strictly in PRD Section 2 & 5:
 *   1. Fragmentation across authorities (GST, EPFO, ESIC, MCA, Udyam, FSSAI)
 *   2. Invisibility to buyers (PDFs on WhatsApp, manual verification delays)
 *   3. Reactive gap discovery (expired certificates causing rejected orders)
 *
 * Layout: Asymmetrical split editorial composition.
 */
import { Warning, CheckCircle } from '@phosphor-icons/react';
import { useReveal } from '../../animations/useReveal';
import { Container } from '../../layouts/Container';

const PROBLEMS = [
  {
    num: '01',
    title: 'Portal Fragmentation',
    desc: 'MSMEs must manually check six separate government portals to verify GST, EPFO, ESIC, MCA, Udyam, and FSSAI statuses.',
  },
  {
    num: '02',
    title: 'Buyer Invisibility',
    desc: 'Enterprise buyers spend 2 to 5 days manually requesting PDFs and phone-verifying supplier credentials before onboarding.',
  },
  {
    num: '03',
    title: 'Reactive Expiry Hazards',
    desc: 'Unnoticed compliance expirations result in immediate tender disqualification, vendor blacklisting, and financial penalties.',
  },
];

export function ProblemSection() {
  const revealRef = useReveal();

  return (
    <section
      id="problem"
      ref={revealRef}
      className="py-20 lg:py-28 border-b border-[--vc-border] bg-[--vc-bg-base]"
    >
      <Container size="xl">
        {/* Asymmetrical Header */}
        <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-8 lg:gap-16 mb-16 items-start">
          <div>
            <span className="text-[--text-xs] font-semibold uppercase tracking-[--ls-caps] text-[--vc-text-tertiary] block mb-2">
              The Structural Challenge
            </span>
            <h2 className="font-[--font-heading] text-[--text-2xl] lg:text-[--text-3xl] font-bold text-[--vc-text-primary]">
              The Three-Part Compliance Barrier for Indian MSMEs
            </h2>
          </div>

          <p className="text-[--text-base] text-[--vc-text-secondary] leading-[--lh-relaxed] pt-2">
            Over 63 million micro, small, and medium enterprises power India&apos;s economy, yet compliance management remains fragmented, manual, and opaque for both suppliers and buyers.
          </p>

        </div>

        {/* 3 Problem Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PROBLEMS.map((p) => (
            <div
              key={p.num}
              className="flex flex-col justify-between p-6 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] hover:border-[--vc-border-strong] transition-colors duration-[--duration-fast]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-[--font-mono] text-[--text-xs] font-semibold text-[--vc-text-tertiary]">
                    {p.num}
                  </span>
                  <Warning size={18} className="text-[--vc-warning]" />
                </div>
                <h3 className="font-[--font-heading] text-[--text-lg] font-semibold text-[--vc-text-primary] mb-2">
                  {p.title}
                </h3>
                <p className="text-[--text-sm] text-[--vc-text-secondary] leading-[--lh-relaxed]">
                  {p.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[--vc-border] flex items-center gap-2 text-[--text-xs] text-[--vc-text-tertiary]">
                <CheckCircle size={14} className="text-[--vc-brand]" />
                <span>Resolved by VerifyChain Core</span>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
