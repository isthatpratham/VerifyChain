/**
 * HowItWorksPage.jsx
 * Step-by-step interactive workflow of the VerifyChain system architecture.
 */
import { useState } from 'react';
import { ShieldCheck, UserPlus, FileText, Cpu, QrCode, Bell } from '@phosphor-icons/react';

import { useReveal } from '../animations/useReveal';
import { Container } from '../layouts/Container';

const PIPELINE_STEPS = [
  {
    id: 'step-1',
    number: '01',
    icon: UserPlus,
    title: 'Account Registration',
    summary: 'Create an account using email, GSTIN, and Udyam credentials.',
    details: 'The platform initializes your encrypted account and links your enterprise identifiers. No complex corporate verification paperwork required.',
  },
  {
    id: 'step-2',
    number: '02',
    icon: FileText,
    title: 'Business Profile Completion',

    summary: 'Define enterprise scale, state jurisdiction, employee count, and sector classification.',
    details: 'Profile metadata establishes jurisdictional rules for FSSAI exemption, ESIC applicability, and eligible government schemes.',
  },
  {
    id: 'step-3',
    number: '03',
    icon: Cpu,
    title: 'Regulatory Data Aggregation',
    summary: 'VerifyChain maps status across GST, EPFO, ESIC, MCA, Udyam, and FSSAI.',
    details: 'Compliance records are fetched across all six regulatory authorities to consolidate active filing statuses, return histories, and expiration dates.',
  },
  {
    id: 'step-4',
    number: '04',
    icon: ShieldCheck,
    title: 'Compliance Health Score Computation',
    summary: 'The score engine computes a 0–100 Compliance Health Score (CHS).',
    details: 'Rules assign points (GST: 25, EPFO: 20, ESIC: 15, MCA: 15, Udyam: 15, FSSAI: 10) to determine HIGH (75+), MEDIUM (40–74), or LOW (0–39) compliance standing.',
  },
  {
    id: 'step-5',
    number: '05',
    icon: QrCode,
    title: 'Verified Supplier Card Generation',
    summary: 'A public QR-linked verification card is published instantly.',
    details: 'Enterprise buyers can scan your QR code or open your public URL to validate compliance status in under 30 seconds with zero authentication.',
  },
  {
    id: 'step-6',
    number: '06',
    icon: Bell,
    title: 'Ongoing Proactive Monitoring',
    summary: 'Automated notification engine alerts you prior to expirations.',
    details: 'Background timers monitor compliance record expiration dates and deliver alert notifications 30, 15, and 7 days before filing deadlines.',
  },
];

export function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState(0);
  const revealRef = useReveal();

  const current = PIPELINE_STEPS[activeStep];
  const Icon = current.icon;

  return (
    <div ref={revealRef} className="py-12 lg:py-16">
      <Container size="xl">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <span className="text-[--text-xs] font-semibold uppercase tracking-[--ls-caps] text-[--vc-text-brand] block mb-2">
            System Architecture
          </span>
          <h1 className="font-[--font-heading] text-[--text-3xl] lg:text-[--text-4xl] font-bold text-[--vc-text-primary] mb-4">
            How VerifyChain Processes Compliance Intelligence
          </h1>
          <p className="text-[--text-base] text-[--vc-text-secondary] leading-[--lh-relaxed]">
            Follow the six-stage architecture pipeline from initial registration to continuous compliance monitoring.
          </p>
        </div>

        {/* Interactive Step Navigator */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 items-start mb-16">

          {/* Step Selector List */}
          <div className="flex flex-col gap-2">
            {PIPELINE_STEPS.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={[
                  'flex items-center gap-3 p-3.5 rounded-[--radius-sm] border text-left text-[--text-sm] font-medium transition-colors duration-[--duration-fast]',
                  idx === activeStep
                    ? 'border-[--vc-brand] bg-[--vc-surface-raised] text-[--vc-brand]'
                    : 'border-[--vc-border] bg-[--vc-bg-base] text-[--vc-text-secondary] hover:text-[--vc-text-primary] hover:bg-[--vc-bg-subtle]',
                ].join(' ')}
              >
                <span className="font-[--font-mono] text-[--text-xs] font-semibold text-[--vc-text-tertiary]">
                  {s.number}
                </span>
                <span>{s.title}</span>
              </button>
            ))}
          </div>

          {/* Step Detail Display */}
          <div className="p-8 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised]">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[--vc-border]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base] flex items-center justify-center text-[--vc-brand]">
                  <Icon size={22} />
                </div>
                <div>
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[--vc-text-tertiary] block">
                    Stage {current.number} of 06
                  </span>
                  <h3 className="font-[--font-heading] text-[--text-xl] font-bold text-[--vc-text-primary]">
                    {current.title}
                  </h3>
                </div>
              </div>
            </div>

            <p className="text-[--text-base] font-medium text-[--vc-text-primary] mb-4">
              {current.summary}
            </p>

            <p className="text-[--text-sm] text-[--vc-text-secondary] leading-[--lh-relaxed]">
              {current.details}
            </p>
          </div>

        </div>
      </Container>
    </div>
  );
}
