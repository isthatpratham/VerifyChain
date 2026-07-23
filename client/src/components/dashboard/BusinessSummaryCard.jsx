/**
 * BusinessSummaryCard.jsx
 * Enterprise summary card for business details and profile setup CTA.
 */
import { Link } from 'react-router-dom';
import { Buildings, CheckCircle, ArrowRight } from '@phosphor-icons/react';

export function BusinessSummaryCard({ profile, verificationStatus }) {
  if (!profile) {
    return (
      <div className="p-6 sm:p-8 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <span className="text-[--text-xs] font-semibold uppercase tracking-[--ls-caps] text-[--vc-text-brand] block mb-1">
            Setup Required
          </span>
          <h2 className="font-[--font-heading] text-[--text-xl] font-bold text-[--vc-text-primary]">
            Complete Your MSME Business Profile
          </h2>
          <p className="text-[--text-xs] text-[--vc-text-secondary] mt-1 leading-[--lh-relaxed] max-w-lg">
            Enter your GSTIN, Udyam registration, and enterprise scale details to unlock automated compliance intelligence and supplier cards.
          </p>
        </div>
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[--radius-sm] bg-[--vc-brand] text-white text-[--text-sm] font-medium transition-colors hover:bg-[--vc-brand-hover] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--vc-brand] whitespace-nowrap flex-shrink-0"
        >
          <span>Complete Profile</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] mb-8">
      {/* Business Name Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-[--vc-border] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Buildings size={20} className="text-[--vc-brand]" />
            <h2 className="font-[--font-heading] text-[--text-xl] font-bold text-[--vc-text-primary]">
              {profile.businessName}
            </h2>
          </div>
          <p className="text-[--text-xs] text-[--vc-text-secondary] mt-0.5">
            {profile.sector} • {profile.district}, {profile.state}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[--text-xs] text-[--vc-text-tertiary]">Verification Status:</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[--radius-sm] bg-[--vc-success-bg] text-[--vc-success-text] text-[11px] font-semibold border border-[--color-success-100]">
            <CheckCircle size={13} className="text-[--vc-success]" />
            <span>{verificationStatus || 'VERIFIED'}</span>
          </span>
        </div>
      </div>

      {/* Enterprise Parameters Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="p-3 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base]">
          <span className="block text-[10px] font-semibold text-[--vc-text-tertiary] uppercase tracking-wider">
            GSTIN
          </span>
          <span className="block font-mono text-[--text-xs] font-semibold text-[--vc-text-primary] mt-1">
            {profile.gstin}
          </span>
        </div>

        <div className="p-3 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base]">
          <span className="block text-[10px] font-semibold text-[--vc-text-tertiary] uppercase tracking-wider">
            Udyam Number
          </span>
          <span className="block font-mono text-[--text-xs] font-semibold text-[--vc-text-primary] mt-1">
            {profile.udyamNumber}
          </span>
        </div>

        <div className="p-3 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base]">
          <span className="block text-[10px] font-semibold text-[--vc-text-tertiary] uppercase tracking-wider">
            Business Scale
          </span>
          <span className="block text-[--text-xs] font-semibold text-[--vc-text-primary] mt-1">
            {profile.businessType}
          </span>
        </div>

        <div className="p-3 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base]">
          <span className="block text-[10px] font-semibold text-[--vc-text-tertiary] uppercase tracking-wider">
            Workforce Size
          </span>
          <span className="block text-[--text-xs] font-semibold text-[--vc-text-primary] mt-1">
            {profile.employeeCount} Employees
          </span>
        </div>
      </div>
    </div>
  );
}
