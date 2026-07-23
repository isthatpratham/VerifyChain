/**
 * SolutionsPage.jsx
 * Practical workflows for MSME Owners, Enterprise Procurement, and Compliance Auditors.
 */
import { Storefront, Buildings, MagnifyingGlass } from '@phosphor-icons/react';

import { useReveal } from '../animations/useReveal';
import { Container } from '../layouts/Container';


const SOLUTIONS = [
  {
    role: 'Micro & Small Enterprise Owners',
    icon: Storefront,
    subtitle: 'Consolidate Regulatory Obligations & Win Contracts',
    challenge: 'MSME owners spend substantial time and legal fees tracking filings across separate GST, EPFO, ESIC, MCA, Udyam, and FSSAI portals, leading to missed deadlines and lost contracts.',
    workflow: [
      'Enter GSTIN and Udyam credentials once',
      'View single aggregated Compliance Health Score (0–100)',
      'Receive automated alert notifications 30, 15, and 7 days prior to expiry',
      'Share live QR-linked Verified Supplier Card with buyers',
    ],
  },
  {
    role: 'Enterprise Procurement Teams',
    icon: Buildings,
    subtitle: 'Accelerate Supplier Onboarding from Days to Seconds',
    challenge: 'Procurement officers evaluate dozens of suppliers per quarter, manually requesting PDF certificates over WhatsApp/email with no reliable way to verify authenticity or current standing.',
    workflow: [
      'Scan supplier QR code or click public verification URL',
      'View live compliance status across all 6 regulatory authorities in 30 seconds',
      'Inspect standardized Compliance Health Score (CHS) benchmark',
      'Download printable verification certificate for audit trail',
    ],
  },
  {
    role: 'Compliance Auditors & Risk Officers',
    icon: MagnifyingGlass,
    subtitle: 'Deterministic Audit Trail & Zero-Bias Risk Scoring',

    challenge: 'Risk teams lack standardized benchmarks to audit supply chain compliance health, exposing enterprise buyers to legal and operational liabilities.',
    workflow: [
      'Access transparent line-item rule breakdowns for every computed score',
      'Audit fresh live data computed on-demand without statistical modeling bias',
      'Verify enterprise registration data across state jurisdictions',
      'Maintain verifiable PDF records for compliance audits',
    ],
  },
];

export function SolutionsPage() {
  const revealRef = useReveal();

  return (
    <div ref={revealRef} className="py-12 lg:py-16">
      <Container size="xl">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <span className="text-[--text-xs] font-semibold uppercase tracking-[--ls-caps] text-[--vc-text-brand] block mb-2">
            Use Cases & Solutions
          </span>
          <h1 className="font-[--font-heading] text-[--text-3xl] lg:text-[--text-4xl] font-bold text-[--vc-text-primary] mb-4">
            Workflows Tailored to Your Supply Chain Role
          </h1>
          <p className="text-[--text-base] text-[--vc-text-secondary] leading-[--lh-relaxed]">
            Explore how VerifyChain simplifies compliance management for suppliers, enterprise buyers, and risk auditors.
          </p>
        </div>

        {/* Solutions Grid */}
        <div className="flex flex-col gap-8">
          {SOLUTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.role}
                className="p-8 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 items-start"
              >
                <div>
                  <div className="w-10 h-10 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base] flex items-center justify-center text-[--vc-brand] mb-4">
                    <Icon size={22} />
                  </div>
                  <h2 className="font-[--font-heading] text-[--text-xl] font-semibold text-[--vc-text-primary] mb-1">
                    {s.role}
                  </h2>
                  <p className="text-[--text-xs] font-medium text-[--vc-text-brand] mb-4">
                    {s.subtitle}
                  </p>
                  <p className="text-[--text-xs] text-[--vc-text-secondary] leading-[--lh-relaxed]">
                    {s.challenge}
                  </p>
                </div>

                <div className="p-6 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base]">
                  <h4 className="text-[--text-xs] font-semibold uppercase tracking-[--ls-caps] text-[--vc-text-tertiary] mb-3">
                    Standard Workflow
                  </h4>
                  <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
                    {s.workflow.map((step, idx) => (
                      <li key={step} className="flex items-start gap-2.5 text-[--text-xs] text-[--vc-text-primary]">
                        <span className="w-4 h-4 rounded-full bg-[--vc-bg-subtle] border border-[--vc-border] flex items-center justify-center text-[10px] font-mono font-semibold text-[--vc-brand] flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-[--lh-normal]">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
