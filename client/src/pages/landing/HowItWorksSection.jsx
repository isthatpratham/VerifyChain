/**
 * HowItWorksSection.jsx
 * Storytelling step 2: How VerifyChain Works.
 * Features cursor 3D tilt micro-physics and progressive step reveal choreography.
 */
import { Check } from '@phosphor-icons/react';
import { useReveal } from '../../animations/useReveal';
import { useTilt } from '../../animations/useTilt';
import { Container } from '../../layouts/Container';

const STEPS = [
  {
    step: '01',
    title: 'Aggregated Profile Entry',
    desc: 'Enter your GSTIN and Udyam registration number once. VerifyChain maps your enterprise across all six compliance frameworks automatically.',
    highlights: ['Single input setup', 'Zero manual PDF uploads', 'Real-time schema mapping'],
  },
  {
    step: '02',
    title: 'Transparent Score Engine',
    desc: 'Our deterministic score engine computes your 0–100 Compliance Health Score (CHS) with a line-item breakdown of every rule.',
    highlights: ['Rule-based calculation', 'HIGH / MEDIUM / LOW levels', 'Named breakdown array'],
  },
  {
    step: '03',
    title: 'Shareable Supplier Card',
    desc: 'Instantly publish your zero-auth Verified Supplier Card with a scannable QR code that buyers can validate in under 30 seconds.',
    highlights: ['Public URL & QR code', 'Printable PDF export', 'Instant buyer validation'],
  },
];

function StepCard({ step }) {
  const tiltRef = useTilt({ max: 5, scale: 1.01 });

  return (
    <div
      ref={tiltRef}
      className="flex flex-col justify-between p-6 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] relative transition-shadow duration-[--duration-normal] hover:border-[--vc-border-strong] hover:shadow-[--shadow-sm]"
    >
      <div>
        {/* Step badge */}
        <div className="w-8 h-8 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base] flex items-center justify-center font-[--font-mono] text-[--text-xs] font-semibold text-[--vc-brand] mb-4">
          {step.step}
        </div>

        <h3 className="font-[--font-heading] text-[--text-lg] font-semibold text-[--vc-text-primary] mb-2">
          {step.title}
        </h3>

        <p className="text-[--text-sm] text-[--vc-text-secondary] leading-[--lh-relaxed] mb-6">
          {step.desc}
        </p>
      </div>

      {/* Highlights List */}
      <div className="pt-4 border-t border-[--vc-border] flex flex-col gap-2">
        {step.highlights.map((h) => (
          <div key={h} className="flex items-center gap-2 text-[--text-xs] text-[--vc-text-secondary]">
            <Check size={12} className="text-[--vc-brand] flex-shrink-0" />
            <span>{h}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HowItWorksSection() {
  const revealRef = useReveal();

  return (
    <section
      id="how-it-works"
      ref={revealRef}
      className="py-20 lg:py-28 border-b border-[--vc-border] bg-[--vc-bg-base]"
    >
      <Container size="xl">
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <span className="text-[--text-xs] font-semibold uppercase tracking-[--ls-caps] text-[--vc-text-brand] block mb-2">
            Architecture Workflow
          </span>
          <h2 className="font-[--font-heading] text-[--text-2xl] lg:text-[--text-3xl] font-bold text-[--vc-text-primary] tracking-[--ls-snug]">
            How VerifyChain Establishes Compliance Transparency
          </h2>
        </div>

        {/* 3 Step Process Grid with Cursor 3D Tilt */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {STEPS.map((s) => (
            <StepCard key={s.step} step={s} />
          ))}
        </div>
      </Container>
    </section>
  );
}
