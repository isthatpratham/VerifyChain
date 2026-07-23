/**
 * AuthRightPanel.jsx
 * Enterprise product preview panel for split-screen authentication.
 *
 * Showcases:
 *   - Compliance Health Score (CHS 88/100 HIGH) live card mockup
 *   - 6 Authority Compliance Badges (GST, EPFO, ESIC, MCA, Udyam, FSSAI)
 *   - Enterprise Trust & Security guarantees
 *
 * DESIGN_SYSTEM.md: Prussian Blue accent, max 4px radius, crisp typography.
 */
import { ShieldCheck, CheckCircle, Lock, QrCode } from '@phosphor-icons/react';

export function AuthRightPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between p-10 lg:p-12 bg-[--vc-surface-raised] border-l border-[--vc-border] relative overflow-hidden select-none">
      {/* Background dot matrix depth */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(#003153_1px,transparent_1px)] [background-size:20px_20px]"
      />

      {/* Top Header */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base] text-[11px] font-semibold uppercase tracking-[--ls-caps] text-[--vc-brand] mb-4">
          <ShieldCheck size={14} className="text-[--vc-brand]" />
          <span>Enterprise Compliance Platform</span>
        </div>
        <h2 className="font-[--font-heading] text-[--text-2xl] font-bold text-[--vc-text-primary] tracking-[--ls-snug]">
          Continuous Compliance Intelligence & Verification
        </h2>
        <p className="text-[--text-xs] text-[--vc-text-secondary] mt-2 leading-[--lh-relaxed] max-w-md">
          VerifyChain unifies regulatory compliance data into a single deterministic score and shareable verified profile for enterprise buyers.
        </p>
      </div>

      {/* Middle Mockup Card */}
      <div className="relative z-10 p-5 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-bg-base] shadow-xs my-8">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[--vc-border]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[--vc-success] animate-pulse" />
            <span className="font-[--font-heading] text-[--text-xs] font-semibold text-[--vc-text-primary]">
              Live Compliance Health Engine
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-[--radius-sm] bg-[--vc-success-bg] text-[--vc-success-text] text-[10px] font-semibold">
            HIGH COMPLIANCE
          </span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] text-[--vc-text-tertiary] uppercase tracking-wider block">
              Compliance Health Score (CHS)
            </span>
            <span className="font-[--font-heading] text-[--text-2xl] font-bold text-[--vc-text-primary]">
              88 <span className="text-[--text-xs] font-normal text-[--vc-text-tertiary]">/ 100</span>
            </span>
          </div>
          <QrCode size={28} className="text-[--vc-text-primary]" />
        </div>

        <div className="grid grid-cols-3 gap-1.5 text-[10px]">
          {['GST 25/25', 'EPFO 20/20', 'ESIC 15/15', 'MCA 15/15', 'Udyam 15/15', 'FSSAI 10/10'].map((item) => (
            <div key={item} className="p-1.5 rounded-[--radius-sm] bg-[--vc-bg-subtle] border border-[--vc-border] text-center font-medium text-[--vc-text-primary]">
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Security Guarantees */}
      <div className="relative z-10 pt-4 border-t border-[--vc-border] flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[--text-xs] text-[--vc-text-secondary]">
          <CheckCircle size={14} className="text-[--vc-brand] flex-shrink-0" />
          <span>Deterministic rule-based scoring engine</span>
        </div>
        <div className="flex items-center gap-2 text-[--text-xs] text-[--vc-text-secondary]">
          <Lock size={14} className="text-[--vc-brand] flex-shrink-0" />
          <span>Encrypted document metadata storage</span>
        </div>
      </div>
    </div>
  );
}
