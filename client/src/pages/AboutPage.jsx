/**
 * AboutPage.jsx
 * Factual vision, mission, and guiding principles grounded in PRD.md.
 */
import { Target, Eye, Compass } from '@phosphor-icons/react';
import { useReveal } from '../animations/useReveal';
import { Container } from '../layouts/Container';


const PRINCIPLES = [
  {
    title: 'Deterministic Transparency',
    desc: 'Scores and breakdowns are computed via strict weighted rules with zero black-box statistical estimation.',
  },
  {
    title: 'Zero-Auth Accessibility',
    desc: 'Enterprise buyers validate supplier credentials instantly without paywalls or mandatory account creation.',
  },
  {
    title: 'Proactive Alerting',
    desc: 'Automated notification pipelines alert business owners 30, 15, and 7 days prior to compliance expirations.',
  },
  {
    title: 'Free & Citizen-Accessible',
    desc: 'Designed as open infrastructure to empower micro and small enterprises across India at zero cost.',
  },
];

export function AboutPage() {
  const revealRef = useReveal();

  return (
    <div ref={revealRef} className="py-12 lg:py-16">
      <Container size="xl">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <span className="text-[--text-xs] font-semibold uppercase tracking-[--ls-caps] text-[--vc-text-brand] block mb-2">
            About VerifyChain
          </span>
          <h1 className="font-[--font-heading] text-[--text-3xl] lg:text-[--text-4xl] font-bold text-[--vc-text-primary] mb-4">
            Building Infrastructure for Business Trust
          </h1>
          <p className="text-[--text-base] text-[--vc-text-secondary] leading-[--lh-relaxed]">
            VerifyChain is an enterprise compliance intelligence platform providing micro-enterprises with unified compliance tracking and enterprise buyers with instant supplier verification.
          </p>
        </div>

        {/* Vision & Mission Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="p-8 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised]">
            <div className="w-10 h-10 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base] flex items-center justify-center text-[--vc-brand] mb-4">
              <Eye size={22} />
            </div>
            <h2 className="font-[--font-heading] text-[--text-xl] font-semibold text-[--vc-text-primary] mb-3">
              Platform Vision
            </h2>
            <p className="text-[--text-sm] text-[--vc-text-secondary] leading-[--lh-relaxed]">
              To become India&apos;s primary citizen-accessible MSME compliance intelligence platform—giving every micro-enterprise a single source of truth for its compliance health, and giving every buyer instant verification of supplier credibility.
            </p>
          </div>

          <div className="p-8 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised]">
            <div className="w-10 h-10 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base] flex items-center justify-center text-[--vc-brand] mb-4">
              <Target size={22} />
            </div>
            <h2 className="font-[--font-heading] text-[--text-xl] font-semibold text-[--vc-text-primary] mb-3">
              Platform Mission
            </h2>
            <p className="text-[--text-sm] text-[--vc-text-secondary] leading-[--lh-relaxed]">
              VerifyChain exists to eliminate portal fragmentation, buyer invisibility, and reactive compliance expirations through unified tracking, verified public cards, and proactive notification engines.
            </p>
          </div>
        </div>

        {/* Guiding Principles */}
        <div className="p-8 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-bg-base]">
          <div className="flex items-center gap-2 mb-6">
            <Compass size={20} className="text-[--vc-brand]" />
            <h2 className="font-[--font-heading] text-[--text-xl] font-bold text-[--vc-text-primary]">
              Guiding Engineering Principles
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="p-4 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-surface-raised]">
                <h4 className="text-[--text-sm] font-semibold text-[--vc-text-primary] mb-2">
                  {p.title}
                </h4>
                <p className="text-[--text-xs] text-[--vc-text-secondary] leading-[--lh-relaxed]">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
