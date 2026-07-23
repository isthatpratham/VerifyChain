/**
 * VerificationProcessSection.jsx
 * Demonstrates the Verified Supplier Card & zero-auth QR verification flow.
 */
import { QrCode, ShieldCheck, FileText, ShareNetwork } from '@phosphor-icons/react';
import { useReveal } from '../../animations/useReveal';
import { Container } from '../../layouts/Container';


export function VerificationProcessSection() {
  const revealRef = useReveal();

  return (
    <section
      id="verification-process"
      ref={revealRef}
      className="py-20 lg:py-28 border-b border-[--vc-border] bg-[--vc-bg-base]"
    >
      <Container size="xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12 lg:gap-16 items-center">

          {/* Left Column — Supplier Card Mockup */}
          <div className="p-6 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] shadow-xs max-w-md mx-auto lg:mx-0 w-full">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[--vc-border]">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-[--vc-brand]" />
                <span className="font-[--font-heading] text-[--text-sm] font-semibold text-[--vc-text-primary]">
                  Verified Supplier Profile
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-[--radius-sm] bg-[--vc-success-bg] text-[--vc-success-text] text-[11px] font-semibold">
                HIGH COMPLIANCE
              </span>
            </div>

            {/* Business Info */}
            <div className="mb-4">
              <h4 className="font-[--font-heading] text-[--text-md] font-semibold text-[--vc-text-primary]">
                Precision Micro Tech Private Limited
              </h4>
              <p className="text-[--text-xs] font-mono text-[--vc-text-tertiary] mt-0.5">
                GSTIN: 27AAACP1234H1Z5 • Udyam: UDYAM-MH-12-004321
              </p>
            </div>

            {/* Score pill */}
            <div className="p-3 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base] flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] text-[--vc-text-tertiary] uppercase tracking-wider block">
                  Compliance Health Score
                </span>
                <span className="font-[--font-heading] text-[--text-xl] font-bold text-[--vc-text-primary]">
                  88 / 100
                </span>
              </div>
              <span className="text-[--text-xs] font-medium text-[--vc-success]">
                ✓ Buyer Onboarding Ready
              </span>
            </div>

            {/* Status matrix */}
            <div className="grid grid-cols-2 gap-2 text-[11px] mb-4">
              <div className="p-2 rounded-[--radius-sm] bg-[--vc-bg-base] border border-[--vc-border] flex items-center justify-between">
                <span>GST Return</span>
                <span className="font-semibold text-[--vc-success]">Active</span>
              </div>
              <div className="p-2 rounded-[--radius-sm] bg-[--vc-bg-base] border border-[--vc-border] flex items-center justify-between">
                <span>EPFO Return</span>
                <span className="font-semibold text-[--vc-success]">Compliant</span>
              </div>
              <div className="p-2 rounded-[--radius-sm] bg-[--vc-bg-base] border border-[--vc-border] flex items-center justify-between">
                <span>ESIC Status</span>
                <span className="font-semibold text-[--vc-success]">Compliant</span>
              </div>
              <div className="p-2 rounded-[--radius-sm] bg-[--vc-bg-base] border border-[--vc-border] flex items-center justify-between">
                <span>MCA Return</span>
                <span className="font-semibold text-[--vc-success]">Filed</span>
              </div>
            </div>

            {/* Footer action */}
            <div className="pt-3 border-t border-[--vc-border] flex items-center justify-between text-[11px] text-[--vc-text-tertiary]">
              <span>Verified on VerifyChain Public Registry</span>
              <QrCode size={18} className="text-[--vc-text-primary]" />
            </div>
          </div>

          {/* Right Column — Explanation */}
          <div>
            <span className="text-[--text-xs] font-semibold uppercase tracking-[--ls-caps] text-[--vc-text-tertiary] block mb-2">
              Instant Buyer Verification
            </span>
            <h2 className="font-[--font-heading] text-[--text-2xl] lg:text-[--text-3xl] font-bold text-[--vc-text-primary] mb-4">
              Zero-Auth Public Verification for Enterprise Procurement
            </h2>
            <p className="text-[--text-base] text-[--vc-text-secondary] leading-[--lh-relaxed] mb-6">
              Buyers do not need to register, log in, or wait for document emails. They scan your QR code or open your public profile link to view verified regulatory compliance in under 30 seconds.
            </p>

            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-[--radius-sm] bg-[--vc-bg-subtle] border border-[--vc-border] text-[--vc-brand]">
                  <ShareNetwork size={18} />
                </div>
                <div>
                  <h4 className="text-[--text-sm] font-semibold text-[--vc-text-primary]">
                    Shareable QR Code & URL
                  </h4>
                  <p className="text-[--text-xs] text-[--vc-text-secondary] leading-[--lh-relaxed]">
                    Embed on tender submissions, quotation emails, or physical business cards.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-[--radius-sm] bg-[--vc-bg-subtle] border border-[--vc-border] text-[--vc-brand]">
                  <FileText size={18} />
                </div>
                <div>
                  <h4 className="text-[--text-sm] font-semibold text-[--vc-text-primary]">
                    Printable PDF Export
                  </h4>
                  <p className="text-[--text-xs] text-[--vc-text-secondary] leading-[--lh-relaxed]">
                    Generate clean, standard-formatted compliance certificates for tender submissions.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </Container>
    </section>
  );
}
