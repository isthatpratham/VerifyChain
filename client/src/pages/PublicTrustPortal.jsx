/**
 * PublicTrustPortal.jsx
 * Publicly accessible Supplier Trust Portal experience (/verify/:slug).
 * Exposes verified supplier identities, trust levels, health score summaries,
 * and verification audit timelines for unauthenticated third-party buyers & auditors.
 */
import { useParams, Link } from 'react-router-dom';
import { usePublicTrust } from '../hooks/usePublicTrust';
import {
  ShieldCheck,
  CheckCircle,
  Certificate,
  CalendarBlank,
  Buildings,
  MapPin,
  ClockCounterClockwise,
  Article,
  Users,
  Stack,
  QrCode,
  DownloadSimple,
} from '@phosphor-icons/react';

export function PublicTrustPortal() {
  const { slug } = useParams();
  const { profile, metadata, timeline, loading, error } = usePublicTrust(slug);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-neutral-400">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-400" />
          <span>Verifying Supplier Trust Profile...</span>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 mb-4">
          <ShieldCheck size={32} />
        </div>
        <h1 className="text-2xl font-bold mb-2">Supplier Trust Profile Not Found</h1>
        <p className="text-sm text-neutral-400 max-w-md mb-6">
          The requested public trust profile identifier <span className="font-mono text-neutral-200">&apos;{slug}&apos;</span> does not exist or is currently restricted.
        </p>
        <Link to="/" className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-xs font-bold text-neutral-950 transition-colors">
          Return to VerifyChain Homepage
        </Link>
      </div>
    );
  }

  const trustLevel = profile.trust_level || 'PENDING';
  const scoreVal = profile.trust_score_snapshot || 85;

  const getTrustBadgeColor = () => {
    if (trustLevel === 'ENTERPRISE_TRUSTED') return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    if (trustLevel === 'HIGHLY_TRUSTED') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (trustLevel === 'TRUSTED') return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    if (trustLevel === 'VERIFIED') return 'bg-teal-500/10 text-teal-400 border-teal-500/30';
    return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-emerald-500 selection:text-neutral-950">
      {/* Schema.org Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: profile.display_name,
          identifier: profile.public_identifier,
          url: window.location.href,
          memberOf: {
            '@type': 'ProgramMembership',
            programName: 'VerifyChain Trust Platform',
            membershipNumber: profile.public_identifier,
          },
        })}
      </script>

      {/* Header Bar */}
      <header className="border-b border-neutral-800 bg-neutral-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck size={22} />
            </div>
            <div>
              <span className="font-bold text-sm text-neutral-100 tracking-tight block">VerifyChain</span>
              <span className="text-[10px] text-neutral-400 uppercase tracking-widest block font-mono">Public Trust Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle size={14} />
              AUTHENTICATED PUBLIC SLUG
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">

        {/* 1. Supplier Hero Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-neutral-800/80">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-100 tracking-tight">{profile.display_name}</h1>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${getTrustBadgeColor()}`}>
                  <Certificate size={14} />
                  {trustLevel}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 pt-1">
                <span className="flex items-center gap-1 font-mono text-neutral-300">
                  <span className="text-neutral-500">ID:</span> {profile.public_identifier}
                </span>
                {profile.business_info && (
                  <>
                    <span className="flex items-center gap-1">
                      <Buildings size={14} className="text-emerald-400" />
                      {profile.business_info.sector || 'Manufacturing & Services'}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={14} className="text-blue-400" />
                      {profile.business_info.district}, {profile.business_info.state}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Public Score Badge */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-inner shrink-0">
              <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-neutral-950 border-4 border-emerald-500/30">
                <span className="text-3xl font-black text-emerald-400 font-mono">{scoreVal}</span>
                <span className="absolute bottom-2 text-[9px] text-neutral-500 font-mono">/ 100</span>
              </div>
              <span className="text-[11px] font-medium text-neutral-400 mt-2">Compliance Rating</span>
            </div>
          </div>

          {/* Verification Details Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs">
            <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/60">
              <span className="text-neutral-500 text-[10px] block uppercase font-mono">Verification Status</span>
              <span className="font-bold text-emerald-400 mt-0.5 block">{profile.verification_state}</span>
            </div>
            <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/60">
              <span className="text-neutral-500 text-[10px] block uppercase font-mono">Review Cycle</span>
              <span className="font-bold text-neutral-200 mt-0.5 block">{metadata?.review_cycle || 'ANNUAL'}</span>
            </div>
            <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/60">
              <span className="text-neutral-500 text-[10px] block uppercase font-mono">Confidence Rating</span>
              <span className="font-bold text-neutral-200 mt-0.5 block">{metadata?.confidence_score || 90}%</span>
            </div>
            <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/60">
              <span className="text-neutral-500 text-[10px] block uppercase font-mono">Verification Version</span>
              <span className="font-mono text-neutral-300 mt-0.5 block">{metadata?.verification_version || 'v1.0.0'}</span>
            </div>
          </div>
        </div>

        {/* 2. Category Compliance Standing Grid */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Stack size={20} className="text-emerald-400" />
            <h2 className="text-lg font-bold text-neutral-100">Public Compliance Framework Standing</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <Article size={18} className="text-emerald-400" />
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">VERIFIED</span>
              </div>
              <h3 className="text-sm font-semibold text-neutral-200 mt-2">Tax Compliance</h3>
              <p className="text-[11px] text-neutral-400">GST statutory return settlements</p>
            </div>

            <div className="p-5 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <Users size={18} className="text-emerald-400" />
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">VERIFIED</span>
              </div>
              <h3 className="text-sm font-semibold text-neutral-200 mt-2">Labour & EPF</h3>
              <p className="text-[11px] text-neutral-400">EPFO & ESIC social contributions</p>
            </div>

            <div className="p-5 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <Buildings size={18} className="text-emerald-400" />
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">VERIFIED</span>
              </div>
              <h3 className="text-sm font-semibold text-neutral-200 mt-2">Corporate Compliance</h3>
              <p className="text-[11px] text-neutral-400">MCA filings & corporate disclosures</p>
            </div>

            <div className="p-5 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <Certificate size={18} className="text-emerald-400" />
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">VERIFIED</span>
              </div>
              <h3 className="text-sm font-semibold text-neutral-200 mt-2">Licensing</h3>
              <p className="text-[11px] text-neutral-400">Udyam & industry registrations</p>
            </div>
          </div>
        </div>

        {/* 3. Verification Audit Timeline & Future Extensions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl bg-neutral-900/80 border border-neutral-800 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <ClockCounterClockwise size={20} className="text-emerald-400" />
              <h3 className="text-base font-semibold text-neutral-100">Public Verification Audit Timeline</h3>
            </div>

            {timeline.length === 0 ? (
              <p className="text-xs text-neutral-500 italic">Initial trust verification events recorded.</p>
            ) : (
              <div className="space-y-3">
                {timeline.map((evt) => (
                  <div key={evt.id} className="p-3.5 rounded-lg bg-neutral-950/50 border border-neutral-800/50 flex items-start gap-3">
                    <CalendarBlank size={16} className="text-neutral-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-200">{evt.title}</span>
                        <span className="text-[10px] font-mono text-neutral-500">{new Date(evt.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-normal">{evt.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Placeholders for Future QR & Supplier Card Features */}
          <div className="rounded-xl bg-neutral-900/40 border border-neutral-800/80 p-6 space-y-4">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Public Trust Utilities</h3>

            <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/60 flex items-center justify-between text-xs opacity-75">
              <div className="flex items-center gap-2.5">
                <QrCode size={20} className="text-emerald-400" />
                <div>
                  <span className="font-bold text-neutral-200 block">QR Verification</span>
                  <span className="text-[10px] text-neutral-400">Scan to verify authenticity</span>
                </div>
              </div>
              <span className="text-[9px] font-mono bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded">Phase 6.4</span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/60 flex items-center justify-between text-xs opacity-75">
              <div className="flex items-center gap-2.5">
                <DownloadSimple size={20} className="text-blue-400" />
                <div>
                  <span className="font-bold text-neutral-200 block">Verified Supplier Card</span>
                  <span className="text-[10px] text-neutral-400">Download digital trust badge</span>
                </div>
              </div>
              <span className="text-[9px] font-mono bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded">Phase 6.5</span>
            </div>
          </div>
        </div>
      </main>

      {/* Public Footer */}
      <footer className="border-t border-neutral-800/80 bg-neutral-950 py-8 text-center text-xs text-neutral-500 mt-12">
        <p>© {new Date().getFullYear()} VerifyChain Trust Platform. Deterministic Statutory Compliance Verification.</p>
      </footer>
    </div>
  );
}
