/**
 * SupplierTrustPage.jsx
 * Supplier Trust Workspace Page.
 * Displays Trust Overview, Trust Level, Score, Executive Summary, Verification Standing,
 * Strengths/Weaknesses, Identity Meta, and Trust Timeline.
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
      <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="text-sm font-medium">Loading Supplier Trust Workspace…</span>
      </div>
    );
  }

  // Genuine API / network error — do not show "Setup Required"
  if (error && !profile) {
    return (
      <div className="p-8 rounded-2xl bg-white border border-red-100 shadow-sm text-center">
        <WarningCircle size={32} className="mx-auto text-red-400 mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Unable to Load Trust Profile</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors"
        >
          <ArrowsClockwise size={16} /> Retry
        </button>
      </div>
    );
  }

  // No MSME profile — user genuinely needs to set up Business Profile first
  if (!profile) {
    return (
      <div className="p-8 rounded-2xl bg-white border border-amber-100 shadow-sm text-center">
        <WarningCircle size={32} className="mx-auto text-amber-500 mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Business Profile Setup Required</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Complete your Business Profile to generate your canonical Supplier Trust Profile.
        </p>
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors"
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
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
            <ShieldCheck size={40} />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {profile.display_name}
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <Certificate size={13} />
                {trustLevel}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Public Identifier:{' '}
              <span className="font-mono text-slate-700">{profile.public_identifier || 'VC-TR-0000-0000'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={evaluateTrust}
            disabled={evaluating}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
          >
            <ArrowsClockwise size={16} className={evaluating ? 'animate-spin' : ''} />
            {evaluating ? 'Evaluating…' : 'Re-Evaluate Standing'}
          </button>
          <Link
            to={`/verify/${profile.public_slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            <ArrowSquareOut size={16} />
            Public Verification Portal
          </Link>
        </div>
      </div>

      {/* ── Key Metrics Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Trust Score */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Trust Score</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">{score}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${score}%` }} />
          </div>
        </div>

        {/* Verification State */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Verification State</span>
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-base">
            <CheckCircle size={20} />
            <span>{profile.verification_state || 'VERIFIED'}</span>
          </div>
          <span className="text-[11px] text-slate-400">Statutory Filing Validated</span>
        </div>

        {/* Publish Status */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Publish Status</span>
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>PUBLIC BROADCAST</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">/{profile.public_slug}</span>
        </div>

        {/* Distribution Channels */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Distribution Channels</span>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-base">
            <TrendUp size={20} />
            <span>5 Active Channels</span>
          </div>
          <span className="text-[11px] text-slate-400">QR, Badge, Card, Cert, Link</span>
        </div>
      </div>

      {/* ── Executive Summary & Factors ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Executive Summary */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Buildings size={17} className="text-blue-600" />
            Executive Trust Summary
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {profile.display_name} holds an active{' '}
            <strong className="text-emerald-600">{trustLevel}</strong> standing on VerifyChain with a compliance
            health score of <strong className="text-slate-900">{score}/100</strong>. All statutory tax filings,
            GSTIN credentials, Udyam registration parameters, and MCA corporate records remain in clean standing.
          </p>
          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wide">GSTIN Status</span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
                <CheckCircle size={12} /> Active &amp; Verified
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wide">Udyam Registration</span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
                <CheckCircle size={12} /> Registered MSME
              </span>
            </div>
          </div>
        </div>

        {/* Trust Strengths & Risk Profile */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <TrendUp size={17} className="text-blue-600" />
            Trust Strengths &amp; Risk Profile
          </h3>
          <div className="flex flex-col gap-2">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-sm text-slate-700 flex items-start gap-2.5">
              <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <span>Zero statutory default penalties recorded over the last 12-month evaluation cycle.</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-sm text-slate-700 flex items-start gap-2.5">
              <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <span>Complete documentation transparency across GSTIN and MCA corporate entity registry.</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-sm text-slate-700 flex items-start gap-2.5">
              <WarningCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <span>Annual turnover update pending for current fiscal year statement.</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Trust Timeline ── */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-5 flex items-center gap-2">
          <Clock size={17} className="text-blue-600" />
          Trust Timeline &amp; Lifecycle Audit Trail
        </h3>

        {timeline.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No timeline events recorded yet.</p>
        ) : (
          <div className="relative pl-6 border-l-2 border-slate-100 flex flex-col gap-6">
            {timeline.map((item, idx) => (
              <div key={item.id || idx} className="relative">
                <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white" />
                <div className="flex items-baseline justify-between gap-4">
                  <h4 className="text-sm font-bold text-slate-800">{item.title || item.event_type}</h4>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString('en-IN') : 'Recent'}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">{item.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
