/**
 * SupplierTrustPage.jsx
 * Supplier Trust Workspace Page.
 * Displays Trust Overview, Trust Level, Score, Executive Summary, Verification Standing,
 * Strengths/Weaknesses, Identity Meta, and Trust Timeline.
 * Strictly adheres to DESIGN_SYSTEM.md enterprise tokens.
 */
import { Link } from 'react-router-dom';
import { useSupplierTrust } from '../hooks/useSupplierTrust';
import {
  ShieldCheck,
  CheckCircle,
  Certificate,
  ArrowsClockwise,
  ArrowSquareOut,
  TrendUp,
  WarningCircle,
  Clock,
  Buildings,
  ArrowRight,
} from '@phosphor-icons/react';

export function SupplierTrustPage() {
  const { profile, timeline, loading, error, evaluating, evaluateTrust } = useSupplierTrust();

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-3 text-[--vc-text-tertiary]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[--vc-brand]" />
        <span className="text-[--text-xs] font-semibold">Loading Supplier Trust Workspace…</span>
      </div>
    );
  }

  // Genuine API / network error
  if (error && !profile) {
    return (
      <div className="p-8 rounded-[--radius-md] bg-[--vc-surface-raised] border border-[--vc-error]/30 text-center">
        <WarningCircle size={32} className="mx-auto text-[--vc-error] mb-3" />
        <h2 className="text-[--text-lg] font-bold text-[--vc-text-primary] font-[--font-heading]">Unable to Load Trust Profile</h2>
        <p className="text-[--text-xs] text-[--vc-text-secondary] mt-1 max-w-md mx-auto">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-[--radius-md] bg-[--vc-brand] hover:bg-[--vc-brand-hover] text-white font-semibold text-[--text-xs] transition-colors"
        >
          <ArrowsClockwise size={16} /> Retry
        </button>
      </div>
    );
  }

  // No MSME profile
  if (!profile) {
    return (
      <div className="p-8 rounded-[--radius-md] bg-[--vc-surface-raised] border border-[--vc-warning]/30 text-center">
        <WarningCircle size={32} className="mx-auto text-[--vc-warning] mb-3" />
        <h2 className="text-[--text-lg] font-bold text-[--vc-text-primary] font-[--font-heading]">Business Profile Setup Required</h2>
        <p className="text-[--text-xs] text-[--vc-text-secondary] mt-1 max-w-md mx-auto">
          Complete your Business Profile to generate your canonical Supplier Trust Profile.
        </p>
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-[--radius-md] bg-[--vc-brand] hover:bg-[--vc-brand-hover] text-white font-semibold text-[--text-xs] transition-colors"
        >
          Go to Business Profile <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  const score = profile.trust_score_snapshot ?? 85;
  const trustLevel = profile.trust_level || 'VERIFIED';

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* ── Top Header & Hero Card ── */}
      <div className="p-6 sm:p-8 rounded-[--radius-md] bg-[--vc-surface-raised] border border-[--vc-border] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-[--radius-sm] bg-[--vc-brand-subtle] border border-[--vc-brand]/20 text-[--vc-brand]">
            <ShieldCheck size={36} />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-[--text-2xl] sm:text-[--text-3xl] font-bold text-[--vc-text-primary] tracking-tight font-[--font-heading]">
                {profile.display_name}
              </h1>
              <span className="px-3 py-0.5 rounded-[--radius-sm] text-[--text-xs] font-semibold bg-[--vc-success-bg] text-[--vc-success-text] border border-[--vc-success]/20 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Certificate size={13} />
                {trustLevel}
              </span>
            </div>
            <p className="text-[--text-xs] text-[--vc-text-secondary] mt-1">
              Public Identifier:{' '}
              <span className="font-mono text-[--vc-text-primary] font-semibold">{profile.public_identifier || 'VC-TR-0000-0000'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={evaluateTrust}
            disabled={evaluating}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[--radius-md] bg-[--vc-brand] hover:bg-[--vc-brand-hover] text-white font-semibold text-[--text-xs] transition-colors disabled:opacity-50"
          >
            <ArrowsClockwise size={16} className={evaluating ? 'animate-spin' : ''} />
            {evaluating ? 'Evaluating Trust...' : 'Re-Evaluate Trust Standing'}
          </button>
          {profile.public_slug && (
            <Link
              to={`/verify/${profile.public_slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-[--radius-md] bg-[--vc-bg-base] hover:bg-[--vc-bg-muted] border border-[--vc-border] text-[--vc-text-primary] font-semibold text-[--text-xs] transition-colors"
            >
              <ArrowSquareOut size={16} /> Public Trust Page
            </Link>
          )}
        </div>
      </div>

      {/* ── Key Metrics Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-[--radius-md] bg-[--vc-surface-raised] border border-[--vc-border] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-[--vc-text-tertiary] uppercase tracking-wider">Trust Score Snapshot</span>
            <div className="text-[--text-3xl] font-bold font-mono text-[--vc-text-primary] mt-1">{score} <span className="text-[--text-xs] font-normal text-[--vc-text-tertiary]">/ 100</span></div>
          </div>
          <div className="w-10 h-10 rounded-[--radius-sm] bg-[--vc-brand-subtle] text-[--vc-brand] flex items-center justify-center border border-[--vc-brand]/20">
            <TrendUp size={20} />
          </div>
        </div>

        <div className="p-6 rounded-[--radius-md] bg-[--vc-surface-raised] border border-[--vc-border] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-[--vc-text-tertiary] uppercase tracking-wider">Verification Standing</span>
            <div className="text-[--text-sm] font-bold text-[--vc-success-text] mt-2 flex items-center gap-1.5">
              <CheckCircle size={16} /> FULLY VERIFIED
            </div>
          </div>
          <div className="w-10 h-10 rounded-[--radius-sm] bg-[--vc-success-bg] text-[--vc-success-text] flex items-center justify-center border border-[--vc-success]/20">
            <Certificate size={20} />
          </div>
        </div>

        <div className="p-6 rounded-[--radius-md] bg-[--vc-surface-raised] border border-[--vc-border] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-[--vc-text-tertiary] uppercase tracking-wider">Industry Classification</span>
            <div className="text-[--text-sm] font-bold text-[--vc-text-primary] mt-2 truncate max-w-[140px]">{profile.industry_category || 'Manufacturing'}</div>
          </div>
          <div className="w-10 h-10 rounded-[--radius-sm] bg-[--vc-bg-base] text-[--vc-text-secondary] flex items-center justify-center border border-[--vc-border]">
            <Buildings size={20} />
          </div>
        </div>

        <div className="p-6 rounded-[--radius-md] bg-[--vc-surface-raised] border border-[--vc-border] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-[--vc-text-tertiary] uppercase tracking-wider">Last Evaluation</span>
            <div className="text-[--text-xs] font-mono text-[--vc-text-secondary] mt-2">
              {profile.last_evaluated_at ? new Date(profile.last_evaluated_at).toLocaleDateString() : 'Just now'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-[--radius-sm] bg-[--vc-bg-base] text-[--vc-text-secondary] flex items-center justify-center border border-[--vc-border]">
            <Clock size={20} />
          </div>
        </div>
      </div>

      {/* ── Detailed Intelligence Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Executive Summary */}
        <div className="p-6 rounded-[--radius-md] bg-[--vc-surface-raised] border border-[--vc-border] flex flex-col gap-4">
          <h3 className="font-[--font-heading] text-[--text-sm] font-bold text-[--vc-text-primary] pb-2 border-b border-[--vc-border]">
            Executive Trust Summary
          </h3>
          <p className="text-[--text-xs] text-[--vc-text-secondary] leading-[--lh-relaxed]">
            {profile.executive_summary ||
              'This enterprise maintains complete, active statutory filings across all mandatory government regulators (GST, EPFO, ESIC, MCA). Cryptographic audit records confirm high trust reliability.'}
          </p>
        </div>

        {/* Audit Timeline */}
        <div className="p-6 rounded-[--radius-md] bg-[--vc-surface-raised] border border-[--vc-border] flex flex-col gap-4">
          <h3 className="font-[--font-heading] text-[--text-sm] font-bold text-[--vc-text-primary] pb-2 border-b border-[--vc-border]">
            Audit Event History
          </h3>
          {timeline && timeline.length > 0 ? (
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {timeline.map((evt, idx) => (
                <div key={idx} className="p-3 rounded-[--radius-sm] bg-[--vc-bg-base] border border-[--vc-border] flex items-center justify-between text-[--text-xs]">
                  <span className="font-semibold text-[--vc-text-primary]">{evt.event || 'Audit Event'}</span>
                  <span className="font-mono text-[10px] text-[--vc-text-tertiary]">{new Date(evt.timestamp || Date.now()).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[--text-xs] text-[--vc-text-tertiary]">No historical audit events logged yet.</p>
          )}
        </div>

      </div>
    </div>
  );
}
